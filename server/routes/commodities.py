from flask import Blueprint, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

commodities_bp = Blueprint('commodities', __name__)

# CME Group API Configuration
CME_API_BASE_URL = "https://api.cmegroup.com"
CME_API_KEY = os.getenv("CME_API_KEY")  # Load your API key from the .env file

# Endpoint mappings for ETFs and Commodities
ETF_ENDPOINT = f"{CME_API_BASE_URL}/etfs/v1"
COMMODITY_ENDPOINT = f"{CME_API_BASE_URL}/futures/v1/quotes"

# Mock data for development purposes
DEFAULT_COMMODITIES = [
    {"name": "Gold", "symbol": "GC"},
    {"name": "Silver", "symbol": "SI"},
    {"name": "Copper", "symbol": "HG"},
    {"name": "Crude Oil", "symbol": "CL"},
    {"name": "Natural Gas", "symbol": "NG"},
]


@commodities_bp.route('/commodities/live-prices', methods=['GET'])
def get_live_prices():
    """
    Fetch live ETF and commodity prices from the CME Group API.
    """
    try:
        # Fetch ETF data
        etf_response = requests.get(
            ETF_ENDPOINT,
            headers={"Authorization": f"Bearer {CME_API_KEY}"}
        )
        etf_response.raise_for_status()
        etf_data = etf_response.json()

        # Fetch Commodity data
        commodity_prices = []
        for commodity in DEFAULT_COMMODITIES:
            response = requests.get(
                f"{COMMODITY_ENDPOINT}?symbol={commodity['symbol']}",
                headers={"Authorization": f"Bearer {CME_API_KEY}"}
            )
            response.raise_for_status()
            data = response.json()

            # Extract price from the API response
            commodity_prices.append({
                "name": commodity["name"],
                "price": data["quotes"][0]["last"] if "quotes" in data and data["quotes"] else "N/A"
            })

        return jsonify({
            "etfs": etf_data.get("data", []),
            "commodities": commodity_prices
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch data from CME Group API", "details": str(e)}), 500
