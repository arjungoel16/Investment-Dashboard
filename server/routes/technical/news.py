from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

news_bp = Blueprint('news', __name__)

# NYT API Configuration
NYT_API_KEY = os.getenv('NYT_API_KEY')
NYT_API_URL = "https://api.nytimes.com/svc/search/v2/articlesearch.json"


def fetch_news(query, max_results, page):
    """
    Fetch news articles from the New York Times API with pagination.
    :param query: The search query (e.g., 'election').
    :param max_results: The maximum number of articles to fetch per page.
    :param page: The page number to fetch.
    :return: A list of news articles with headline, snippet, url, and published date.
    """
    try:
        # Make a GET request to the NYT API
        response = requests.get(
            NYT_API_URL,
            params={
                'q': query,
                'api-key': NYT_API_KEY,
                'page': page  # Add pagination
            }
        )
        response.raise_for_status()
        data = response.json()

        # Parse articles
        articles = []
        for doc in data.get('response', {}).get('docs', []):
            articles.append({
                'headline': doc.get('headline', {}).get('main', 'No headline'),
                'snippet': doc.get('snippet', 'No snippet available'),
                'url': doc.get('web_url', '#'),
                'published': doc.get('pub_date', 'Unknown date')
            })

        # Limit the number of articles returned
        return sorted(articles, key=lambda x: x['published'], reverse=True)[:max_results]

    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching news: {e}")


@news_bp.route('/global-news', methods=['GET'])
def get_global_news():
    """
    Fetch global news articles using the NYT API with pagination.
    """
    query = request.args.get('query', 'global markets')
    max_results = int(request.args.get('maxResults', 10))
    page = int(request.args.get('page', 0))  # Default to the first page
    try:
        news_articles = fetch_news(query, max_results, page)
        return jsonify({'articles': news_articles, 'page': page}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@news_bp.route('/us-news', methods=['GET'])
def get_us_news():
    """
    Fetch US-specific news articles using the NYT API with pagination.
    """
    query = request.args.get('query', 'US markets')
    max_results = int(request.args.get('maxResults', 10))
    page = int(request.args.get('page', 0))  # Default to the first page
    try:
        news_articles = fetch_news(query, max_results, page)
        return jsonify({'articles': news_articles, 'page': page}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
