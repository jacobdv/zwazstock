# Import dependencies.
from flask import Flask, render_template, redirect, url_for, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from census import Census
import pymongo
import requests
from config import finnhub_API_KEY
import datetime

# List of stock dictionaries.
zwazStocks = [{'symbol': 'AAL','shares': 8 },{'symbol': 'AAPL','shares': 2.003},{'symbol': 'AGRO','shares': 6},{'symbol': 'ATVI','shares': 2.01 },{'symbol': 'DIN','shares': 2},{'symbol': 'F','shares': 5},{'symbol': 'HEXO','shares': 8},{'symbol': 'LAZR','shares': 4},{'symbol': 'NKE','shares': 11.092},{'symbol': 'OPEN','shares': 5},{'symbol': 'SELB','shares': 20.32},{'symbol': 'VZ','shares': 0.828505},{'symbol': 'ZYNE','shares': 1},]

# Create an instance of Flask.
app = Flask(__name__)
CORS(app)

# Creating the database.
client = pymongo.MongoClient('mongodb://localhost:27017/')
zwazStocksDB = client['ZwazStocks']

# Connections to the MongoDB database.
app.config["DEBUG"] = True
app.config["MONGO_URI"] = "mongodb://localhost:27017/ZwazStocks"
mongo = PyMongo(app)

# Creating overview collection.
collection = zwazStocksDB['Share Overview']
# Clears the collection for inputting the updated info.
collection.delete_many({})


# Adding overview information for each stock.
for stock in zwazStocks:
    stockItems = stock.items()
    for key, value in stockItems:
        if key == 'symbol':
            symbol = value
        elif key == 'shares':
            shares = value
    # Inserts share information for each stock.
    x = collection.insert_one({ 'symbol': symbol, 'shares': shares })
    
    # API request for each stock.
    response = requests.get(f'https://finnhub.io/api/v1/quote?symbol={symbol}&token={finnhub_API_KEY}')
    if response.status_code == 200:
        stockDict = response.json()
        stockDict = {
            'meta': stock,
            'prices': {
                'open': stockDict['o'],
                'current': stockDict['c'],
                'high': stockDict['h'],
                'low': stockDict['l'],
                'previousClose': stockDict['pc']
            },
            'date': (datetime.datetime.fromtimestamp(stockDict['t']).strftime('%Y-%m-%d')),
        }
        print(stockDict)
    else:
        print(f'There seems to have been an error with {symbol}')

# Home route that displays index.html content.
@app.route("/")
def index():
    return render_template("index.html")

# Do the thing. (:
if __name__ == "__main__":
    app.run(debug=True)
