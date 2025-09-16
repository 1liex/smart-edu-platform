from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import mysql.connector
from googleapiclient.discovery import build
import isodate

youtube_api_key = "AIzaSyBc3c6Tb4q_VBujqd-1BYBSA_M8njefVMM"
#========== Fuction area ==========

def search_youtube(keyword):

    videos_ids = None

    with build('youtube', 'v3', developerKey= youtube_api_key) as youtube:
        response = youtube.search().list(
            q=keyword,
            part='id',
            maxResults=5,
            type='video',
            relevanceLanguage='en'

        ).execute()

        videos_ids = [item["id"]['videoId'] for item in response["items"]]


    if videos_ids:
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

        print(json.dumps(videos_response, indent=4))

        if views > 10000 and total_seconds > 420:

            dic = {
                "title": f"{title}",
                "link": f"https://www.youtube.com/watch?v={video_id}"
            }
             
            results.append(dic)

    return results
            

def search_google():
    pass

def access_resource_table_in_db(keyword_id, resource_details):
    for item in resource_details:
        db = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="",
        database="userdb"
    )
    
        gg = db.cursor()
    
        sql = "INSERT INTO resources (id, title, link, keyword_id) VALUES (NULL, %s, %s, %s)"
        values = (item["title"], item["link"], keyword_id)
    
        gg.execute(sql, values)
        db.commit()




def post_api(data):
    """data will be like this: {"id": 1, "keyword": "python"}"""
    # data = request.get_json()
    keyword_id = data["id"]
    keyword = data["keyword"]
    yt_resource = search_youtube(keyword)
    print(yt_resource)
    access_resource_table_in_db(keyword_id, yt_resource)

app = Flask(__name__)
CORS(app)



@app.route("/API/resources", methods = ["POST"])
def post_api():
    """data will be like this: {"id": 1, "keyword": "python"}"""
    data = request.get_json()
    keyword_id = data["id"]
    keyword = data["keyword"]
    yt_resource = search_youtube(keyword)
    access_resource_table_in_db(keyword_id, yt_resource)

    return jsonify({"status": "success", "message": "Resource added"}), 201

if __name__ == "__main__":
    app.run(debug=True)






