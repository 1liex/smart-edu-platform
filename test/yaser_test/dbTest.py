from googleapiclient.discovery import build
import json


youtube_api_key = "AIzaSyBc3c6Tb4q_VBujqd-1BYBSA_M8njefVMM"

videos_ids = None

with build('youtube', 'v3', developerKey= youtube_api_key) as youtube:
    response = youtube.search().list(
        q='python',
        part='id',
        maxResults=2,
        type='video',
        relevanceLanguage='en'

    ).execute()
    
    videos_ids = [item["id"]['videoId'] for item in response["items"]]


if videos_ids:
    videos_response = youtube.videos().list(
    part="snippet,statistics,contentDetails",
    id=",".join(videos_ids)
).execute()

print(json.dumps(videos_response, indent=4))
# الفلترة
for video in videos_response['items']:
    title = video['snippet']['title']
    video_id = video['id']
    views = int(video['statistics'].get('viewCount', 0))

    if views > 5000:
        print(f"{title} ({views} views)")
        print(f"https://www.youtube.com/watch?v={video_id}")



