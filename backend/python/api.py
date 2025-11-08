from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector
from googleapiclient.discovery import build
import isodate
import os
from dotenv import load_dotenv

"""load the keys from env file (for safety i do not put the tokens key in the same py file)
so i put it in env file and import it using os and dotenv laibrary """
load_dotenv()
access_token = os.getenv("ACCESS_TOKEN")
youtube_api_key = os.getenv("YT_TOKEN")
google_token = os.getenv("GOOGLE_TOKEN")
search_engine_id = os.getenv("SEARCH_ENGINE_ID")

# ========== Functions ==========

# Function for search in yt 
def search_youtube(keyword):
    videos_ids = []

    # first we will get the videos from yt
    youtube = build('youtube', 'v3', developerKey=youtube_api_key)
    response = youtube.search().list(
        q=keyword,
        part='id',
        maxResults=5,
        type='video',
        relevanceLanguage='en'
    ).execute()

    videos_ids = [item["id"]['videoId'] for item in response["items"]]

    if not videos_ids:
        return []

    # after we get the videos now we will get the details of those videos like title, views and time 
    videos_response = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=",".join(videos_ids)
    ).execute()

    results = []


    for video in videos_response['items']:
        title = video['snippet']['title']
        video_id = video['id']
        views = int(video['statistics'].get('viewCount', 0))
        iso_time = video["contentDetails"]["duration"]
        time = isodate.parse_duration(iso_time)
        total_seconds = int(time.total_seconds())

        # the video should be 10k views more then 3m and less then 30m
        if views > 10000 and total_seconds > 180 and total_seconds < 1800:
            dic = {
                "title": title,
                "link": f"https://www.youtube.com/watch?v={video_id}"
            }
            results.append(dic)
    
    return [results, "video"]

# Function for search in google
def search_google(keyword):
    service = build("customsearch", "v1", developerKey=google_token)
    res = service.cse().list(
        q=keyword,
        cx=search_engine_id, # it will search in custom search engin (w3school) and the id of this engin is (search_engine_id) we get the id from env file 
        num=5  
    ).execute()
    print(json.dumps(res, indent=4))
    results = []
   
    for item in res.get('items', []):
        results.append({
            "title": item['title'],
            "link": item['link'],
            "snippet": item['snippet']
        })
    print(json.dumps(results, indent=4))
    
    return [results, "document"]

# Function to access the db and append the data to it 
def access_resource_table_in_db(keyword_id, resource_details):
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="",
            database="userdb"
        )
        cursor = db.cursor()

        sql = "INSERT INTO resources (title, link, resource_type, keyword_id) VALUES (%s, %s, %s, %s)"
        
        count = 0
        results, r_type = resource_details

        for item in results:
            values = (item["title"], item["link"], r_type, keyword_id)
            try:
                cursor.execute(sql, values)
                count += 1
                print("✅ Inserted:", values)
            except Exception as e:
                print("❌ Error inserting:", values, "| Error:", e)

        db.commit()
        print(f"✅ Total inserted: {count}")

    except Exception as e:
        print("Database error:", e)

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# ========== Flask API ==========

"""
in this section will be the route (end point) here will be the path to get the request from php
if the request come to this pathe (/API/resources) then the (post_api) function will execute
i do all that using Flask this library will let u create an API and it is so easy to use 
"""
app = Flask(__name__)
CORS(app)

@app.route("/API/resources", methods=["POST"]) # it will get the request from this path
def post_api():
    """data will be like this: {"token": "your token...","id": 1, "keyword": "python"}"""
    data = request.get_json()
    
    token = data.get("token") # there will be token key to access this api

    if token and token == access_token:
        keyword_id = data.get("id") # here will get the keyword id that the word get it when it save in db
        keyword = data.get("keyword") # here will get the word it self

        yt_resource = search_youtube(keyword) # we call the function and it will return the result from yt
        google_resource = search_google(keyword) # same thing but from google (w3school)
        access_resource_table_in_db(keyword_id, yt_resource) # here call function to access the db and it will save the resources and connected it with the keyword id 
        access_resource_table_in_db(keyword_id, google_resource) # same thing but with google resources

        return jsonify({"status": "success", "message": "Resource added"}), 201
    else:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401





# ========== Admin Section ==========

    #==== function section =====
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


    #===== route of admin section ======
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




# ========== Upload files and keywords Section ==========

    #==== function section =====
def access_db_file(sqlQ):
    #access db and use sqlQ to save the file in db
    file_id = 1
    return file_id
    # not finished yet

def access_db_keywords(sqlQ):
    lst = ["id", "keyword"]
    return lst
    pass

def create_query_for_file(current_user_id, fileN, fileP, fileT):
    #here will create the query and send it to the (access_db_files_keywords)
    query = "the query with the data"
    return query
    # not finished yet

def create_query_for_keywords(file_id, keyword):
    query = "the query with the data"
    return query
    # not finished yet

    #===== route of upload files and keywords section ======
@app.route("/API/uploadFile", methods=["POST"])
def upload_file():
    file = request.get_json()
    if file:
        current_user_id = file["currentuserid"]
        file_name = file["filename"]
        file_path = file["filepath"]
        file_type = file["filetype"]
        keywords = file["keywords"]
        # the data after this will look lile this (5 test test.py x-python ['python', 'js', 'react', 'node js'])
        q = create_query_for_file(current_user_id, file_name, file_path, file_type)
        file_id = access_db_file(q)
        keyword_dict = {} # {1: "python", 2: "js", 3: "react", 4: "node js"} 
        for keyword in keywords:
            q = create_query_for_keywords(file_id, keyword)
            id_and_keyword = access_db_keywords(q)
            id = id_and_keyword[0]
            keyword_it_self = id_and_keyword[1]
            keyword_dict[id] = keyword_it_self


        print(current_user_id, file_name, file_path, file_type, keywords)
    else:
        print("no file")

    return jsonify({"status": "success", "message": "file added"}), 201


if __name__ == "__main__":
    app.run(debug=True)
