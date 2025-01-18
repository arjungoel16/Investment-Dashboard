from flask import Blueprint, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

forex_bp = Blueprint('forex', __name__)

# CurrencyLayer API Configuration
CURRENCYLAYER_API_URL = "http://api.currencylayer.com/"
CURRENCYLAYER_API_KEY = os.getenv("CURRENCYLAYER_API_KEY")  # Load your API key from .env file

# Default currencies
DEFAULT_CURRENCIES = ["EUR", "JPY", "INR", "GBP", "RUB"]  # Compared to USD


@forex_bp.route('/forex/live-rates', methods=['GET'])
def get_live_rates():
    """
    Fetch live foreign exchange rates from CurrencyLayer API.
    """
    try:
        # Fetch exchange rates for default currencies
        response = requests.get(
            f"{CURRENCYLAYER_API_URL}/live",
            params={"access_key": CURRENCYLAYER_API_KEY, "currencies": ",".join(DEFAULT_CURRENCIES), "source": "USD"},
        )
        response.raise_for_status()
        data = response.json()

        # Check for errors in API response
        if not data.get("success"):
            raise Exception(data.get("error", {}).get("info", "Unknown error"))

        # Parse the response data
        rates = [
            {"symbol": f"{currency}/USD", "rate": data["quotes"].get(f"USD{currency}", "N/A")}
            for currency in DEFAULT_CURRENCIES
        ]

        return jsonify(rates), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch live rates", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@forex_bp.route('/forex/news', methods=['GET'])
def get_forex_news():
    """
    Fetch news articles related to currencies.
    """
    try:
        # Replace with your preferred API for news (e.g., Bloomberg, NewsAPI)
        NEWS_API_URL = "https://api.example.com/news"
        response = requests.get(
            NEWS_API_URL,
            params={"query": "currencies, forex, dollar, euro, yen"},
            headers={"Authorization": f"Bearer {CURRENCYLAYER_API_KEY}"}
        )
        response.raise_for_status()
        data = response.json()

        # Parse the news data
        articles = [
            {
                "title": article.get("title", "No Title"),
                "summary": article.get("description", "No Summary"),
                "url": article.get("url", "#"),
                "releaseDate": article.get("publishedAt", "Unknown Date"),
            }
            for article in data.get("articles", [])
        ]

        return jsonify(articles), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch forex news", "details": str(e)}), 500
