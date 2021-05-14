# Import dependencies.
from flask import Flask, render_template, redirect, url_for, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from census import Census
import pymongo

# Additional tools for API routes.
import json
from bson import json_util
from bson.json_util import dumps

# Create an instance of Flask.
app = Flask(__name__)
CORS(app)

zwazStocks = [
    {
        'symbol': 'AAL',
        'shares': 8
    },{
        'symbol': 'AAPL',
        'shares': 2.003
    },{
        'symbol': 'AGRO',
        'shares': 6
    },{
        'symbol': 'ATVI',
        'shares': 2.01
    },{
        'symbol': 'DIN',
        'shares': 2
    },{
        'symbol': 'F',
        'shares': 5
    },{
        'symbol': 'HEXO',
        'shares': 8
    },{
        'symbol': 'LAZR',
        'shares': 4
    },{
        'symbol': 'NKE',
        'shares': 11.092
    },{
        'symbol': 'OPEN',
        'shares': 5
    },{
        'symbol': 'SELB',
        'shares': 20.32
    },{
        'symbol': 'VZ',
        'shares': 0.828505
    },{
        'symbol': 'ZYNE',
        'shares': 1
    },
]

# Creating the database.
client = pymongo.MongoClient('mongodb://localhost:27017/')
zwazStocksDB = client['ZwazStocks']
# Connections to both collections in MongoDB.
app.config["DEBUG"] = True
app.config["MONGO_URI"] = "mongodb://localhost:27017/ZwazStocks"
mongo = PyMongo(app)
collection = zwazStocksDB['Share Overview']
# Clears the collection for the updated info.
collection.delete_many({})

for stock in zwazStocks:
    stockItems = stock.items()
    for key, value in stockItems:
        if key == 'symbol':
            symbol = value
        elif key == 'shares':
            shares = value
    # Inserts share information for each stock.
    x = collection.insert_one({ 'symbol': symbol, 'shares': shares })

# Home route that displays index.html content.
@app.route("/")
def index():
    return render_template("index.html")

# API endpoint for cities in an individual state, defaulting to Oregon.
# @app.route("/api/cities/", defaults={'state': 'OR'})
# @app.route("/api/cities/<state>/", methods=['GET', 'POST'])
# def cityData(state):
#     stateCitiesList = dumps(citiesCollection.find({'State': state}, {'_id': 0}))
#     return stateCitiesList

# # API endpoint for states' aggregated data.
# @app.route("/api/states/", methods=['GET'])
# def stateData():
#     # Creates a list from the collection and uses json_util to return this result.
#     statesList = list(statesCollection.find())
#     return json.dumps(statesList, default = json_util.default)

# Do the thing. (:
if __name__ == "__main__":
    app.run(debug=True)
