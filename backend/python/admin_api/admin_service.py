from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

def access_db(sql, params=None, fetch=True):
    db = None
    cursor = None
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="userdb"
        )
        cursor = db.cursor(dictionary=True)
        
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        
        if fetch:
            return cursor.fetchall()
        else:
            db.commit()
            return True
    except Exception as e:
        print(e)
        return [] if fetch else False
    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

app = Flask(__name__)
CORS(app)

@app.route("/API/admin/get")
def fetch_all_users():
    users = access_db("SELECT * FROM users")
    return jsonify(users)

@app.route("/API/admin/post", methods=["POST"])
def change_role():
    data = request.get_json()
    user_id = data.get("user_id")
    role = data.get("new_role")

    if not user_id or not role:
        return jsonify({"error": "Missing user_id or new_role"}), 400

    sql = "UPDATE users SET role = %s WHERE id = %s"
    result = access_db(sql, params=(role, user_id), fetch=False)

    if result:
        return jsonify({"status": "ok"}), 200
    else:
        return jsonify({"error": "Failed to update role"}), 500

if __name__ == "__main__":
    app.run(debug=True)

