# FairHireQuest AI Engine

A comprehensive AI/NLP pipeline for job portal backend processing, handling resume parsing, embedding generation, job matching, and PII anonymization.

## Features

### ✅ Completed
- **PDF Text Extraction**: Multi-method PDF parsing with fallback options
- **Resume Parsing**: Extract name, email, phone, skills, experience, education
- **MongoDB Integration**: Seamless database operations
- **Embedding Generation**: Sentence transformer-based embeddings
- **Job Matching**: Cosine similarity-based job recommendations
- **PII Anonymization**: Microsoft Presidio-based sensitive data masking

### 🔄 In Progress
- **Skill Synonym Mapping**: Enhanced skill normalization
- **Language Detection**: Multi-language support
- **Batch Processing**: Efficient bulk operations

## Architecture

```
Resume Upload → PDF Parsing → Section Extraction → Embedding Generation → Job Matching → Results Storage
                     ↓              ↓                     ↓
                Text Cleaning → PII Detection → Anonymization (Optional)
```

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-repo/fairhire-ai-engine.git
cd fairhire-ai-engine
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Download spaCy model**
```bash
python -m spacy download en_core_web_sm
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

## Configuration

Edit `config.py` or set environment variables:

```python
MONGODB_URI = "mongodb://localhost:27017/fairhire"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
SIMILARITY_THRESHOLD = 0.7
MAX_MATCHES_PER_RESUME = 10
```

## Usage

### Command Line Interface

```bash
# Process all pending resumes
python main.py --mode batch --limit 100

# Process a single resume
python main.py --mode single --resume-id "60f1b2c3d4e5f6789abcdef0"

# Process job embeddings
python main.py --mode jobs --limit 50

# Run full pipeline
python main.py --mode full --limit 100 --job-limit 50

# Generate processing report
python main.py --mode report
```

### Programmatic Usage

```python
from ai_engine.main import AIEnginePipeline

# Initialize pipeline
pipeline = AIEnginePipeline()

# Process single resume
success = pipeline.process_single_resume("resume_id")

# Process batch
results = pipeline.process_batch(limit=100)

# Generate report
report = pipeline.generate_report()
```

## Database Schema

### Resumes Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "file_path": "string",
  "status": "pending|processed|failed",
  "parsed_data": {
    "contact_info": {...},
    "skills": [...],
    "experience": [...],
    "education": [...]
  },
  "embedding": [...],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Jobs Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "company": "string",
  "description": "string",
  "required_skills": [...],
  "location": "string",
  "status": "active|inactive",
  "embedding": [...],
  "created_at": "datetime"
}
```

### Matches Collection
```json
{
  "_id": "ObjectId",
  "resume_id": "string",
  "matches": [
    {
      "job_id": "string",
      "similarity_score": 0.85,
      "skill_match_score": 0.75,
      "composite_score": 0.82,
      "match_reasons": [...]
    }
  ],
  "created_at": "datetime"
}
```

## API Components

### Core Classes

- **`AIEnginePipeline`**: Main orchestrator
- **`PDFParser`**: Multi-method PDF text extraction
- **`SectionExtractor`**: Resume section parsing
- **`EmbeddingGenerator`**: Sentence transformer embeddings
- **`JobMatcher`**: Similarity-based job matching
- **`PIIAnonymizer`**: PII detection and masking
- **`DatabaseManager`**: MongoDB operations

### Key Methods

```python
# Extract text from PDF
text = pdf_parser.extract_text("path/to/resume.pdf")

# Parse resume sections
sections = section_extractor.extract_all_sections(text)

# Generate embedding
embedding = embedding_generator.generate_resume_embedding(sections)

# Find job matches
matches = job_matcher.find_matches_for_resume(resume_id)

# Anonymize PII
anonymized = pii_anonymizer.anonymize_resume(sections)
```

## Performance Optimization

### Batch Processing
- Process multiple resumes in parallel
- Batch embedding generation
- Efficient database operations

### Memory Management
- Streaming PDF processing
- Chunked text processing
- Garbage collection optimization

### Caching
- Model caching
- Embedding caching
- Result caching

## Error Handling

### Robust Processing
- Multiple PDF extraction methods
- Graceful failure handling
- Automatic retry mechanisms
- Comprehensive logging

### Monitoring
- Processing statistics
- Error tracking
- Performance metrics
- Database health checks

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=ai_engine

# Run specific test file
pytest tests/test_pdf_parser.py
```

## Deployment

### Production Setup
1. Set up MongoDB replica set
2. Configure environment variables
3. Set up logging and monitoring
4. Deploy with process manager (PM2, systemd)

### Docker Deployment
```bash
# Build image
docker build -t fairhire-ai-engine .

# Run container
docker run -d --name ai-engine \
  -e MONGODB_URI=mongodb://mongo:27017/fairhire \
  fairhire-ai-engine
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-engine
  template:
    spec:
      containers:
      - name: ai-engine
        image: fairhire-ai-engine:latest
        env:
        - name: MONGODB_URI
          value: "mongodb://mongo-service:27017/fairhire"
```

## Future Enhancements

### Phase 3-4 Features
- **Advanced Skill Matching**: Semantic skill similarity
- **Resume Builder AI**: GPT-based resume suggestions
- **Diversity Analytics**: Bias detection and reporting
- **Multi-language Support**: International resume processing
- **Real-time Processing**: WebSocket-based live updates

### Integration Points
- **FastAPI REST API**: HTTP endpoints for external integration
- **GraphQL API**: Flexible data querying
- **Webhook Support**: Real-time notifications
- **Message Queue**: Asynchronous processing with Celery/RQ

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@fairhirequest.com
- Documentation: https://docs.fairhirequest.com