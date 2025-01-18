from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from index import stocks_collection

stocks_bp = Blueprint('stocks', __name__)

@stocks_bp.route('/watchlist', methods=['GET'])
@jwt_required()
def get_watchlist():
    email = get_jwt_identity()
    watchlist = stocks_collection.find({'user': email})
    return jsonify(list(watchlist)), 200

@stocks_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    data = request.json
    email = get_jwt_identity()
    stock = {
        'user': email,
        'ticker': data.get('ticker'),
        'name': data.get('name'),
        'price': data.get('price')
    }
    stocks_collection.insert_one(stock)
    return jsonify({'message': 'Stock added to watchlist'}), 201

@stocks_bp.route('/remove', methods=['POST'])
@jwt_required()
def remove_from_watchlist():
    data = request.json
    email = get_jwt_identity()
    stocks_collection.delete_one({'user': email, 'ticker': data.get('ticker')})
    return jsonify({'message': 'Stock removed from watchlist'}), 200
