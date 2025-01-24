from flask import Blueprint, jsonify
import os
from dotenv import load_dotenv
import blpapi

# Load environment variables
load_dotenv()

forex_bp = Blueprint('forex', __name__)

# Bloomberg API Configuration
BLOOMBERG_HOST = os.getenv("BLOOMBERG_API_HOST", "localhost")
BLOOMBERG_PORT = int(os.getenv("BLOOMBERG_API_PORT", 8194))

# Default currencies
DEFAULT_CURRENCIES = ["EURUSD", "JPYUSD", "INRUSD", "GBPUSD", "RUBUSD"]


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


@forex_bp.route('/forex/live-rates', methods=['GET'])
def get_live_rates():
    """
    Fetch live foreign exchange rates for default currencies using Bloomberg API.
    """
    try:
        session = create_bloomberg_session()
        service = session.getService("//blp/refdata")
        request = service.createRequest("ReferenceDataRequest")

        # Add currency pairs
        for pair in DEFAULT_CURRENCIES:
            request.getElement("securities").appendValue(f"{pair} Curncy")

        request.getElement("fields").appendValue("PX_LAST")
        session.sendRequest(request)

        # Process response
        rates = []
        while True:
            event = session.nextEvent()
            for msg in event:
                if msg.messageType() == "ReferenceDataResponse":
                    for security in msg.getElement("securityData").values():
                        symbol = security.getElementAsString("security").replace(" Curncy", "")
                        rate = security.getElement("fieldData").getElementAsFloat("PX_LAST")
                        rates.append({"symbol": symbol, "rate": rate})
            if event.eventType() == blpapi.Event.RESPONSE:
                break

        return jsonify({"forex": rates}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch live rates", "details": str(e)}), 500
