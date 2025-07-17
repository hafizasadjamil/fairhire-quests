"""
Text embedding generation using sentence transformers
"""
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import torch
from sklearn.preprocessing import normalize
import config

logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    def __init__(self, model_name: str = None):
        self.model_name = model_name or config.EMBEDDING_MODEL
        self.model = None
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.load_model()

    def load_model(self):
        """Load the sentence transformer model"""
        try:
            self.model = SentenceTransformer(self.model_name, device=self.device)
            logger.info(f"Loaded embedding model: {self.model_name} on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise

    def generate_resume_embedding(self, parsed_resume: Dict[str, Any]) -> Optional[List[float]]:
        """
        Generate embedding for a resume

        Args:
            parsed_resume: Dictionary containing parsed resume data

        Returns:
            List of embedding values or None if failed
        """
        try:
            # Combine relevant text fields
            text_parts = []

            # Add contact info
            if parsed_resume.get('contact_info'):
                contact = parsed_resume['contact_info']
                if contact.get('name'):
                    text_parts.append(f"Name: {contact['name']}")

            # Add skills
            if parsed_resume.get('skills'):
                skills_text = " ".join(parsed_resume['skills'])
                text_parts.append(f"Skills: {skills_text}")

            # Add experience
            if parsed_resume.get('experience'):
                for exp in parsed_resume['experience']:
                    exp_text = f"{exp.get('title', '')} at {exp.get('company', '')}"
                    if exp_text.strip():
                        text_parts.append(exp_text)

            # Add education
            if parsed_resume.get('education'):
                for edu in parsed_resume['education']:
                    if edu.get('degree'):
                        text_parts.append(edu['degree'])

            # Add summary
            if parsed_resume.get('summary'):
                text_parts.append(parsed_resume['summary'])

            # Add certifications
            if parsed_resume.get('certifications'):
                cert_text = " ".join(parsed_resume['certifications'])
                text_parts.append(f"Certifications: {cert_text}")

            # Combine all text
            combined_text = " ".join(text_parts)

            if not combined_text.strip():
                logger.warning("No text content found for embedding generation")
                return None

            # Generate embedding
            embedding = self.model.encode(combined_text, convert_to_tensor=False)

            # Normalize embedding
            embedding = normalize(embedding.reshape(1, -1))[0]

            return embedding.tolist()

        except Exception as e:
            logger.error(f"Error generating resume embedding: {e}")
            return None

    def generate_job_embedding(self, job_data: Dict[str, Any]) -> Optional[List[float]]:
        """
        Generate embedding for a job posting

        Args:
            job_data: Dictionary containing job posting data

        Returns:
            List of embedding values or None if failed
        """
        try:
            text_parts = []

            # Add job title
            if job_data.get('title'):
                text_parts.append(f"Job Title: {job_data['title']}")

            # Add company name
            if job_data.get('company'):
                text_parts.append(f"Company: {job_data['company']}")

            # Add job description
            if job_data.get('description'):
                text_parts.append(job_data['description'])

            # Add required skills
            if job_data.get('required_skills'):
                skills_text = " ".join(job_data['required_skills'])
                text_parts.append(f"Required Skills: {skills_text}")

            # Add preferred skills
            if job_data.get('preferred_skills'):
                skills_text = " ".join(job_data['preferred_skills'])
                text_parts.append(f"Preferred Skills: {skills_text}")

            # Add location
            if job_data.get('location'):
                text_parts.append(f"Location: {job_data['location']}")

            # Add experience level
            if job_data.get('experience_level'):
                text_parts.append(f"Experience Level: {job_data['experience_level']}")

            # Combine all text
            combined_text = " ".join(text_parts)

            if not combined_text.strip():
                logger.warning("No text content found for job embedding generation")
                return None

            # Generate embedding
            embedding = self.model.encode(combined_text, convert_to_tensor=False)

            # Normalize embedding
            embedding = normalize(embedding.reshape(1, -1))[0]

            return embedding.tolist()

        except Exception as e:
            logger.error(f"Error generating job embedding: {e}")
            return None

    def generate_text_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for arbitrary text

        Args:
            text: Input text

        Returns:
            List of embedding values or None if failed
        """
        try:
            if not text.strip():
                return None

            embedding = self.model.encode(text, convert_to_tensor=False)
            embedding = normalize(embedding.reshape(1, -1))[0]

            return embedding.tolist()

        except Exception as e:
            logger.error(f"Error generating text embedding: {e}")
            return None

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch

        Args:
            texts: List of input texts

        Returns:
            List of embedding lists
        """
        try:
            if not texts:
                return []

            # Filter empty texts
            valid_texts = [text for text in texts if text.strip()]

            if not valid_texts:
                return []

            # Generate embeddings in batch
            embeddings = self.model.encode(valid_texts, convert_to_tensor=False)

            # Normalize embeddings
            embeddings = normalize(embeddings)

            return embeddings.tolist()

        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            return []

    def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Compute cosine similarity between two embeddings

        Args:
            embedding1: First embedding
            embedding2: Second embedding

        Returns:
            Cosine similarity score (0-1)
        """
        try:
            # Convert to numpy arrays
            emb1 = np.array(embedding1)
            emb2 = np.array(embedding2)

            # Compute cosine similarity
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))

            return float(similarity)

        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            return 0.0

    def find_similar_embeddings(self, query_embedding: List[float],
                                candidate_embeddings: List[List[float]],
                                top_k: int = 10) -> List[tuple]:
        """
        Find most similar embeddings to query

        Args:
            query_embedding: Query embedding
            candidate_embeddings: List of candidate embeddings
            top_k: Number of top results to return

        Returns:
            List of (index, similarity_score) tuples
        """
        try:
            if not candidate_embeddings:
                return []

            similarities = []

            for i, candidate_emb in enumerate(candidate_embeddings):
                similarity = self.compute_similarity(query_embedding, candidate_emb)
                similarities.append((i, similarity))

            # Sort by similarity score (descending)
            similarities.sort(key=lambda x: x[1], reverse=True)

            return similarities[:top_k]

        except Exception as e:
            logger.error(f"Error finding similar embeddings: {e}")
            return []

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        if not self.model:
            return {}

        return {
            'model_name': self.model_name,
            'device': self.device,
            'max_seq_length': getattr(self.model, 'max_seq_length', 'Unknown'),
            'embedding_dimension': self.model.get_sentence_embedding_dimension(),
            'tokenizer': str(type(self.model.tokenizer)).split('.')[-1].strip("'>")
        }


# Global embedding generator instance
embedding_generator = EmbeddingGenerator()