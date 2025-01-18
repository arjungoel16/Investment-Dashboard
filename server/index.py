from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from routes.auth import auth_bp
from routes.stocks import stocks_bp
from routes.user import user_bp
import os
from dotenv import load_dotenv
from routes.commodities import commodities_bp

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to Flask!"

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'Arj-stock-commod-news' 
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# MongoDB Connection
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
mongo_db_name = os.getenv('MONGO_DB_NAME', 'Stock_Portfolio')

client = MongoClient(mongo_uri)
db = client[mongo_db_name]
users_collection = db['users']
stocks_collection = db['stocks']

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(stocks_bp, url_prefix='/stocks')
app.register_blueprint(user_bp, url_prefix='/user')


# Register blueprints
app.register_blueprint(commodities_bp)

if __name__ == '__main__':
    app.run(port=5000, debug=True)

if __name__ == '__main__':
    app.run(debug=True)
