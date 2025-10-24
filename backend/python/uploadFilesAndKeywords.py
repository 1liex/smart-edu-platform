from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector

def access_db(sqlQ):
    #access db and use sqlQ to save the file in db
    pass

def save_file(fileN, fileP, fileT):
    # this function will creat the sqlQ
    pass


app = Flask(__name__)
CORS(app)

@app.route("/API/uploadFile", methods=["POST"])
def upload_file():
    file = request.get_json()
    if file:
        file_name = file["filename"]
        file_path = file["filepath"]
        file_type = file["filetype"]
        # save_file(file_name, file_path, file_type)
        print(file_name, file_path, file_type)
    else:
        print("no file")

    return jsonify({"status": "success", "message": "file added"}), 201



if __name__ == "__main__":
    app.run(debug=True)