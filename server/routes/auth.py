from flask import Blueprint, request, jsonify, url_for
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from pymongo import MongoClient
import os

# Setup Flask and Flask-Mail
auth_bp = Blueprint("auth", __name__)
mail = Mail()
serializer = URLSafeTimedSerializer(os.getenv("SECRET_KEY"))

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["investment_dashboard"]
users_collection = db["users"]

@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Sign up a new user and send a verification email."""
    data = request.json
    email = data.get("email")
    password = data.get("password")  # Add password hashing here

    # Check if the user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    # Save user to database with unverified status
    user = {"email": email, "password": password, "verified": False}
    users_collection.insert_one(user)

    # Send verification email
    token = serializer.dumps(email, salt="email-verify")
    verification_url = url_for("auth.verify_email", token=token, _external=True)
    send_verification_email(email, verification_url)

    return jsonify({"message": "Signup successful! Please check your email to verify your account."}), 201

@auth_bp.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    """Verify the user's email address."""
    try:
        email = serializer.loads(token, salt="email-verify", max_age=3600)  # Token valid for 1 hour
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "Invalid token"}), 400

        # Update the user to verified
        users_collection.update_one({"email": email}, {"$set": {"verified": True}})
        return jsonify({"message": "Email verified! You can now sign in."}), 200
    except Exception as e:
        return jsonify({"error": "Token expired or invalid"}), 400

def send_verification_email(email, verification_url):
    """Send verification email to the user."""
    msg = Message("Verify Your Email - Investment Dashboard", recipients=[email])
    msg.body = f"Please verify your email address by clicking the link below:\n\n{verification_url}\n\nIf you did not sign up, please ignore this email."
    mail.send(msg)
