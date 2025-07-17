
"""
Main AI pipeline orchestrator for FairHireQuest
"""
import logging
import time
import sys
from typing import Dict, List, Any, Optional
from datetime import datetime
import argparse

# Import AI components
from db import db_manager
from parse_pdf import extract_text, extract_sections_with_llm
from section_extractor import section_extractor
from embedding import embedding_generator
from matcher import job_matcher
from anonymizer import pii_anonymizer
import config

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format=config.LOG_FORMAT,
    handlers=[
        logging.FileHandler('ai_engine.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class AIEnginePipeline:
    def __init__(self):
        self.stats = {
            'processed_resumes': 0,
            'failed_resumes': 0,
            'generated_embeddings': 0,
            'generated_matches': 0,
            'processing_time': 0
        }

    def process_single_resume(self, resume_id: str) -> bool:
        start_time = time.time()

        try:
            logger.info(f"Processing resume {resume_id}")

            resume = db_manager.get_resume_by_id(resume_id)
            if not resume:
                logger.error(f"Resume {resume_id} not found")
                return False

            file_path = resume.get('file_path')
            if not file_path:
                logger.error(f"No file path for resume {resume_id}")
                return False

            logger.info(f"Extracting text from {file_path}")
            extracted_text = extract_text(file_path)

            if not extracted_text:
                logger.error(f"Failed to extract text from {file_path}")
                db_manager.update_resume_status(resume_id, "failed")
                self.stats['failed_resumes'] += 1
                return False

            logger.info(f"Parsing resume sections for {resume_id}")
            parsed_data = extract_sections_with_llm(extracted_text)

            db_manager.update_resume_status(resume_id, "processed", parsed_data)

            logger.info(f"Generating embedding for {resume_id}")
            embedding = embedding_generator.generate_resume_embedding(parsed_data)

            if embedding:
                db_manager.save_resume_embedding(resume_id, embedding)
                self.stats['generated_embeddings'] += 1

                # ✅ Embed new jobs on-the-fly if needed
                job_docs = list(db_manager.get_jobs_without_embedding())
                if job_docs:
                    logger.info(f"Generating embeddings for {len(job_docs)} new jobs...")
                    for job in job_docs:
                        job_text = f"{job.get('title', '')}\n{job.get('description', '')}"
                        job_embedding = embedding_generator.generate_job_embedding(job_text)
                        db_manager.save_job_embedding(str(job['_id']), job_embedding)

                logger.info(f"Finding job matches for {resume_id}")
                matches = job_matcher.find_matches_for_resume(resume_id)
                logger.info(f"🎯 Matches returned from job_matcher: {matches}")

                if matches:
                    self.stats['generated_matches'] += len(matches)
                    logger.info(f"Found {len(matches)} matches for {resume_id}")
                    db_manager.save_matches_with_user(
                        resume_id,
                        user_id=str(resume.get('user_id')),
                        matches=[
                            {"job_id": job["_id"], "match_reason": job.get("match_reason", "")}
                            for job in matches
                        ]
                    )
                    logger.info(f"💾 Saved {len(matches)} matches for resume {resume_id}")

            if hasattr(resume, 'anonymize') and resume.get('anonymize'):
                logger.info(f"Anonymizing resume {resume_id}")
                anonymized_data = pii_anonymizer.anonymize_resume(parsed_data)
                db_manager.update_resume_status(resume_id, "processed", anonymized_data)

            processing_time = time.time() - start_time
            self.stats['processing_time'] += processing_time
            self.stats['processed_resumes'] += 1

            logger.info(f"Successfully processed resume {resume_id} in {processing_time:.2f} seconds")
            return True

        except Exception as e:
            logger.error(f"Error processing resume {resume_id}: {e}")
            db_manager.update_resume_status(resume_id, "failed")
            self.stats['failed_resumes'] += 1
            return False

    def process_batch(self, limit: int = 100) -> Dict[str, Any]:
        logger.info(f"Starting batch processing (limit: {limit})")
        pending_resumes = db_manager.get_pending_resumes(limit)

        if not pending_resumes:
            logger.info("No pending resumes found")
            return {'processed': 0, 'failed': 0}

        logger.info(f"Found {len(pending_resumes)} pending resumes")

        processed = 0
        failed = 0

        for resume in pending_resumes:
            resume_id = str(resume['_id'])

            if self.process_single_resume(resume_id):
                processed += 1
            else:
                failed += 1

        results = {
            'processed': processed,
            'failed': failed,
            'total': len(pending_resumes)
        }

        logger.info(f"Batch processing complete: {processed} processed, {failed} failed")
        return results

    def process_jobs(self, limit: int = 100) -> Dict[str, Any]:
        logger.info(f"Processing job embeddings (limit: {limit})")
        jobs = db_manager.get_all_jobs()

        if not jobs:
            logger.info("No jobs found")
            return {'processed': 0, 'failed': 0}

        processed = 0
        failed = 0

        for job in jobs[:limit]:
            try:
                job_id = str(job['_id'])

                if 'embedding' in job:
                    continue

                embedding = embedding_generator.generate_job_embedding(job)

                if embedding:
                    db_manager.save_job_embedding(job_id, embedding)
                    processed += 1
                    logger.info(f"Generated embedding for job {job_id}")
                else:
                    failed += 1
                    logger.warning(f"Failed to generate embedding for job {job_id}")

            except Exception as e:
                logger.error(f"Error processing job {job.get('_id', 'unknown')}: {e}")
                failed += 1

        results = {
            'processed': processed,
            'failed': failed,
            'total': len(jobs)
        }

        logger.info(f"Job processing complete: {processed} processed, {failed} failed")
        return results

    def run_full_pipeline(self, resume_limit: int = 100, job_limit: int = 100) -> Dict[str, Any]:
        logger.info("Starting full AI pipeline")
        start_time = time.time()

        job_results = self.process_jobs(job_limit)
        resume_results = self.process_batch(resume_limit)

        total_time = time.time() - start_time
        stats = db_manager.get_processing_stats()

        results = {
            'resumes': resume_results,
            'jobs': job_results,
            'total_processing_time': total_time,
            'database_stats': stats,
            'pipeline_stats': self.stats
        }

        logger.info(f"Full pipeline complete in {total_time:.2f} seconds")
        logger.info(f"Final stats: {stats}")

        return results

    def cleanup_failed_resumes(self) -> int:
        logger.info("Cleaning up failed resumes")
        logger.info("Failed resume cleanup not implemented yet")
        return 0

    def generate_report(self) -> Dict[str, Any]:
        stats = db_manager.get_processing_stats()
        matching_stats = job_matcher.get_matching_statistics()

        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'database_stats': stats,
            'matching_stats': matching_stats,
            'pipeline_stats': self.stats,
            'system_info': {
                'embedding_model': embedding_generator.get_model_info(),
                'similarity_threshold': config.SIMILARITY_THRESHOLD,
                'max_matches_per_resume': config.MAX_MATCHES_PER_RESUME
            }
        }

        return report


def main():
    parser = argparse.ArgumentParser(description='FairHireQuest AI Engine')
    parser.add_argument('--mode', choices=['single', 'batch', 'jobs', 'full', 'report', 'match'],
                        default='batch', help='Processing mode')
    parser.add_argument('--resume-id', help='Resume ID for single processing')
    parser.add_argument('--limit', type=int, default=100, help='Processing limit')
    parser.add_argument('--job-limit', type=int, default=100, help='Job processing limit')

    args = parser.parse_args()
    pipeline = AIEnginePipeline()

    try:
        if args.mode == 'single':
            if not args.resume_id:
                logger.error("Resume ID required for single processing")
                sys.exit(1)

            success = pipeline.process_single_resume(args.resume_id)
            if success:
                logger.info("Single resume processing completed successfully")
            else:
                logger.error("Single resume processing failed")
                sys.exit(1)

        elif args.mode == 'batch':
            results = pipeline.process_batch(args.limit)
            logger.info(f"Batch processing results: {results}")

        elif args.mode == 'jobs':
            results = pipeline.process_jobs(args.limit)
            logger.info(f"Job processing results: {results}")

        elif args.mode == 'full':
            results = pipeline.run_full_pipeline(args.limit, args.job_limit)
            logger.info(f"Full pipeline results: {results}")

        elif args.mode == 'report':
            report = pipeline.generate_report()
            logger.info(f"Processing report: {report}")

        elif args.mode == "match":
            if not args.resume_id:
                logger.error("Please provide --resume_id for match mode")
            else:
                from matcher import job_matcher
                job_matcher.find_matches_for_resume(args.resume_id)


    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)
    finally:
        db_manager.close()
        logger.info("AI Engine shutdown complete")


