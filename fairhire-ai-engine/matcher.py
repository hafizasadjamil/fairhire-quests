# """
# Resume-Job matching using embeddings and similarity scoring

import re
import logging
from typing import List, Dict, Any
from db import db_manager
import os
from groq import Groq
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class JobMatcher:
    def __init__(self):
        self.max_matches = 5
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.groq_client = Groq(api_key=self.groq_api_key)

    def get_top_k_similar_jobs(self, resume_emb, jobs, k=3):
        job_embeddings = []
        valid_jobs = []

        for job in jobs:
            emb = job.get("embedding")
            if emb:
                job_embeddings.append(emb)
                valid_jobs.append(job)

        if not job_embeddings:
            return []

        similarities = cosine_similarity([resume_emb], job_embeddings)[0]
        top_k_indices = np.argsort(similarities)[::-1][:k]
        return [valid_jobs[i] for i in top_k_indices]

    def find_matches_for_resume(self, resume_id: str) -> List[Dict[str, Any]]:
        try:
            # ✅ Get resume document
            resume = db_manager.get_resume_by_id(resume_id)
            if not resume:
                logger.warning(f"Resume ID {resume_id} not found")
                return []

            parsed_resume = resume.get("parsed_data")
            if not parsed_resume:
                logger.warning(f"Resume {resume_id} has no parsed_data")
                return []

            user_id = resume.get("user_id")  # ✅ Extract user_id for saving
            if not user_id:
                logger.warning(f"Resume {resume_id} missing user_id")
                return []

            # ✅ Get all jobs
            all_jobs = db_manager.get_all_jobs()
            if not all_jobs:
                logger.warning("No jobs found in database")
                return []

            # ✅ Get resume embedding
            resume_emb = resume.get("embedding")
            if not resume_emb:
                logger.warning(f"Resume {resume_id} has no embedding")
                return []

            # ✅ Filter top 10 jobs using cosine similarity
            jobs = self.get_top_k_similar_jobs(resume_emb, all_jobs, k=10)
            if not jobs:
                logger.warning("No similar jobs found for resume embedding")
                return []

            # ✅ Match jobs via Groq LLM
            matched_job_ids = self.call_llm_matcher(parsed_resume, jobs)

            # ✅ Prepare matched job details
            job_dict = {str(job["_id"]): job for job in jobs}
            matched_jobs = []

            for match in matched_job_ids:
                job_id = match.get("job_id")
                if not job_id or job_id not in job_dict:
                    continue

                job_info = job_dict[job_id]
                job_info["match_reason"] = match.get("reason", "")
                matched_jobs.append(job_info)

                if len(matched_jobs) >= self.max_matches:
                    break

            logger.info(f"Matched {len(matched_jobs)} jobs for resume {resume_id}")
            logger.info(f" Attempting to save {len(matched_jobs)} matches for resume {resume_id} and user {user_id}")

            try:
                db_manager.save_matches_with_user(
                    resume_id,
                    user_id,
                    [
                        {
                            "job_id": job["_id"],
                            "match_reason": job.get("match_reason", ""),
                            "rank": index + 1  # ✅ Add rank based on position
                        }
                        for index, job in enumerate(matched_jobs)
                    ]

                )
                logger.info(
                    f"Saved {len(matched_jobs)} matches for resume {resume_id} (user: {user_id})")  # ✅ Add this here
            except Exception as e:
                logger.warning(f"Failed to save matches for resume {resume_id}: {e}")

            return matched_jobs

        except Exception as e:
            logger.error(f"❌ Failed to save matches: {e}")
            logger.error(f"Error in find_matches_for_resume: {e}")
            return []

    def call_llm_matcher(self, parsed_resume: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        try:
            prompt = f"""
    You are an intelligent job matcher AI. Match the following resume to the most relevant jobs below.

    Resume:
    {parsed_resume}

    Jobs:
    {[
                {
                    "_id": str(job["_id"]),
                    "title": job["title"],
                    "description": job.get("description", "")[:300]
                }
                for job in jobs
            ]}

    Return only a list of JSON objects in this format:
    [
      {{
        "job_id": "job_id_here",
        "reason": "why this job is a good match"
      }},
      ...
    ]
    Only include up to 5 best matches.
            """

            response = self.groq_client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )

            result = response.choices[0].message.content.strip()
            logger.info(f"Groq Match Result: {result}")

            # ✅ Extract JSON part using regex
            json_text_match = re.search(r"\[\s*{.*?}\s*]", result, re.DOTALL)
            if not json_text_match:
                logger.error("❌ Failed to extract JSON list from LLM response")
                return []

            try:
                return eval(json_text_match.group(0))
            except Exception as e:
                logger.error(f"❌ Failed to eval extracted JSON: {e}")
                return []

        except Exception as e:
            logger.error(f"❌ Groq LLM error: {e}")
            return []

    def batch_match_resumes(self, resume_ids: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        results = {}
        for resume_id in resume_ids:
            results[resume_id] = self.find_matches_for_resume(resume_id)
        return results

# ✅ Global instance
job_matcher = JobMatcher()





# """
# import logging
# from typing import Dict, List, Any, Optional, Tuple
# import numpy as np
# from collections import defaultdict
# import config
# from embedding import embedding_generator
# from db import db_manager
#
# logger = logging.getLogger(__name__)
#
#
# class JobMatcher:
#     def __init__(self):
#         self.similarity_threshold = config.SIMILARITY_THRESHOLD
#         self.max_matches = config.MAX_MATCHES_PER_RESUME
#         self.skill_synonyms = config.SKILL_SYNONYMS
#
#     def find_matches_for_resume(self, resume_id: str) -> List[Dict[str, Any]]:
#         """
#         Find job matches for a specific resume
#
#         Args:
#             resume_id: ID of the resume to match
#
#         Returns:
#             List of job matches with scores
#         """
#         try:
#             # Get resume data
#             resume = db_manager.get_resume_by_id(resume_id)
#             if not resume:
#                 logger.error(f"Resume {resume_id} not found")
#                 return []
#
#             # Check if resume has embedding
#             if 'embedding' not in resume:
#                 logger.warning(f"Resume {resume_id} has no embedding")
#                 return []
#
#             resume_embedding = resume['embedding']
#
#             # Get all active jobs
#             jobs = db_manager.get_all_jobs()
#             if not jobs:
#                 logger.warning("No active jobs found")
#                 return []
#
#             # Calculate matches
#             matches = []
#
#             for job in jobs:
#                 if 'embedding' not in job:
#                     continue
#
#                 # Calculate similarity
#                 similarity_score = embedding_generator.compute_similarity(
#                     resume_embedding, job['embedding']
#                 )
#
#                 # Apply threshold
#                 if similarity_score >= self.similarity_threshold:
#                     # Calculate additional scores
#                     skill_match_score = self.calculate_skill_match_score(
#                         resume.get('parsed_data', {}), job
#                     )
#
#                     experience_match_score = self.calculate_experience_match_score(
#                         resume.get('parsed_data', {}), job
#                     )
#
#                     # Calculate composite score
#                     composite_score = self.calculate_composite_score(
#                         similarity_score, skill_match_score, experience_match_score
#                     )
#
#                     match = {
#                         'job_id': str(job['_id']),
#                         'job_title': job.get('title', ''),
#                         'company': job.get('company', ''),
#                         'location': job.get('location', ''),
#                         'similarity_score': similarity_score,
#                         'skill_match_score': skill_match_score,
#                         'experience_match_score': experience_match_score,
#                         'composite_score': composite_score,
#                         'match_reasons': self.generate_match_reasons(
#                             resume.get('parsed_data', {}), job
#                         )
#                     }
#
#                     matches.append(match)
#
#             # Sort by composite score
#             matches.sort(key=lambda x: x['composite_score'], reverse=True)
#
#             # Return top matches
#             return matches[:self.max_matches]
#
#         except Exception as e:
#             logger.error(f"Error finding matches for resume {resume_id}: {e}")
#             return []
#
#     def calculate_skill_match_score(self, resume_data: Dict[str, Any],
#                                     job_data: Dict[str, Any]) -> float:
#         """
#         Calculate skill match score between resume and job
#
#         Args:
#             resume_data: Parsed resume data
#             job_data: Job posting data
#
#         Returns:
#             Skill match score (0-1)
#         """
#         try:
#             resume_skills = set()
#             job_skills = set()
#
#             # Extract resume skills
#             if resume_data.get('skills'):
#                 resume_skills = set(skill.lower() for skill in resume_data['skills'])
#
#             # Extract job skills
#             if job_data.get('required_skills'):
#                 job_skills.update(skill.lower() for skill in job_data['required_skills'])
#
#             if job_data.get('preferred_skills'):
#                 job_skills.update(skill.lower() for skill in job_data['preferred_skills'])
#
#             if not job_skills:
#                 return 0.0
#
#             # Normalize skills using synonyms
#             normalized_resume_skills = set()
#             normalized_job_skills = set()
#
#             for skill in resume_skills:
#                 normalized_skill = self.skill_synonyms.get(skill, skill)
#                 normalized_resume_skills.add(normalized_skill)
#
#             for skill in job_skills:
#                 normalized_skill = self.skill_synonyms.get(skill, skill)
#                 normalized_job_skills.add(normalized_skill)
#
#             # Calculate Jaccard similarity
#             intersection = len(normalized_resume_skills & normalized_job_skills)
#             union = len(normalized_resume_skills | normalized_job_skills)
#
#             if union == 0:
#                 return 0.0
#
#             return intersection / union
#
#         except Exception as e:
#             logger.error(f"Error calculating skill match score: {e}")
#             return 0.0
#
#     def calculate_experience_match_score(self, resume_data: Dict[str, Any],
#                                          job_data: Dict[str, Any]) -> float:
#         """
#         Calculate experience match score
#
#         Args:
#             resume_data: Parsed resume data
#             job_data: Job posting data
#
#         Returns:
#             Experience match score (0-1)
#         """
#         try:
#             # Extract years of experience from resume
#             resume_years = self.extract_years_of_experience(resume_data)
#
#             # Extract required experience from job
#             job_years = self.extract_required_experience(job_data)
#
#             if job_years is None:
#                 return 0.5  # Neutral score if no experience requirement
#
#             if resume_years is None:
#                 return 0.0  # No experience information
#
#             # Calculate score based on experience match
#             if resume_years >= job_years:
#                 # Has required experience or more
#                 return 1.0
#             else:
#                 # Partial match based on percentage
#                 return min(resume_years / job_years, 1.0)
#
#         except Exception as e:
#             logger.error(f"Error calculating experience match score: {e}")
#             return 0.0
#
#     def extract_years_of_experience(self, resume_data: Dict[str, Any]) -> Optional[int]:
#         """Extract years of experience from resume"""
#         try:
#             if not resume_data.get('experience'):
#                 return None
#
#             total_years = 0
#
#             for exp in resume_data['experience']:
#                 duration = exp.get('duration', '')
#                 years = self.parse_duration_to_years(duration)
#                 total_years += years
#
#             return total_years
#
#         except Exception as e:
#             logger.error(f"Error extracting years of experience: {e}")
#             return None
#
#     def extract_required_experience(self, job_data: Dict[str, Any]) -> Optional[int]:
#         """Extract required experience from job posting"""
#         try:
#             # Check explicit experience fields
#             if job_data.get('years_of_experience'):
#                 return job_data['years_of_experience']
#
#             # Parse from job description
#             description = job_data.get('description', '')
#
#             # Look for patterns like "3+ years", "5 years experience"
#             import re
#
#             patterns = [
#                 r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
#                 r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:relevant\s*)?experience',
#                 r'minimum\s*(\d+)\s*years?',
#                 r'at\s*least\s*(\d+)\s*years?'
#             ]
#
#             for pattern in patterns:
#                 match = re.search(pattern, description.lower())
#                 if match:
#                     return int(match.group(1))
#
#             return None
#
#         except Exception as e:
#             logger.error(f"Error extracting required experience: {e}")
#             return None
#
#     def parse_duration_to_years(self, duration: str) -> int:
#         """Parse duration string to years"""
#         try:
#             import re
#
#             # Handle formats like "2020-2023", "2020-present", "2 years"
#
#             # Year range format
#             year_range = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', duration.lower())
#             if year_range:
#                 start_year = int(year_range.group(1))
#                 end_year_str = year_range.group(2)
#
#                 if end_year_str in ['present', 'current']:
#                     from datetime import datetime
#                     end_year = datetime.now().year
#                 else:
#                     end_year = int(end_year_str)
#
#                 return max(end_year - start_year, 0)
#
#             # Direct year format
#             years_match = re.search(r'(\d+)\s*years?', duration.lower())
#             if years_match:
#                 return int(years_match.group(1))
#
#             return 0
#
#         except Exception as e:
#             logger.error(f"Error parsing duration '{duration}': {e}")
#             return 0
#
#     def calculate_composite_score(self, similarity_score: float,
#                                   skill_match_score: float,
#                                   experience_match_score: float) -> float:
#         """
#         Calculate composite match score
#
#         Args:
#             similarity_score: Semantic similarity score
#             skill_match_score: Skill match score
#             experience_match_score: Experience match score
#
#         Returns:
#             Composite score (0-1)
#         """
#         # Weighted average of different scores
#         weights = {
#             'similarity': 0.5,
#             'skills': 0.3,
#             'experience': 0.2
#         }
#
#         composite_score = (
#                 weights['similarity'] * similarity_score +
#                 weights['skills'] * skill_match_score +
#                 weights['experience'] * experience_match_score
#         )
#
#         return min(composite_score, 1.0)
#
#     def generate_match_reasons(self, resume_data: Dict[str, Any],
#                                job_data: Dict[str, Any]) -> List[str]:
#         """
#         Generate human-readable reasons for the match
#
#         Args:
#             resume_data: Parsed resume data
#             job_data: Job posting data
#
#         Returns:
#             List of match reasons
#         """
#         reasons = []
#
#         try:
#             # Skill matches
#             resume_skills = set()
#             job_skills = set()
#
#             if resume_data.get('skills'):
#                 resume_skills = set(skill.lower() for skill in resume_data['skills'])
#
#             if job_data.get('required_skills'):
#                 job_skills.update(skill.lower() for skill in job_data['required_skills'])
#
#             matching_skills = resume_skills & job_skills
#             if matching_skills:
#                 skills_str = ', '.join(list(matching_skills)[:3])
#                 reasons.append(f"Matching skills: {skills_str}")
#
#             # Experience match
#             resume_years = self.extract_years_of_experience(resume_data)
#             job_years = self.extract_required_experience(job_data)
#
#             if resume_years and job_years:
#                 if resume_years >= job_years:
#                     reasons.append(f"Has required experience ({resume_years} years)")
#                 else:
#                     reasons.append(f"Partial experience match ({resume_years}/{job_years} years)")
#
#             # Education match
#             if resume_data.get('education') and job_data.get('education_requirements'):
#                 reasons.append("Education requirements met")
#
#             # Location match
#             if resume_data.get('contact_info', {}).get('address') and job_data.get('location'):
#                 reasons.append("Location preference match")
#
#             return reasons
#
#         except Exception as e:
#             logger.error(f"Error generating match reasons: {e}")
#             return []
#
#     def batch_match_resumes(self, resume_ids: List[str]) -> Dict[str, List[Dict[str, Any]]]:
#         """
#         Find matches for multiple resumes
#
#         Args:
#             resume_ids: List of resume IDs to match
#
#         Returns:
#             Dictionary mapping resume_id to matches
#         """
#         results = {}
#
#         for resume_id in resume_ids:
#             try:
#                 matches = self.find_matches_for_resume(resume_id)
#                 results[resume_id] = matches
#                 logger.info(f"Found {len(matches)} matches for resume {resume_id}")
#             except Exception as e:
#                 logger.error(f"Error matching resume {resume_id}: {e}")
#                 results[resume_id] = []
#
#         return results
#
#     def get_matching_statistics(self) -> Dict[str, Any]:
#         """Get matching statistics"""
#         try:
#             stats = db_manager.get_processing_stats()
#
#             # Add matching-specific stats
#             total_matches = stats.get('total_matches', 0)
#             processed_resumes = stats.get('processed_resumes', 0)
#
#             avg_matches_per_resume = 0
#             if processed_resumes > 0:
#                 avg_matches_per_resume = total_matches / processed_resumes
#
#             return {
#                 'total_matches': total_matches,
#                 'processed_resumes': processed_resumes,
#                 'avg_matches_per_resume': round(avg_matches_per_resume, 2),
#                 'similarity_threshold': self.similarity_threshold,
#                 'max_matches_per_resume': self.max_matches
#             }
#
#         except Exception as e:
#             logger.error(f"Error getting matching statistics: {e}")
#             return {}
#
#
# # Global job matcher instance
# job_matcher = JobMatcher()
