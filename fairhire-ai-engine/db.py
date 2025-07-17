"""
MongoDB database connection and operations
"""
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from typing import Dict, List, Optional, Any
from datetime import datetime
from bson import ObjectId
import config

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = MongoClient(config.MONGODB_URI, serverSelectionTimeoutMS=5000)
            self.db = self.client[config.DB_NAME]
            self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    def close(self):
        if self.client:
            self.client.close()
            logger.info("Database connection closed")

    # Resume Operations
    def get_pending_resumes(self, limit: int = 100) -> List[Dict]:
        try:
            resumes = self.db[config.RESUMES_COLLECTION].find({"status": "pending"}, limit=limit)
            return list(resumes)
        except Exception as e:
            logger.error(f"Error fetching pending resumes: {e}")
            return []

    def update_resume_status(self, resume_id: str, status: str, parsed_data: Dict = None):
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow()
            }
            if parsed_data:
                update_data["parsed_data"] = parsed_data

            result = self.db[config.RESUMES_COLLECTION].update_one(
                {"_id": ObjectId(resume_id)},
                {"$set": update_data}
            )

            if result.modified_count > 0:
                logger.info(f"Resume {resume_id} updated successfully")
            else:
                logger.warning(f"No resume found with ID: {resume_id}")

        except Exception as e:
            logger.error(f"Error updating resume {resume_id}: {e}")

    def get_resume_by_id(self, resume_id: str) -> Optional[Dict]:
        try:
            return self.db[config.RESUMES_COLLECTION].find_one({"_id": ObjectId(resume_id)})
        except Exception as e:
            logger.error(f"Error fetching resume {resume_id}: {e}")
            return None

    def save_resume_embedding(self, resume_id: str, embedding: List[float]):
        try:
            self.db[config.RESUMES_COLLECTION].update_one(
                {"_id": ObjectId(resume_id)},
                {"$set": {"embedding": embedding, "embedding_updated_at": datetime.utcnow()}}
            )
            logger.info(f"Embedding saved for resume {resume_id}")
        except Exception as e:
            logger.error(f"Error saving embedding for resume {resume_id}: {e}")

    # Job Operations
    # def get_all_jobs(self) -> List[Dict]:
    #     try:
    #         jobs = self.db[config.JOBS_COLLECTION].find({"status": "active"})
    #         return list(jobs)
    #
    def get_jobs_without_embedding(self) -> List[Dict[str, Any]]:
        try:
            jobs = self.db[config.JOBS_COLLECTION].find({"embedding": {"$exists": False}})
            return list(jobs)
        except Exception as e:
            logger.error(f"Error fetching jobs without embedding: {e}")
            return []

    def get_all_jobs(self) -> List[Dict]:
        try:
            jobs = self.db[config.JOBS_COLLECTION].find({})
            return list(jobs)
        except Exception as e:
            logger.error(f"Error fetching jobs: {e}")
            return []

    def get_job_by_id(self, job_id: str) -> Optional[Dict]:
        try:
            return self.db[config.JOBS_COLLECTION].find_one({"_id": ObjectId(job_id)})
        except Exception as e:
            logger.error(f"Error fetching job {job_id}: {e}")
            return None

    def save_job_embedding(self, job_id: str, embedding: List[float]):
        try:
            self.db[config.JOBS_COLLECTION].update_one(
                {"_id": ObjectId(job_id)},
                {"$set": {"embedding": embedding, "embedding_updated_at": datetime.utcnow()}}
            )
            logger.info(f"Embedding saved for job {job_id}")
        except Exception as e:
            logger.error(f"Error saving embedding for job {job_id}: {e}")

    # Match Operations
    def save_matches(self, resume_id: str, job_matches: List[Dict]):
        try:
            match_document = {
                "resume_id": ObjectId(resume_id),
                "matches": job_matches,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            self.db[config.MATCHES_COLLECTION].update_one(
                {"resume_id": ObjectId(resume_id)},
                {"$set": match_document},
                upsert=True
            )

            logger.info(f"Saved {len(job_matches)} matches for resume {resume_id}")

        except Exception as e:
            logger.error(f"Error saving matches for resume {resume_id}: {e}")

    def get_matches_by_resume(self, resume_id: str) -> Optional[Dict]:
        try:
            return self.db[config.MATCHES_COLLECTION].find_one({"resume_id": ObjectId(resume_id)})
        except Exception as e:
            logger.error(f"Error fetching matches for resume {resume_id}: {e}")
            return None

    # Analytics Operations
    def get_processing_stats(self) -> Dict[str, int]:
        try:
            stats = {
                "total_resumes": self.db[config.RESUMES_COLLECTION].count_documents({}),
                "pending_resumes": self.db[config.RESUMES_COLLECTION].count_documents({"status": "pending"}),
                "processed_resumes": self.db[config.RESUMES_COLLECTION].count_documents({"status": "processed"}),
                "failed_resumes": self.db[config.RESUMES_COLLECTION].count_documents({"status": "failed"}),
                "total_jobs": self.db[config.JOBS_COLLECTION].count_documents({}),
                "active_jobs": self.db[config.JOBS_COLLECTION].count_documents({"status": "active"}),
                "total_matches": self.db[config.MATCHES_COLLECTION].count_documents({})
            }
            return stats
        except Exception as e:
            logger.error(f"Error fetching processing stats: {e}")
            return {}

    def save_matches_with_user(self, resume_id: str, user_id: str, job_matches: List[Dict]):
        try:
            match_document = {
                "resume_id": ObjectId(resume_id),
                "user_id": ObjectId(user_id),  # ✅ Foreign key link
                "matches": job_matches,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            self.db[config.MATCHES_COLLECTION].update_one(
                {"resume_id": ObjectId(resume_id)},
                {"$set": match_document},
                upsert=True
            )

            logger.info(f"Saved {len(job_matches)} matches for resume {resume_id} (user: {user_id})")

        except Exception as e:
            logger.error(f"Error saving matches with user_id for resume {resume_id}: {e}")

# ✅ Global database instance
db_manager = DatabaseManager()
