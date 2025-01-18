from flask import Blueprint, request, jsonify
from index import users_collection

user_bp = Blueprint('user', __name__)

@user_bp.route('/forgot-username', methods=['POST'])
def forgot_username():
    email = request.json.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'No account associated with this email'}), 404

    return jsonify({'message': f'Your username is: {email}'}), 200

@user_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required'}), 400

    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'No account associated with this email'}), 404

    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    users_collection.update_one({'email': email}, {'$set': {'password': hashed_password}})
    return jsonify({'message': 'Password reset successful'}), 200
