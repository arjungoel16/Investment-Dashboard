from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
import blpapi

# Load environment variables
load_dotenv()

news_bp = Blueprint('news', __name__)

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


def fetch_news(query, max_results=10):
    """
    Fetch news articles from Bloomberg API.
    :param query: The search query (e.g., 'global markets').
    :param max_results: The maximum number of articles to fetch.
    :return: A list of news articles.
    """
    session = create_bloomberg_session()
    service = session.getService("//blp/refdata")
    request = service.createRequest("NewsSearchRequest")

    request.set("query", query)
    request.set("maxResults", max_results)

    session.sendRequest(request)
    articles = []
    while True:
        event = session.nextEvent()
        for msg in event:
            if msg.messageType() == "NewsSearchResponse":
                for article in msg.getElement("articles").values():
                    articles.append({
                        "headline": article.getElementAsString("headline"),
                        "summary": article.getElementAsString("summary", "N/A"),
                        "url": article.getElementAsString("url", "#"),
                        "published": article.getElementAsString("published", "Unknown Date")
                    })
        if event.eventType() == blpapi.Event.RESPONSE:
            break

    return sorted(articles, key=lambda x: x['published'], reverse=True)


@news_bp.route('/global-news', methods=['GET'])
def get_global_news():
    """
    Fetch global news articles using Bloomberg API.
    """
    query = "global markets"
    max_results = int(request.args.get('maxResults', 10))
    try:
        articles = fetch_news(query, max_results)
        return jsonify({'articles': articles}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@news_bp.route('/us-news', methods=['GET'])
def get_us_news():
    """
    Fetch US-specific news articles using Bloomberg API.
    """
    query = request.args.get('query', 'US markets')
    max_results = int(request.args.get('maxResults', 10))
    try:
        articles = fetch_news(query, max_results)
        return jsonify({'articles': articles}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
