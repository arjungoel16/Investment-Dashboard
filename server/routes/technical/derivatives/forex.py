from flask import Blueprint, jsonify
from dotenv import load_dotenv
import os
import blpapi

# Load environment variables
load_dotenv()

forex_bp = Blueprint('forex', __name__)

# Bloomberg API Configuration
BLOOMBERG_HOST = os.getenv("BLOOMBERG_API_HOST", "localhost")
BLOOMBERG_PORT = int(os.getenv("BLOOMBERG_API_PORT", 8194))

DEFAULT_CURRENCIES = ["EURUSD", "JPYUSD", "GBPUSD", "INRUSD", "RUBUSD"]


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
    Fetch live forex rates from Bloomberg.
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
                        symbol = security.getElementAsString("security")
                        rate = security.getElement("fieldData").getElementAsFloat("PX_LAST")
                        rates.append({"symbol": symbol.replace(" Curncy", ""), "rate": rate})
            if event.eventType() == blpapi.Event.RESPONSE:
                break

        return jsonify({"forex": rates}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forex_bp.route('/forex/news', methods=['GET'])
def get_forex_news():
    """
    Fetch news articles related to currencies using Bloomberg API.
    """
    try:
        session = create_bloomberg_session()
        service = session.getService("//blp/refdata")
        request = service.createRequest("NewsSearchRequest")

        # Set query parameters
        request.set("query", "currencies, forex, dollar, euro, yen")
        request.set("maxResults", 10)  # Adjust the number of articles as needed

        # Send the request
        session.sendRequest(request)

        # Process response
        articles = []
        while True:
            event = session.nextEvent()
            for msg in event:
                if msg.messageType() == "NewsSearchResponse":
                    for article in msg.getElement("articles").values():
                        articles.append({
                            "title": article.getElementAsString("headline"),
                            "summary": article.getElementAsString("summary", "N/A"),
                            "url": article.getElementAsString("url", "#"),
                            "releaseDate": article.getElementAsString("published", "Unknown Date")
                        })
            if event.eventType() == blpapi.Event.RESPONSE:
                break

        # Sort articles by release date (descending order)
        articles = sorted(articles, key=lambda x: x['releaseDate'], reverse=True)

        return jsonify({"articles": articles}), 200

    except Exception as e:
        return jsonify({"error": "Failed to fetch forex news", "details": str(e)}), 500
