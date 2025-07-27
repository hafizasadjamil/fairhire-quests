"""
PII masking and anonymization using Microsoft Presidio
"""
import logging
from typing import Dict, List, Any, Optional
import re
import config

logger = logging.getLogger(__name__)


class PIIAnonymizer:
    def __init__(self):
        self.entities = config.PRESIDIO_ENTITIES
        self.analyzer = None
        self.anonymizer = None
        self.load_presidio()

    def load_presidio(self):
        """Load Presidio analyzer and anonymizer"""
        try:
            from presidio_analyzer import AnalyzerEngine
            from presidio_anonymizer import AnonymizerEngine

            self.analyzer = AnalyzerEngine()
            self.anonymizer = AnonymizerEngine()

            logger.info("Successfully loaded Presidio for PII detection")

        except ImportError:
            logger.warning("Presidio not installed. Install with: pip install presidio-analyzer presidio-anonymizer")
            self.analyzer = None
            self.anonymizer = None
        except Exception as e:
            logger.error(f"Error loading Presidio: {e}")
            self.analyzer = None
            self.anonymizer = None

    def anonymize_text(self, text: str, mask_char: str = "*") -> Dict[str, Any]:
        """
        Anonymize PII in text

        Args:
            text: Input text to anonymize
            mask_char: Character to use for masking

        Returns:
            Dictionary with anonymized text and detected entities
        """
        if not self.analyzer or not self.anonymizer:
            # Fallback to regex-based anonymization
            return self._regex_anonymize(text, mask_char)

        try:
            # Analyze text for PII
            results = self.analyzer.analyze(
                text=text,
                entities=self.entities,
                language='en'
            )

            # Anonymize detected entities
            anonymized_result = self.anonymizer.anonymize(
                text=text,
                analyzer_results=results,
                operators={"DEFAULT": {"type": "mask", "masking_char": mask_char, "chars_to_mask": 5}}
            )

            return {
                'anonymized_text': anonymized_result.text,
                'detected_entities': [
                    {
                        'entity_type': result.entity_type,
                        'start': result.start,
                        'end': result.end,
                        'score': result.score
                    }
                    for result in results
                ]
            }

        except Exception as e:
            logger.error(f"Error in Presidio anonymization: {e}")
            return self._regex_anonymize(text, mask_char)

    def _regex_anonymize(self, text: str, mask_char: str = "*") -> Dict[str, Any]:
        """
        Fallback regex-based anonymization

        Args:
            text: Input text to anonymize
            mask_char: Character to use for masking

        Returns:
            Dictionary with anonymized text and detected entities
        """
        anonymized_text = text
        detected_entities = []

        # Email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.finditer(email_pattern, text)
        for match in emails:
            email = match.group()
            masked_email = email[:2] + mask_char * 5 + email[email.rfind('.'):]
            anonymized_text = anonymized_text.replace(email, masked_email)
            detected_entities.append({
                'entity_type': 'EMAIL_ADDRESS',
                'start': match.start(),
                'end': match.end(),
                'score': 1.0
            })

        # Phone numbers
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.finditer(phone_pattern, text)
        for match in phones:
            phone = match.group()
            masked_phone = mask_char * len(phone)
            anonymized_text = anonymized_text.replace(phone, masked_phone)
            detected_entities.append({
                'entity_type': 'PHONE_NUMBER',
                'start': match.start(),
                'end': match.end(),
                'score': 1.0
            })

        # Names (simple pattern - first word in each line that looks like a name)
        name_pattern = r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b'
        names = re.finditer(name_pattern, text)
        for match in names:
            name = match.group()
            # Keep first letter of first name and last name
            parts = name.split()
            if len(parts) >= 2:
                masked_name = parts[0][0] + mask_char * (len(parts[0]) - 1) + " " + parts[1][0] + mask_char * (
                            len(parts[1]) - 1)
                anonymized_text = anonymized_text.replace(name, masked_name)
                detected_entities.append({
                    'entity_type': 'PERSON',
                    'start': match.start(),
                    'end': match.end(),
                    'score': 0.8
                })

        return {
            'anonymized_text': anonymized_text,
            'detected_entities': detected_entities
        }

    def anonymize_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymize PII in resume data

        Args:
            resume_data: Parsed resume data

        Returns:
            Anonymized resume data
        """
        anonymized_data = resume_data.copy()

        try:
            # Anonymize contact information
            if 'contact_info' in anonymized_data:
                contact_info = anonymized_data['contact_info']

                # Mask name
                if contact_info.get('name'):
                    name_result = self.anonymize_text(contact_info['name'])
                    anonymized_data['contact_info']['name'] = name_result['anonymized_text']

                # Mask email
                if contact_info.get('email'):
                    email_result = self.anonymize_text(contact_info['email'])
                    anonymized_data['contact_info']['email'] = email_result['anonymized_text']

                # Mask phone
                if contact_info.get('phone'):
                    phone_result = self.anonymize_text(contact_info['phone'])
                    anonymized_data['contact_info']['phone'] = phone_result['anonymized_text']

            # Anonymize experience company names (optional)
            if 'experience' in anonymized_data:
                for exp in anonymized_data['experience']:
                    if exp.get('company'):
                        # Optionally mask company names
                        # exp['company'] = self.anonymize_text(exp['company'])['anonymized_text']
                        pass

            # Anonymize education institution names (optional)
            if 'education' in anonymized_data:
                for edu in anonymized_data['education']:
                    if edu.get('institution'):
                        # Optionally mask institution names
                        # edu['institution'] = self.anonymize_text(edu['institution'])['anonymized_text']
                        pass

            return anonymized_data

        except Exception as e:
            logger.error(f"Error anonymizing resume: {e}")
            return resume_data

    def detect_pii_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Detect PII entities in text without anonymizing

        Args:
            text: Input text to analyze

        Returns:
            List of detected entities
        """
        if not self.analyzer:
            return self._regex_detect_pii(text)

        try:
            results = self.analyzer.analyze(
                text=text,
                entities=self.entities,
                language='en'
            )

            return [
                {
                    'entity_type': result.entity_type,
                    'start': result.start,
                    'end': result.end,
                    'score': result.score,
                    'text': text[result.start:result.end]
                }
                for result in results
            ]

        except Exception as e:
            logger.error(f"Error detecting PII entities: {e}")
            return self._regex_detect_pii(text)

    def _regex_detect_pii(self, text: str) -> List[Dict[str, Any]]:
        """Fallback regex-based PII detection"""
        entities = []

        # Email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        for match in re.finditer(email_pattern, text):
            entities.append({
                'entity_type': 'EMAIL_ADDRESS',
                'start': match.start(),
                'end': match.end(),
                'score': 1.0,
                'text': match.group()
            })

        # Phone numbers
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        for match in re.finditer(phone_pattern, text):
            entities.append({
                'entity_type': 'PHONE_NUMBER',
                'start': match.start(),
                'end': match.end(),
                'score': 1.0,
                'text': match.group()
            })

        # Names
        name_pattern = r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b'
        for match in re.finditer(name_pattern, text):
            entities.append({
                'entity_type': 'PERSON',
                'start': match.start(),
                'end': match.end(),
                'score': 0.8,
                'text': match.group()
            })

        return entities

    def get_anonymization_stats(self, text: str) -> Dict[str, Any]:
        """
        Get statistics about PII in text

        Args:
            text: Input text to analyze

        Returns:
            Dictionary with PII statistics
        """
        entities = self.detect_pii_entities(text)

        entity_counts = {}
        for entity in entities:
            entity_type = entity['entity_type']
            entity_counts[entity_type] = entity_counts.get(entity_type, 0) + 1

        return {
            'total_entities': len(entities),
            'entity_counts': entity_counts,
            'entities': entities
        }


# Global PII anonymizer instance
pii_anonymizer = PIIAnonymizer()