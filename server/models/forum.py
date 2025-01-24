from flask import Blueprint, jsonify, request
from pymongo import MongoClient
from uuid import uuid4
import os

forum_bp = Blueprint("forum", __name__)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["investment_dashboard"]
forum_collection = db["forum"]

@forum_bp.route("/forum/questions", methods=["GET"])
def get_questions():
    """Retrieve all questions and responses."""
    questions = list(forum_collection.find({}, {"_id": 0}))
    return jsonify(questions), 200

@forum_bp.route("/forum/question", methods=["POST"])
def post_question():
    """Post a new question."""
    data = request.json
    question_id = str(uuid4())
    question = {
        "id": question_id,
        "question": data.get("question"),
        "responses": []
    }
    forum_collection.insert_one(question)
    return jsonify({"message": "Question posted successfully!", "id": question_id}), 201

@forum_bp.route("/forum/response/<question_id>", methods=["POST"])
def post_response(question_id):
    """Post a response to a question."""
    data = request.json
    response = {
        "id": str(uuid4()),
        "response": data.get("response")
    }
    forum_collection.update_one({"id": question_id}, {"$push": {"responses": response}})
    return jsonify({"message": "Response posted successfully!"}), 201
