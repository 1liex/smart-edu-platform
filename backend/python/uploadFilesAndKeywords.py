from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector



app = Flask(__name__)
CORS(app)


@app.route("/API/uploadFile", methods=["POST"])
def upload_file():
    file = request.files.get("file")
    if file:
        print(file)
    else:
        print("no file")


    return jsonify({"status": "success", "message": "Resource added"}), 201



if __name__ == "__main__":
    app.run(debug=True)