if __name__ == "__main__":
    main()

# import logging
# import time
# import sys
# from typing import Dict, List, Any, Optional
# from datetime import datetime
# import argparse
#
# # Import AI components
# from db import db_manager
# from parse_pdf import extract_text, extract_sections_with_llm
# from section_extractor import section_extractor
# from embedding import embedding_generator
# from matcher import job_matcher
# from anonymizer import pii_anonymizer
# import config
#
# # Configure logging
# logging.basicConfig(
#     level=getattr(logging, config.LOG_LEVEL),
#     format=config.LOG_FORMAT,
#     handlers=[
#         logging.FileHandler('ai_engine.log'),
#         logging.StreamHandler(sys.stdout)
#     ]
# )
#
# logger = logging.getLogger(__name__)
#
#
# class AIEnginePipeline:
#     def __init__(self):
#         self.stats = {
#             'processed_resumes': 0,
#             'failed_resumes': 0,
#             'generated_embeddings': 0,
#             'generated_matches': 0,
#             'processing_time': 0
#         }
#
#     def process_single_resume(self, resume_id: str) -> bool:
#         """
#         Process a single resume through the AI pipeline
#
#         Args:
#             resume_id: ID of the resume to process
#
#         Returns:
#             True if successful, False otherwise
#         """
#         start_time = time.time()
#
#         try:
#             logger.info(f"Processing resume {resume_id}")
#
#             # 1. Get resume from database
#             resume = db_manager.get_resume_by_id(resume_id)
#             if not resume:
#                 logger.error(f"Resume {resume_id} not found")
#                 return False
#
#             file_path = resume.get('file_path')
#             if not file_path:
#                 logger.error(f"No file path for resume {resume_id}")
#                 return False
#
#             # 2. Extract text from PDF
#             logger.info(f"Extracting text from {file_path}")
#             extracted_text = extract_text(file_path)  # ✅ from PDF
#
#             if not extracted_text:
#                 logger.error(f"Failed to extract text from {file_path}")
#                 db_manager.update_resume_status(resume_id, "failed")
#                 self.stats['failed_resumes'] += 1
#                 return False
#
#             # 3. Parse resume sections
#             logger.info(f"Parsing resume sections for {resume_id}")
#             parsed_data = extract_sections_with_llm(extracted_text)
#
#
#             # 4. Update database with parsed data
#             db_manager.update_resume_status(resume_id, "processed", parsed_data)
#
#             # 5. Generate embedding
#             logger.info(f"Generating embedding for {resume_id}")
#             embedding = embedding_generator.generate_resume_embedding(parsed_data)
#
#             if embedding:
#                 db_manager.save_resume_embedding(resume_id, embedding)
#                 self.stats['generated_embeddings'] += 1
#
#                 # 6. Find job matches
#                 logger.info(f"Finding job matches for {resume_id}")
#                 matches = job_matcher.find_matches_for_resume(resume_id)
#                 logger.info(f"🎯 Matches returned from job_matcher: {matches}")  # ✅ Add this
#
#                 if matches:
#                     self.stats['generated_matches'] += len(matches)
#                     logger.info(f"Found {len(matches)} matches for {resume_id}")
#
#
#             # 7. Optional: Anonymize resume (if requested)
#             if hasattr(resume, 'anonymize') and resume.get('anonymize'):
#                 logger.info(f"Anonymizing resume {resume_id}")
#                 anonymized_data = pii_anonymizer.anonymize_resume(parsed_data)
#                 db_manager.update_resume_status(resume_id, "processed", anonymized_data)
#
#             processing_time = time.time() - start_time
#             self.stats['processing_time'] += processing_time
#             self.stats['processed_resumes'] += 1
#
#             logger.info(f"Successfully processed resume {resume_id} in {processing_time:.2f} seconds")
#             return True
#
#         except Exception as e:
#             logger.error(f"Error processing resume {resume_id}: {e}")
#             db_manager.update_resume_status(resume_id, "failed")
#             self.stats['failed_resumes'] += 1
#             return False
#
#     def process_batch(self, limit: int = 100) -> Dict[str, Any]:
#         """
#         Process a batch of pending resumes
#
#         Args:
#             limit: Maximum number of resumes to process
#
#         Returns:
#             Processing results
#         """
#         logger.info(f"Starting batch processing (limit: {limit})")
#
#         # Get pending resumes
#         pending_resumes = db_manager.get_pending_resumes(limit)
#
#         if not pending_resumes:
#             logger.info("No pending resumes found")
#             return {'processed': 0, 'failed': 0}
#
#         logger.info(f"Found {len(pending_resumes)} pending resumes")
#
#         # Process each resume
#         processed = 0
#         failed = 0
#
#         for resume in pending_resumes:
#             resume_id = str(resume['_id'])
#
#             if self.process_single_resume(resume_id):
#                 processed += 1
#             else:
#                 failed += 1
#
#         results = {
#             'processed': processed,
#             'failed': failed,
#             'total': len(pending_resumes)
#         }
#
#         logger.info(f"Batch processing complete: {processed} processed, {failed} failed")
#         return results
#
#     def process_jobs(self, limit: int = 100) -> Dict[str, Any]:
#         """
#         Process job postings to generate embeddings
#
#         Args:
#             limit: Maximum number of jobs to process
#
#         Returns:
#             Processing results
#         """
#         logger.info(f"Processing job embeddings (limit: {limit})")
#
#         # Get all jobs
#         jobs = db_manager.get_all_jobs()
#
#         if not jobs:
#             logger.info("No jobs found")
#             return {'processed': 0, 'failed': 0}
#
#         processed = 0
#         failed = 0
#
#         for job in jobs[:limit]:
#             try:
#                 job_id = str(job['_id'])
#
#                 # Check if job already has embedding
#                 if 'embedding' in job:
#                     continue
#
#                 # Generate embedding
#                 embedding = embedding_generator.generate_job_embedding(job)
#
#                 if embedding:
#                     db_manager.save_job_embedding(job_id, embedding)
#                     processed += 1
#                     logger.info(f"Generated embedding for job {job_id}")
#                 else:
#                     failed += 1
#                     logger.warning(f"Failed to generate embedding for job {job_id}")
#
#             except Exception as e:
#                 logger.error(f"Error processing job {job.get('_id', 'unknown')}: {e}")
#                 failed += 1
#
#         results = {
#             'processed': processed,
#             'failed': failed,
#             'total': len(jobs)
#         }
#
#         logger.info(f"Job processing complete: {processed} processed, {failed} failed")
#         return results
#
#     def run_full_pipeline(self, resume_limit: int = 100, job_limit: int = 100) -> Dict[str, Any]:
#         """
#         Run the complete AI pipeline
#
#         Args:
#             resume_limit: Maximum resumes to process
#             job_limit: Maximum jobs to process
#
#         Returns:
#             Complete processing results
#         """
#         logger.info("Starting full AI pipeline")
#         start_time = time.time()
#
#         # Process jobs first (to have embeddings for matching)
#         job_results = self.process_jobs(job_limit)
#
#         # Process resumes
#         resume_results = self.process_batch(resume_limit)
#
#         # Calculate total processing time
#         total_time = time.time() - start_time
#
#         # Generate final statistics
#         stats = db_manager.get_processing_stats()
#
#         results = {
#             'resumes': resume_results,
#             'jobs': job_results,
#             'total_processing_time': total_time,
#             'database_stats': stats,
#             'pipeline_stats': self.stats
#         }
#
#         logger.info(f"Full pipeline complete in {total_time:.2f} seconds")
#         logger.info(f"Final stats: {stats}")
#
#         return results
#
#     def cleanup_failed_resumes(self) -> int:
#         """
#         Cleanup failed resume processing attempts
#
#         Returns:
#             Number of resumes reset to pending
#         """
#         logger.info("Cleaning up failed resumes")
#
#         # This would require additional database methods
#         # For now, just log the intent
#         logger.info("Failed resume cleanup not implemented yet")
#         return 0
#
#     def generate_report(self) -> Dict[str, Any]:
#         """
#         Generate processing report
#
#         Returns:
#             Processing report
#         """
#         stats = db_manager.get_processing_stats()
#         matching_stats = job_matcher.get_matching_statistics()
#
#         report = {
#             'timestamp': datetime.utcnow().isoformat(),
#             'database_stats': stats,
#             'matching_stats': matching_stats,
#             'pipeline_stats': self.stats,
#             'system_info': {
#                 'embedding_model': embedding_generator.get_model_info(),
#                 'similarity_threshold': config.SIMILARITY_THRESHOLD,
#                 'max_matches_per_resume': config.MAX_MATCHES_PER_RESUME
#             }
#         }
#
#         return report
#
#
# def main():
#     """Main entry point"""
#     parser = argparse.ArgumentParser(description='FairHireQuest AI Engine')
#     parser.add_argument('--mode', choices=['single', 'batch', 'jobs', 'full', 'report'],
#                         default='batch', help='Processing mode')
#     parser.add_argument('--resume-id', help='Resume ID for single processing')
#     parser.add_argument('--limit', type=int, default=100, help='Processing limit')
#     parser.add_argument('--job-limit', type=int, default=100, help='Job processing limit')
#
#     args = parser.parse_args()
#
#     # Initialize pipeline
#     pipeline = AIEnginePipeline()
#
#     try:
#         if args.mode == 'single':
#             if not args.resume_id:
#                 logger.error("Resume ID required for single processing")
#                 sys.exit(1)
#
#             success = pipeline.process_single_resume(args.resume_id)
#             if success:
#                 logger.info("Single resume processing completed successfully")
#             else:
#                 logger.error("Single resume processing failed")
#                 sys.exit(1)
#
#         elif args.mode == 'batch':
#             results = pipeline.process_batch(args.limit)
#             logger.info(f"Batch processing results: {results}")
#
#         elif args.mode == 'jobs':
#             results = pipeline.process_jobs(args.limit)
#             logger.info(f"Job processing results: {results}")
#
#         elif args.mode == 'full':
#             results = pipeline.run_full_pipeline(args.limit, args.job_limit)
#             logger.info(f"Full pipeline results: {results}")
#
#         elif args.mode == 'report':
#             report = pipeline.generate_report()
#             logger.info(f"Processing report: {report}")
#
#     except KeyboardInterrupt:
#         logger.info("Processing interrupted by user")
#         sys.exit(1)
#     except Exception as e:
#         logger.error(f"Unexpected error: {e}")
#         sys.exit(1)
#     finally:
#         # Cleanup
#         db_manager.close()
#         logger.info("AI Engine shutdown complete")
#
#
# if __name__ == "__main__":
#     main()

