from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector

app = Flask(__name__)
CORS(app)


@app.route("/API/resources", methods = ["POST"])
def post_api():
    keyword = request.get_json() 
    """{"keyword_id": 1, "keyword": "what is python"}"""



db = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="",
    database="test"
)


gg = db.cursor()

gg.execute("SELECT * FROM person")
ff = gg.fetchall()
print(ff)




