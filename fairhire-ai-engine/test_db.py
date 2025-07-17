# # from pymongo import MongoClient
# # from bson import ObjectId  # 👈 important
# #
# # client = MongoClient("mongodb+srv://fairhirequest:fairhire%40quest2025@fairhiredev.qyrugni.mongodb.net/fairhire?retryWrites=true&w=majority&appName=FairHireDev")
# # db = client["test"]
# # resumes = db["resumes"]
# #
# # # ✅ Convert string ID to ObjectId
# # res = resumes.find_one({"_id": ObjectId("6872f8d66b5ad0ea0620a04c")})
# #
# # print(res)
# from pymongo import MongoClient
#
# # Connect to MongoDB
# client = MongoClient("mongodb+srv://fairhirequest:fairhire%40quest2025@fairhiredev.qyrugni.mongodb.net/?retryWrites=true&w=majority&appName=FairHireDev")
#
# # Access the 'test' database
# db = client["test"]
#
# # List all collections in the 'test' database
# collections = db.list_collection_names()
#
# print("Collections in 'test' database:")
# for name in collections:
#     print(f"🔹 {name}")
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# ✅ Load .env variables
load_dotenv()

# ✅ Get Atlas URI
MONGO_URI = os.getenv("MONGODB_URI")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found in .env file")

# ✅ Connect to Atlas DB
client = MongoClient(MONGO_URI)
db = client["test"]  # Or whatever your DB name is on Atlas

# 🎯 Dummy match document
match_doc = {
    "resume_id": ObjectId("666f3cde75d8140a204c1f11"),
    "user_id": ObjectId("666f3bba75d8140a204c1ef9"),
    "matches": [
        {
            "job_id": ObjectId("68743d2a24e2e3c6528070ac"),
            "match_reason": "Sample reason to create collection"
        }
    ],
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}

# 🚀 Insert to create `matches` collection
result = db.matches.insert_one(match_doc)
print(f"✅ 'matches' collection created with _id: {result.inserted_id}")
