"""
Utility functions for text processing and data cleaning
"""
import re
import logging
from typing import List, Dict, Any, Optional
import unicodedata
import string

logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    """
    Clean and normalize text

    Args:
        text: Input text to clean

    Returns:
        Cleaned text
    """
    if not text:
        return ""

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove special characters (keep basic punctuation)
    text = re.sub(r'[^\w\s\-.,!?@]', '', text)

    # Normalize unicode
    text = unicodedata.normalize('NFKD', text)

    # Strip leading/trailing whitespace
    text = text.strip()

    return text


def normalize_skill(skill: str, synonym_dict: Dict[str, str]) -> str:
    """
    Normalize skill name using synonym dictionary

    Args:
        skill: Skill name to normalize
        synonym_dict: Dictionary of synonyms

    Returns:
        Normalized skill name
    """
    if not skill:
        return ""

    # Clean and lowercase
    normalized = clean_text(skill.lower())

    # Check for synonyms
    return synonym_dict.get(normalized, normalized)


def extract_urls(text: str) -> List[str]:
    """
    Extract URLs from text

    Args:
        text: Input text

    Returns:
        List of URLs found
    """
    url_pattern = r'https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?'
    return re.findall(url_pattern, text)


def extract_email_domains(emails: List[str]) -> List[str]:
    """
    Extract domains from email addresses

    Args:
        emails: List of email addresses

    Returns:
        List of domains
    """
    domains = []
    for email in emails:
        if '@' in email:
            domain = email.split('@')[1].lower()
            domains.append(domain)
    return domains


def calculate_text_statistics(text: str) -> Dict[str, Any]:
    """
    Calculate text statistics

    Args:
        text: Input text

    Returns:
        Dictionary with text statistics
    """
    if not text:
        return {
            'char_count': 0,
            'word_count': 0,
            'line_count': 0,
            'avg_word_length': 0.0
        }

    char_count = len(text)
    words = text.split()
    word_count = len(words)
    line_count = len(text.split('\n'))

    avg_word_length = 0.0
    if word_count > 0:
        avg_word_length = sum(len(word) for word in words) / word_count

    return {
        'char_count': char_count,
        'word_count': word_count,
        'line_count': line_count,
        'avg_word_length': round(avg_word_length, 2)
    }


def remove_stopwords(text: str, language: str = 'en') -> str:
    """
    Remove stopwords from text

    Args:
        text: Input text
        language: Language code

    Returns:
        Text with stopwords removed
    """
    try:
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize

        stop_words = set(stopwords.words('english' if language == 'en' else language))
        tokens = word_tokenize(text.lower())

        filtered_tokens = [token for token in tokens if token not in stop_words and token.isalpha()]

        return ' '.join(filtered_tokens)

    except ImportError:
        logger.warning("NLTK not installed. Stopword removal not available.")
        return text
    except Exception as e:
        logger.error(f"Error removing stopwords: {e}")
        return text


def extract_years_from_text(text: str) -> List[int]:
    """
    Extract years from text

    Args:
        text: Input text

    Returns:
        List of years found
    """
    year_pattern = r'\b(19|20)\d{2}\b'
    year_matches = re.findall(year_pattern, text)

    years = []
    for match in year_matches:
        try:
            year = int(match)
            if 1900 <= year <= 2030:  # Reasonable year range
                years.append(year)
        except ValueError:
            continue

    return sorted(list(set(years)))


def clean_phone_number(phone: str) -> str:
    """
    Clean and format phone number

    Args:
        phone: Input phone number

    Returns:
        Cleaned phone number
    """
    if not phone:
        return ""

    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)

    # Format based on length
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    elif len(digits) == 11 and digits[0] == '1':
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    else:
        return phone  # Return original if can't format


def validate_email(email: str) -> bool:
    """
    Validate email address format

    Args:
        email: Email address to validate

    Returns:
        True if valid, False otherwise
    """
    if not email:
        return False

    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None


def chunk_text(text: str, max_length: int = 1000, overlap: int = 100) -> List[str]:
    """
    Split text into chunks with overlap

    Args:
        text: Input text to chunk
        max_length: Maximum length of each chunk
        overlap: Number of characters to overlap between chunks

    Returns:
        List of text chunks
    """
    if len(text) <= max_length:
        return [text]

    chunks = []
    start = 0

    while start < len(text):
        end = start + max_length

        # Try to break at word boundary
        if end < len(text):
            # Find last space before max_length
            last_space = text.rfind(' ', start, end)
            if last_space > start:
                end = last_space

        chunks.append(text[start:end])
        start = end - overlap

    return chunks


def detect_language(text: str) -> str:
    """
    Detect language of text

    Args:
        text: Input text

    Returns:
        Language code
    """
    try:
        from langdetect import detect
        return detect(text)
    except:
        return 'en'  # Default to English


def remove_html_tags(text: str) -> str:
    """
    Remove HTML tags from text

    Args:
        text: Input text with HTML tags

    Returns:
        Text with HTML tags removed
    """
    clean_pattern = re.compile('<.*?>')
    return re.sub(clean_pattern, '', text)


def extract_sentences(text: str) -> List[str]:
    """
    Extract sentences from text

    Args:
        text: Input text

    Returns:
        List of sentences
    """
    # Simple sentence splitting
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]


def calculate_readability_score(text: str) -> float:
    """
    Calculate simple readability score

    Args:
        text: Input text

    Returns:
        Readability score
    """
    if not text:
        return 0.0

    sentences = extract_sentences(text)
    words = text.split()

    if not sentences or not words:
        return 0.0

    avg_sentence_length = len(words) / len(sentences)
    avg_word_length = sum(len(word) for word in words) / len(words)

    # Simple readability formula
    score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_word_length / 100)

    return max(0, min(100, score))


def fuzzy_match(text1: str, text2: str, threshold: float = 0.8) -> bool:
    """
    Perform fuzzy string matching

    Args:
        text1: First text
        text2: Second text
        threshold: Similarity threshold

    Returns:
        True if texts match above threshold
    """
    try:
        from fuzzywuzzy import fuzz
        similarity = fuzz.ratio(text1.lower(), text2.lower()) / 100.0
        return similarity >= threshold
    except ImportError:
        logger.warning("fuzzywuzzy not installed. Using simple string comparison.")
        return text1.lower() == text2.lower()


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage

    Args:
        filename: Input filename

    Returns:
        Sanitized filename
    """
    # Remove or replace unsafe characters
    unsafe_chars = '<>:"/\\|?*'
    for char in unsafe_chars:
        filename = filename.replace(char, '_')

    # Remove leading/trailing periods and spaces
    filename = filename.strip('. ')

    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:255 - len(ext) - 1] + '.' + ext if ext else name[:255]

    return filename


def deep_clean_text(text: str) -> str:
    """
    Perform deep cleaning of text

    Args:
        text: Input text

    Returns:
        Deep cleaned text
    """
    if not text:
        return ""

    # Remove HTML tags
    text = remove_html_tags(text)

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove special characters except basic punctuation
    text = re.sub(r'[^\w\s\-.,!?@()]', '', text)

    # Remove extra punctuation
    text = re.sub(r'[.]{2,}', '.', text)
    text = re.sub(r'[,]{2,}', ',', text)

    # Remove standalone numbers (unless they look like years)
    text = re.sub(r'\b\d{1,3}\b(?!\d)', '', text)

    # Clean up spaces
    text = re.sub(r'\s+', ' ', text)

    return text.strip()