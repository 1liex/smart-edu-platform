# from googleapiclient.discovery import build
# import json


# youtube_api_key = "AIzaSyBc3c6Tb4q_VBujqd-1BYBSA_M8njefVMM"

# videos_ids = None

# with build('youtube', 'v3', developerKey= youtube_api_key) as youtube:
#     response = youtube.search().list(
#         q='python',
#         part='id',
#         maxResults=2,
#         type='video',
#         relevanceLanguage='en'

#     ).execute()
    
#     videos_ids = [item["id"]['videoId'] for item in response["items"]]


# if videos_ids:
#     videos_response = youtube.videos().list(
#     part="snippet,statistics,contentDetails",
#     id=",".join(videos_ids)
# ).execute()

# print(json.dumps(videos_response, indent=4))
# # الفلترة
# for video in videos_response['items']:
#     title = video['snippet']['title']
#     video_id = video['id']
#     views = int(video['statistics'].get('viewCount', 0))

#     if views > 5000:
#         print(f"{title} ({views} views)")
#         print(f"https://www.youtube.com/watch?v={video_id}")





from googleapiclient.discovery import build
import json

def search_google_docs(keyword):
    api_key = "AIzaSyAtHTzxb-gJgd92AR897uyZawovlz78_Gw"
    cse_id = "51d40f0ebc9304bb7"  # لازم تسوي Custom Search Engine مسبقًا

    service = build("customsearch", "v1", developerKey=api_key)
    res = service.cse().list(
        q=keyword,
        cx=cse_id,
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
    return results

# مثال استخدام:
docs = search_google_docs("Python list comprehension")
print(json.dumps(docs, indent=4))
