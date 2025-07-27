"""
Configuration settings for FairHireQuest AI Engine
"""
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Database Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/test")
DB_NAME = "test"

# Collections
RESUMES_COLLECTION = "resumes"
JOBS_COLLECTION = "jobs"
MATCHES_COLLECTION = "matches"

# AI Model Configuration
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
SIMILARITY_THRESHOLD = 0.7
MAX_MATCHES_PER_RESUME = 10

# File Paths
UPLOAD_DIR = "uploads"
TEMP_DIR = "temp"
MODELS_DIR = "models"

# Presidio Configuration
PRESIDIO_ENTITIES = ["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "IBAN_CODE"]

# Skill Synonyms
SKILL_SYNONYMS = {
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "reactjs": "react",
    "nodejs": "node.js",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "nlp": "natural language processing",
    "cv": "computer vision",
    "dl": "deep learning",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "k8s": "kubernetes",
    "docker": "containerization",
    "sql": "database",
    "nosql": "mongodb",
    "api": "rest api",
    "ui": "user interface",
    "ux": "user experience",
}

# Regex Patterns
PATTERNS = {
    "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    "phone": r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
    "linkedin": r'linkedin\.com/in/[A-Za-z0-9-]+',
    "github": r'github\.com/[A-Za-z0-9-]+',
    "name": r'^[A-Z][a-z]+(?: [A-Z][a-z]+)*$',
}

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"