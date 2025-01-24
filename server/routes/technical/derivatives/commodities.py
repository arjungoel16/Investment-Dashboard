from flask import Blueprint, jsonify
from dotenv import load_dotenv
import os
import blpapi

# Load environment variables
load_dotenv()

commodities_bp = Blueprint('commodities', __name__)

# Bloomberg API Configuration
BLOOMBERG_HOST = os.getenv("BLOOMBERG_API_HOST", "localhost")
BLOOMBERG_PORT = int(os.getenv("BLOOMBERG_API_PORT", 8194))

# Define default commodities
DEFAULT_COMMODITIES = [
    {"name": "Gold", "symbol": "XAUUSD"},
    {"name": "Silver", "symbol": "XAGUSD"},
    {"name": "Copper", "symbol": "HG1"},
    {"name": "Crude Oil", "symbol": "CL1"},
    {"name": "Natural Gas", "symbol": "NG1"}
]


def create_bloomberg_session():
    """
    Create and return a Bloomberg session for API communication.
    """
    session_options = blpapi.SessionOptions()
    session_options.setServerHost(BLOOMBERG_HOST)
    session_options.setServerPort(BLOOMBERG_PORT)

    session = blpapi.Session(session_options)
    if not session.start():
        raise Exception("Failed to start Bloomberg session.")
    if not session.openService("//blp/refdata"):
        raise Exception("Failed to open Bloomberg reference data service.")
    return session


@commodities_bp.route('/commodities/live-prices', methods=['GET'])
def get_live_prices():
    """
    Fetch live commodity prices from Bloomberg.
    """
    try:
        session = create_bloomberg_session()
        service = session.getService("//blp/refdata")
        request = service.createRequest("ReferenceDataRequest")

        # Add commodity symbols
        for commodity in DEFAULT_COMMODITIES:
            request.getElement("securities").appendValue(f"{commodity['symbol']} Comdty")

        # Request last price field
        request.getElement("fields").appendValue("PX_LAST")

        session.sendRequest(request)

        # Process response
        commodity_prices = []
        while True:
            event = session.nextEvent()
            for msg in event:
                if msg.messageType() == "ReferenceDataResponse":
                    for security in msg.getElement("securityData").values():
                        symbol = security.getElementAsString("security")
                        price = security.getElement("fieldData").getElementAsFloat("PX_LAST")
                        commodity_prices.append({
                            "name": next((c['name'] for c in DEFAULT_COMMODITIES if c['symbol'] in symbol), symbol),
                            "price": price
                        })
            if event.eventType() == blpapi.Event.RESPONSE:
                break

        return jsonify({"commodities": commodity_prices}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch commodity prices", "details": str(e)}), 500
