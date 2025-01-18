from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

graph_bp = Blueprint('graph', __name__)

# CME API Configuration
CME_API_URL = "https://api.cmegroup.com/v1/quotes"
CME_API_KEY = os.getenv("CME_API_KEY")


def calculate_date_range(range):
    """
    Calculate start and end dates based on the range.
    """
    from datetime import datetime, timedelta

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
    Fetch stock data from CME Group API for a specific ticker and date range.
    """
    ticker = request.args.get('ticker')
    range = request.args.get('range', '1M')  # Default to 1 month if no range is provided

    if not ticker:
        return jsonify({"error": "Ticker symbol is required"}), 400

    try:
        # Calculate the date range based on the requested range (e.g., 1D, 5D, 1M)
        start_date, end_date = calculate_date_range(range)

        # Make the API request to CME Group
        response = requests.get(
            CME_API_URL,
            params={
                "symbols": ticker,
                "start_date": start_date,  # Include calculated start date
                "end_date": end_date,      # Include calculated end date
                "apikey": CME_API_KEY
            },
        )
        response.raise_for_status()

        # Parse the response
        data = response.json()
        price_data = [
            entry["price"] for entry in data.get("data", {}).get("quotes", [])
        ]

        return jsonify({"ticker": ticker, "data": price_data}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch data from CME Group API", "details": str(e)}), 500
