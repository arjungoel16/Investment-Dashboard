from flask import Blueprint, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

forex_bp = Blueprint('forex', __name__)

# CurrencyLayer API Configuration
CURRENCYLAYER_API_URL = "http://api.currencylayer.com/live"
CURRENCYLAYER_API_KEY = os.getenv("CURRENCYLAYER_API_KEY")  # Load API key from .env

# Default currencies
DEFAULT_CURRENCIES = ["EUR", "JPY", "INR", "GBP", "RUB"]


@forex_bp.route('/forex/live-rates', methods=['GET'])
def get_live_rates():
    """
    Fetch live foreign exchange rates for default currencies.
    """
    try:
        # API request for live rates
        response = requests.get(
            CURRENCYLAYER_API_URL,
            params={
                "access_key": CURRENCYLAYER_API_KEY,
                "currencies": ",".join(DEFAULT_CURRENCIES),
                "source": "USD"
            },
        )
        response.raise_for_status()
        data = response.json()

        # Check for errors in the API response
        if not data.get("success"):
            raise Exception(data.get("error", {}).get("info", "Unknown error"))

        # Parse the response to format currency pairs
        rates = [
            {"symbol": f"{currency}/USD", "rate": data["quotes"].get(f"USD{currency}", "N/A")}
            for currency in DEFAULT_CURRENCIES
        ]

        return jsonify(rates), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch live rates", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
