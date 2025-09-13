from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector

app = Flask(__name__)
CORS(app)


@app.route("/API/resources", methods = ["POST"])
def post_api():
    keyword = request.get_json() 
    """{"id": 1, "keyword": "python"}"""

    db = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="",
    database="userdb"
)

    gg = db.cursor()

    sql = "INSERT INTO resources (id, title, link, keyword_id) VALUES (NULL, %s, %s, %s)"
    values = ("loops in python", "youtub.com", keyword["id"])

    gg.execute(sql, values)
    db.commit()

    return jsonify({"status": "success", "message": "Resource added"}), 201

if __name__ == "__main__":
    app.run(debug=True)






