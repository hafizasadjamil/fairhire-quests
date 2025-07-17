"""
Resume section extraction and parsing using regex and NLP
"""
import re
import logging
from typing import Dict, List, Optional, Any
import spacy
from collections import defaultdict
import config
from utils import clean_text, normalize_skill

logger = logging.getLogger(__name__)


class SectionExtractor:
    def __init__(self):
        self.patterns = config.PATTERNS
        self.skill_synonyms = config.SKILL_SYNONYMS
        self.load_nlp_model()

    def load_nlp_model(self):
        """Load spaCy model for NLP processing"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model successfully")
        except IOError:
            logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None

    def extract_all_sections(self, text: str) -> Dict[str, Any]:
        """Extract all sections from resume text"""

        sections = {
            'contact_info': self.extract_contact_info(text),
            'skills': self.extract_skills(text),
            'experience': self.extract_experience(text),
            'education': self.extract_education(text),
            'summary': self.extract_summary(text),
            'certifications': self.extract_certifications(text),
            'projects': self.extract_projects(text),
            'languages': self.extract_languages(text)
        }

        return sections

    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information"""
        contact_info = {
            'name': '',
            'email': '',
            'phone': '',
            'linkedin': '',
            'github': '',
            'address': ''
        }

        # Extract email
        email_matches = re.findall(self.patterns['email'], text, re.IGNORECASE)
        if email_matches:
            contact_info['email'] = email_matches[0].lower()

        # Extract phone
        phone_matches = re.findall(self.patterns['phone'], text)
        if phone_matches:
            contact_info['phone'] = phone_matches[0]

        # Extract LinkedIn
        linkedin_matches = re.findall(self.patterns['linkedin'], text, re.IGNORECASE)
        if linkedin_matches:
            contact_info['linkedin'] = f"https://{linkedin_matches[0]}"

        # Extract GitHub
        github_matches = re.findall(self.patterns['github'], text, re.IGNORECASE)
        if github_matches:
            contact_info['github'] = f"https://{github_matches[0]}"

        # Extract name (first line or common patterns)
        name = self.extract_name(text)
        if name:
            contact_info['name'] = name

        return contact_info

    def extract_name(self, text: str) -> Optional[str]:
        """Extract candidate name from resume"""
        lines = text.split('\n')

        # Try first few lines
        for line in lines[:5]:
            line = line.strip()
            if len(line) > 0 and len(line) < 50:
                # Check if it looks like a name
                if re.match(r'^[A-Z][a-z]+\s+[A-Z][a-z]+', line):
                    return line

        # Use NLP if available
        if self.nlp:
            doc = self.nlp(text[:500])  # First 500 chars
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text

        return None

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        skills = set()

        # Common skill sections
        skill_sections = [
            'skills', 'technical skills', 'core competencies',
            'technologies', 'programming languages', 'tools'
        ]

        # Look for dedicated skill sections
        for section in skill_sections:
            section_content = self.extract_section_content(text, section)
            if section_content:
                extracted_skills = self.parse_skills_from_text(section_content)
                skills.update(extracted_skills)

        # Also extract skills from entire text
        all_skills = self.parse_skills_from_text(text)
        skills.update(all_skills)

        # Normalize and clean skills
        normalized_skills = []
        for skill in skills:
            normalized = normalize_skill(skill, self.skill_synonyms)
            if normalized and len(normalized) > 1:
                normalized_skills.append(normalized)

        return list(set(normalized_skills))

    def parse_skills_from_text(self, text: str) -> List[str]:
        """Parse skills from text using various methods"""
        skills = set()

        # Common programming languages and technologies
        tech_keywords = [
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'spring',
            'html', 'css', 'sass', 'bootstrap', 'tailwind',
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
            'git', 'github', 'gitlab', 'jira', 'confluence',
            'machine learning', 'deep learning', 'tensorflow', 'pytorch',
            'data science', 'pandas', 'numpy', 'scikit-learn',
            'restful', 'api', 'microservices', 'agile', 'scrum'
        ]

        text_lower = text.lower()

        # Extract tech keywords
        for keyword in tech_keywords:
            if keyword in text_lower:
                skills.add(keyword)

        # Extract from bullet points and lists
        bullet_pattern = r'[•\-\*]\s*([^\n]+)'
        bullet_matches = re.findall(bullet_pattern, text)

        for match in bullet_matches:
            # Clean and split by common separators
            items = re.split(r'[,;|/]', match.strip())
            for item in items:
                clean_item = clean_text(item.strip())
                if clean_item and len(clean_item) > 1:
                    skills.add(clean_item.lower())

        return list(skills)

    def extract_experience(self, text: str) -> List[Dict[str, Any]]:
        """Extract work experience"""
        experience = []

        # Look for experience sections
        exp_sections = [
            'experience', 'work experience', 'professional experience',
            'employment history', 'career history'
        ]

        exp_content = None
        for section in exp_sections:
            content = self.extract_section_content(text, section)
            if content:
                exp_content = content
                break

        if not exp_content:
            return experience

        # Parse experience entries
        # Look for patterns like "Company Name | Job Title | Date"
        company_pattern = r'([A-Z][A-Za-z\s&.,-]+)\s*[\|\-\•]\s*([A-Z][A-Za-z\s]+)\s*[\|\-\•]\s*(\d{4}[\-\s]*\d{4}|\d{4}[\-\s]*present|\d{4}[\-\s]*current)'

        matches = re.findall(company_pattern, exp_content, re.IGNORECASE)

        for match in matches:
            company, title, duration = match
            experience.append({
                'company': company.strip(),
                'title': title.strip(),
                'duration': duration.strip(),
                'description': ''
            })

        return experience

    def extract_education(self, text: str) -> List[Dict[str, Any]]:
        """Extract education information"""
        education = []

        # Look for education sections
        edu_sections = [
            'education', 'academic background', 'qualifications',
            'degrees', 'academic qualifications'
        ]

        edu_content = None
        for section in edu_sections:
            content = self.extract_section_content(text, section)
            if content:
                edu_content = content
                break

        if not edu_content:
            return education

        # Common degree patterns
        degree_pattern = r'(bachelor|master|phd|doctorate|diploma|certificate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?tech|m\.?tech)'

        lines = edu_content.split('\n')
        for line in lines:
            if re.search(degree_pattern, line, re.IGNORECASE):
                education.append({
                    'degree': line.strip(),
                    'institution': '',
                    'year': '',
                    'gpa': ''
                })

        return education

    def extract_summary(self, text: str) -> str:
        """Extract professional summary"""
        summary_sections = [
            'summary', 'professional summary', 'objective',
            'career objective', 'profile', 'about'
        ]

        for section in summary_sections:
            content = self.extract_section_content(text, section)
            if content:
                return content.strip()

        # If no dedicated section, use first paragraph
        lines = text.split('\n')
        for line in lines:
            if len(line.strip()) > 100:  # Substantial content
                return line.strip()

        return ''

    def extract_certifications(self, text: str) -> List[str]:
        """Extract certifications"""
        certifications = []

        cert_sections = [
            'certifications', 'certificates', 'licenses',
            'professional certifications', 'credentials'
        ]

        for section in cert_sections:
            content = self.extract_section_content(text, section)
            if content:
                # Split by lines and clean
                lines = content.split('\n')
                for line in lines:
                    clean_line = line.strip()
                    if clean_line and len(clean_line) > 3:
                        certifications.append(clean_line)

        return certifications

    def extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract project information"""
        projects = []

        project_sections = [
            'projects', 'personal projects', 'key projects',
            'notable projects', 'portfolio'
        ]

        for section in project_sections:
            content = self.extract_section_content(text, section)
            if content:
                # Simple project parsing
                lines = content.split('\n')
                for line in lines:
                    if line.strip() and len(line.strip()) > 10:
                        projects.append({
                            'name': line.strip(),
                            'description': '',
                            'technologies': []
                        })

        return projects

    def extract_languages(self, text: str) -> List[str]:
        """Extract spoken languages"""
        languages = []

        lang_sections = [
            'languages', 'spoken languages', 'language skills',
            'linguistic skills'
        ]

        for section in lang_sections:
            content = self.extract_section_content(text, section)
            if content:
                # Common languages
                common_languages = [
                    'english', 'spanish', 'french', 'german', 'chinese',
                    'japanese', 'korean', 'italian', 'portuguese', 'russian',
                    'arabic', 'hindi', 'bengali', 'urdu', 'turkish'
                ]

                content_lower = content.lower()
                for lang in common_languages:
                    if lang in content_lower:
                        languages.append(lang.capitalize())

        return languages

    def extract_section_content(self, text: str, section_name: str) -> Optional[str]:
        """
        Tries multiple patterns to robustly extract the content of a section.
        """
        section_variants = [
            rf'{section_name}\s*:?[\n\r]+(.*?)(?=\n[A-Z][A-Za-z\s]{{2,}}:|\n\n|\Z)',  # Standard
            rf'{section_name.upper()}(.*?)(?=\n[A-Z][A-Za-z\s]{{2,}}:|\n\n|\Z)',  # UPPERCASE headers
            rf'{section_name.capitalize()}(.*?)(?=\n[A-Z][A-Za-z\s]{{2,}}:|\n\n|\Z)'  # Capitalized
        ]

        for pattern in section_variants:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()

        return None


# Global section extractor instance
section_extractor = SectionExtractor()