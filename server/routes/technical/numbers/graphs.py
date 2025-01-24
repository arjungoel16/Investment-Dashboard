from flask import Blueprint, request, jsonify
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import blpapi

# Load environment variables
load_dotenv()

graph_bp = Blueprint('graph', __name__)

# Bloomberg API Configuration
BLOOMBERG_HOST = os.getenv("BLOOMBERG_API_HOST", "localhost")
BLOOMBERG_PORT = int(os.getenv("BLOOMBERG_API_PORT", 8194))


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


def calculate_date_range(range):
    """
    Calculate start and end dates based on the range.
    """
    today = datetime.today()
    if range == "1D":
        start_date = today - timedelta(days=1)
    elif range == "5D":
        start_date = today - timedelta(days=5)
    elif range == "1M":
        start_date = today - timedelta(days=30)
    elif range == "6M":
        start_date = today - timedelta(days=180)
    elif range == "YTD":
        start_date = datetime(today.year, 1, 1)
    elif range == "1Y":
        start_date = today - timedelta(days=365)
    elif range == "5Y":
        start_date = today - timedelta(days=5 * 365)
    else:
        start_date = today - timedelta(days=10 * 365)  # Default for "All"

    return start_date.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")


@graph_bp.route('/stocks/graph-data', methods=['GET'])
def get_graph_data():
    """
    Fetch historical stock data for graphing using Bloomberg API.
    """
    ticker = request.args.get('ticker')
    range = request.args.get('range', '1D')

    session = create_bloomberg_session()
    service = session.getService("//blp/refdata")
    request = service.createRequest("HistoricalDataRequest")

    request.getElement("securities").appendValue(f"{ticker} US Equity")
    fields = ["PX_LAST", "PX_HIGH", "PX_LOW", "PX_VOLUME", "BOLLINGER", "RSI"]
    for field in fields:
        request.getElement("fields").appendValue(field)

    start_date, end_date = calculate_date_range(range)
    request.set("startDate", start_date.replace("-", ""))
    request.set("endDate", end_date.replace("-", ""))

    session.sendRequest(request)
    data = []
    while True:
        event = session.nextEvent()
        for msg in event:
            if msg.messageType() == "HistoricalDataResponse":
                for point in msg.getElement("securityData").getElement("fieldData").values():
                    data.append({
                        "date": point.getElementAsString("date"),
                        "price": point.getElementAsFloat("PX_LAST"),
                        "high": point.getElementAsFloat("PX_HIGH"),
                        "low": point.getElementAsFloat("PX_LOW"),
                        "volume": point.getElementAsFloat("PX_VOLUME"),
                        "bollinger": point.getElementAsFloat("BOLLINGER"),
                        "rsi": point.getElementAsFloat("RSI")
                    })
        if event.eventType() == blpapi.Event.RESPONSE:
            break

    return jsonify({"ticker": ticker, "data": data}), 200
