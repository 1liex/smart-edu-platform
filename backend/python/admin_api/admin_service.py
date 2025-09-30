from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

def access_db(sql):
   
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="userdb"
        )
        cursor = db.cursor(dictionary=True)  # عشان يرجع النتائج كـ dict
       
        cursor.execute(sql)
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(e)
        return []
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

def change_role_in_db(user_id, new_role):
    pass


app = Flask(__name__)
CORS(app)

@app.route("/API/admin/get")
def fetch_all_users():
    users = access_db("SELECT * FROM users")
    return jsonify(users)

@app.route("/API/admin/post", methods=["POST"])
def change_role():
    # data should be like this {"user_id": "1", "new_role": "teacher"}
    data = request.get_json()

if __name__ == "__main__":
    app.run(debug=True)

