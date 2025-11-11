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


    for video in videos_response.get("items", []):
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

    results = []
   
    for item in res.get('items', []):
        results.append({
            "title": item['title'],
            "link": item['link'],
            "snippet": item['snippet']
        })
    
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


def post_api(args):
    """args will be like this: {"id": 1, "keyword": "python"}"""
    

    keyword_id = args.get("id") # here will get the keyword id that the word get it when it save in db
    keyword = args.get("keyword") # here will get the word it self
    yt_resource = search_youtube(keyword) # we call the function and it will return the result from yt
    google_resource = search_google(keyword) # same thing but from google (w3school)
    access_resource_table_in_db(keyword_id, yt_resource) # here call function to access the db and it will save the resources and connected it with the keyword id 
    access_resource_table_in_db(keyword_id, google_resource) # same thing but with google resources

    return jsonify({"status": "success", "message": "Resource added"}), 201



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


def access_db_file(sqlQ, params=None):
    #access db and use sqlQ to save the file in db
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="userdb"
        )
        cursor = db.cursor()

        # تنفيذ الكويري مع الباراميترز
        cursor.execute(sqlQ, params)
        db.commit()

       
        file_id = cursor.lastrowid

        return file_id

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None

    finally:
        if db.is_connected():
            cursor.close()
            db.close()


def create_query_for_file(current_user_id, fileN, fileP, fileT):
    #here will create the query and send it to the (access_db_files_keywords)
    query = """
        INSERT INTO files (file_name, file_path, file_type, teacher_id)
        VALUES (%s, %s, %s, %s)
    """
    params = (fileN, fileP, fileT, current_user_id)
    return query, params


def access_db_keywords(sqlQ, params=None):
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="userdb"
        )
        cursor = db.cursor()
    
        cursor.execute(sqlQ, params)
        db.commit()

        keyword_id = cursor.lastrowid

        keyword_it_self = params[0] if params else None

        return keyword_id, keyword_it_self

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return None, None

    finally:
        if db.is_connected():
            cursor.close()
            db.close()


def create_query_for_keywords(file_id, keyword):
    query = """
        INSERT INTO keywords (keyword, file_id)
        VALUES (%s, %s)
    """
    params = (keyword, file_id)
    return query, params


"""(get_type_file(file)) this function used to get the type of the file if it is not exest
like if we have sql file there is no type return with it so what this function do lets say we have (test.sql) file 
so this function will split the file and take the str after the (.) so in the end 
it will look like this  (test.sql = the type of this file is (sql)) because the str after the (.) is sql """
def get_type_file(file): 
    ty = file.split(".")
    file_type = ty[1]
    return file_type

    #===== route of upload files and keywords section ======
@app.route("/API/uploadFile", methods=["POST"])
def upload_file():
    file = request.get_json()
  
    if file:
        # the data after separate will be like this (5 test test.py x-python ['python', 'js', 'react', 'node js'])
        current_user_id = file["currentuserid"]
        file_name = file["filename"]
        file_path = file["filepath"]
        file_type = file.get("filetype", get_type_file(file["filepath"]))
        keywords = file["keywords"]
        
        print(current_user_id, file_name, file_path, file_type, keywords)

        # function to create query for the files the query will connect the file data with the user who upload it
        query, params= create_query_for_file(current_user_id, file_name, file_path, file_type)
        """here function to access the db with the query we create before for the file
        and it will return the id of the file it self that seved in db so we can use this id to connect the keywords with the file it self""" 
        file_id = access_db_file(query, params)
        print(file_id)
        # the dict we will send to the resources function and the resource function will breng the resource from yt and google and save it in db 
        keyword_dict = {} # {1: "python", 2: "js", 3: "react", 4: "node js"} 
        for keyword in keywords: # here we will create query for each keyword
            query, params = create_query_for_keywords(file_id, keyword) # function to create query for the keywords
            """here we will access the db with the same query we create before  and after that the function will return the id of the keyword after it saved in db
            and also it will return the keyword it self like this [1, 'python'] so the first item will be the id and the second the keyword it self"""
            # here i separate the data will return from the function (access_db_keywords) data will be (id and keyword it self) to (id) var and (keyword_it_self) var
            id, keyword_it_self = access_db_keywords(query, params) 
            keyword_dict[id] = keyword_it_self # and here i want to save the keyword and the id togather in dict so it look like this {1: "python"}

        for i in keyword_dict:
            post_api({"id": i, "keyword": keyword_dict[i]})

    else:
        print("no file")

    return jsonify({"status": "success", "message": "file added"}), 201


if __name__ == "__main__":
    app.run(debug=True)
