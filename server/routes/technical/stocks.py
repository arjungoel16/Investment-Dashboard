from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from index import stocks_collection
import os
import blpapi

# Bloomberg API configuration
BLOOMBERG_HOST = os.getenv("BLOOMBERG_API_HOST", "localhost")
BLOOMBERG_PORT = int(os.getenv("BLOOMBERG_API_PORT", 8194))

# Initialize the blueprint
stocks_bp = Blueprint('stocks', __name__)

# Helper function to create a Bloomberg session
def create_bloomberg_session():
    session_options = blpapi.SessionOptions()
    session_options.setServerHost(BLOOMBERG_HOST)
    session_options.setServerPort(BLOOMBERG_PORT)

    session = blpapi.Session(session_options)
    if not session.start():
        raise Exception("Failed to start Bloomberg session.")
    if not session.openService("//blp/refdata"):
        raise Exception("Failed to open Bloomberg reference data service.")
    return session


@stocks_bp.route('/watchlist', methods=['GET'])
@jwt_required()
def get_watchlist():
    """
    Fetch the user's watchlist and retrieve live stock prices using Bloomberg API.
    """
    email = get_jwt_identity()
    watchlist = list(stocks_collection.find({'user': email}))

    session = create_bloomberg_session()
    service = session.getService("//blp/refdata")

    for stock in watchlist:
        ticker = stock.get('ticker')
        try:
            # Create a Bloomberg API request
            request = service.createRequest("ReferenceDataRequest")
            request.getElement("securities").appendValue(f"{ticker} US Equity")
            request.getElement("fields").appendValue("PX_LAST")

            # Send the request and process the response
            session.sendRequest(request)
            while True:
                event = session.nextEvent()
                for msg in event:
                    if msg.messageType() == "ReferenceDataResponse":
                        data = msg.getElement("securityData").getValue(0)
                        stock['live_price'] = data.getElement("fieldData").getElementAsFloat("PX_LAST")
                if event.eventType() == blpapi.Event.RESPONSE:
                    break
        except Exception as e:
            stock['live_price'] = None  # Handle API errors gracefully

    return jsonify(watchlist), 200


@stocks_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    """
    Add a stock to the user's watchlist.
    """
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
    """
    Remove a stock from the user's watchlist.
    """
    data = request.json
    email = get_jwt_identity()
    stocks_collection.delete_one({'user': email, 'ticker': data.get('ticker')})
    return jsonify({'message': 'Stock removed from watchlist'}), 200


@stocks_bp.route('/live-price', methods=['GET'])
def get_live_price():
    """
    Fetch the live price for a specific stock ticker using Bloomberg API.
    """
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker is required"}), 400

    try:
        session = create_bloomberg_session()
        service = session.getService("//blp/refdata")
        request = service.createRequest("ReferenceDataRequest")
        request.getElement("securities").appendValue(f"{ticker} US Equity")
        request.getElement("fields").appendValue("PX_LAST")

        session.sendRequest(request)
        while True:
            event = session.nextEvent()
            for msg in event:
                if msg.messageType() == "ReferenceDataResponse":
                    data = msg.getElement("securityData").getValue(0)
                    return jsonify({
                        "ticker": ticker,
                        "current_price": data.getElement("fieldData").getElementAsFloat("PX_LAST")
                    }), 200
            if event.eventType() == blpapi.Event.RESPONSE:
                break
    except Exception as e:
        return jsonify({"error": "Failed to fetch live price", "details": str(e)}), 500
