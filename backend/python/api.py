from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector
from googleapiclient.discovery import build
import isodate
import os
from dotenv import load_dotenv

# تحميل المتغيرات من .env
load_dotenv()
access_token = os.getenv("ACCESS_TOKEN")
youtube_api_key = os.getenv("YT_TOKEN")
google_token = os.getenv("GOOGLE_TOKEN")
search_engine_id = os.getenv("SEARCH_ENGINE_ID")

# ========== Functions ==========

def search_youtube(keyword):
    videos_ids = []

    # نجيب الـ videoIds
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

    # نجيب تفاصيل الفيديوهات
    videos_response = youtube.videos().list(
        part="snippet,statistics,contentDetails",
        id=",".join(videos_ids)
    ).execute()

    results = []

    # فلترة الفيديوهات
    for video in videos_response['items']:
        title = video['snippet']['title']
        video_id = video['id']
        views = int(video['statistics'].get('viewCount', 0))
        iso_time = video["contentDetails"]["duration"]
        time = isodate.parse_duration(iso_time)
        total_seconds = int(time.total_seconds())

        # فلترة: فوق 10k مشاهدة ومدة أطول من 7 دقائق
        if views > 10000 and total_seconds > 180 and total_seconds < 1800:
            dic = {
                "title": title,
                "link": f"https://www.youtube.com/watch?v={video_id}"
            }
            results.append(dic)
    gg=[results, "video"]
    return gg

def search_google(keyword):
    service = build("customsearch", "v1", developerKey=google_token)
    res = service.cse().list(
        q=keyword,
        cx=search_engine_id,
        num=5  # عدد النتائج
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
    gg = [results, "document"]
    return gg


def access_resource_table_in_db(keyword_id, resource_details):
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root1",
            passwd="",
            database="userdb"
        )
        cursor = db.cursor()

        sql = "INSERT INTO resources (title, link, resource_type, keyword_id) VALUES (%s, %s, %s, %s)"
        
        count = 0
        for item in resource_details:
            values = (item[0]["title"], item[0]["link"], item[1], keyword_id)
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

app = Flask(__name__)
CORS(app)

@app.route("/API/resources", methods=["POST"])
def post_api():
    """data will be like this: {"token": "your token...","id": 1, "keyword": "python"}"""
    data = request.get_json()
    
    token = data.get("token")

    if token and token == access_token:
        keyword_id = data.get("id")
        keyword = data.get("keyword")

        yt_resource = search_youtube(keyword)
        google_resource = search_google(keyword)
        access_resource_table_in_db(keyword_id, yt_resource)
        access_resource_table_in_db(keyword_id, google_resource)

        return jsonify({"status": "success", "message": "Resource added"}), 201
    else:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401


if __name__ == "__main__":
    app.run(debug=True)
