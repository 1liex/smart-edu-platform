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
youtube_api_key = os.getenv("YT_TOKEN")
access_token = os.getenv("ACCESS_TOKEN")

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
    
    return results


def access_resource_table_in_db(keyword_id, resource_details):
    try:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            passwd="",
            database="userdb"
        )
        cursor = db.cursor()

        sql = "INSERT INTO resources (title, link, keyword_id) VALUES (%s, %s, %s)"
        
        count = 0
        for item in resource_details:
            values = (item["title"], item["link"], keyword_id)
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
        access_resource_table_in_db(keyword_id, yt_resource)

        return jsonify({"status": "success", "message": "Resource added"}), 201
    else:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401


if __name__ == "__main__":
    app.run(debug=True)
