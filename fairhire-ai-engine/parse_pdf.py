import os
import json
import requests
import tempfile
import re
from dotenv import load_dotenv
from groq import Groq
from config import GROQ_API_KEY
from PyPDF2 import PdfReader

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def extract_sections_with_llm(text: str) -> dict:
    prompt = f"""
You are an expert resume parser. Given the following resume text, extract these sections clearly:

- Name
- Email
- Phone 
- Location
- Summary or Objective
- Skills (as list)
- Education (as list of {{institution, degree, year}})
- Experience (as list of {{title, company, years}})
- Projects (if any, as list)
- Certifications
- Languages
- LinkedIn (optional)
- GitHub (optional)
- Portfolio (optional)

If any section is missing in the resume, return its value as null (or an empty array for list-type fields).

Resume Text:
{text}

Return only a clean JSON object.
"""

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are a resume parsing assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    raw_output = response.choices[0].message.content

    try:
        json_string = re.search(r'\{.*\}', raw_output, re.DOTALL).group(0)
        parsed_raw = json.loads(json_string)

        # ✅ Normalize keys to lowercase snake_case
        normalized = {}
        for key, value in parsed_raw.items():
            clean_key = key.strip().lower().replace(" ", "_")
            normalized[clean_key] = value

        # ✅ Fix phone field
        if normalized.get("phone_number"):
            normalized["phone"] = fix_phone_format(normalized.pop("phone_number"))
        elif normalized.get("phone"):
            normalized["phone"] = fix_phone_format(normalized["phone"])
        else:
            fallback = fallback_phone_extraction(text)
            normalized["phone"] = fix_phone_format(fallback) if fallback else None

        # ✅ Ensure all fields exist
        expected_fields = [
            "name", "email", "phone", "location", "summary_or_objective",
            "skills", "education", "experience", "projects", "certifications",
            "languages", "linkedin", "github", "portfolio"
        ]
        for field in expected_fields:
            if field not in normalized:
                normalized[field] = [] if field in ["skills", "education", "experience", "projects", "certifications", "languages"] else None

        return normalized

    except Exception as e:
        return {
            "error": "Failed to parse LLM response",
            "details": str(e),
            "raw": raw_output,
        }


def extract_text(file_path_or_url: str) -> str:
    try:
        text = ""

        if file_path_or_url.startswith("http://") or file_path_or_url.startswith("https://"):
            # ✅ Download if it's a URL
            response = requests.get(file_path_or_url)
            response.raise_for_status()
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(response.content)
                tmp_path = tmp_file.name
            reader = PdfReader(tmp_path)
            for page in reader.pages:
                text += page.extract_text() or ""
            os.remove(tmp_path)
        else:
            # ✅ Read from local file system (uploads/resumes/...)
            reader = PdfReader(file_path_or_url)
            for page in reader.pages:
                text += page.extract_text() or ""

        return text.strip()

    except Exception as e:
        return f"Error extracting text: {e}"

def fallback_phone_extraction(text: str) -> str:
    phone_patterns = [
        r"\b(?:\+92|0092)?[-\s]?3[0-9]{2}[-\s]?[0-9]{7}\b",
        r"\(?\d{3,4}\)?[-\s]?\d{6,8}\b"
    ]
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group()
    return None

def fix_phone_format(raw: str) -> str:
    if not raw:
        return None
    digits = re.sub(r"[^\d]", "", raw)
    if digits.startswith("1") and len(digits) == 11:
        return "0" + digits
    if digits.startswith("3") and len(digits) == 10:
        return "0" + digits
    if digits.startswith("03"):
        return digits
    return digits

# import logging
# import os
# from pathlib import Path
# from typing import Optional, Dict, Any
# import PyPDF2
# import pdfplumber
# import fitz  # PyMuPDF
# from io import BytesIO
# import re
# from utils import clean_text
#
# logger = logging.getLogger(__name__)
#
#
# class PDFParser:
#     def __init__(self):
#         self.supported_methods = ['pypdf2', 'pdfplumber', 'pymupdf']
#
#     def extract_text(self, file_path: str, method: str = 'auto') -> Optional[str]:
#         """
#         Extract text from PDF using specified method
#
#         Args:
#             file_path: Path to PDF file
#             method: Extraction method ('auto', 'pypdf2', 'pdfplumber', 'pymupdf')
#
#         Returns:
#             Extracted text or None if failed
#         """
#         if not os.path.exists(file_path):
#             logger.error(f"PDF file not found: {file_path}")
#             return None
#
#         if method == 'auto':
#             # Try methods in order of preference
#             for method_name in self.supported_methods:
#                 try:
#                     text = self._extract_by_method(file_path, method_name)
#                     if text and len(text.strip()) > 50:  # Reasonable amount of text
#                         logger.info(f"Successfully extracted text using {method_name}")
#                         return clean_text(text)
#                 except Exception as e:
#                     logger.warning(f"Method {method_name} failed: {e}")
#                     continue
#
#             logger.error(f"All extraction methods failed for {file_path}")
#             return None
#
#         else:
#             try:
#                 text = self._extract_by_method(file_path, method)
#                 return clean_text(text) if text else None
#             except Exception as e:
#                 logger.error(f"Extraction failed with method {method}: {e}")
#                 return None
#
#     def _extract_by_method(self, file_path: str, method: str) -> Optional[str]:
#         """Extract text using specific method"""
#
#         if method == 'pypdf2':
#             return self._extract_with_pypdf2(file_path)
#         elif method == 'pdfplumber':
#             return self._extract_with_pdfplumber(file_path)
#         elif method == 'pymupdf':
#             return self._extract_with_pymupdf(file_path)
#         else:
#             raise ValueError(f"Unsupported extraction method: {method}")
#
#     def _extract_with_pypdf2(self, file_path: str) -> Optional[str]:
#         """Extract text using PyPDF2"""
#         text = ""
#
#         with open(file_path, 'rb') as file:
#             pdf_reader = PyPDF2.PdfReader(file)
#
#             for page_num in range(len(pdf_reader.pages)):
#                 page = pdf_reader.pages[page_num]
#                 text += page.extract_text() + "\n"
#
#         return text.strip()
#
#     def _extract_with_pdfplumber(self, file_path: str) -> Optional[str]:
#         """Extract text using pdfplumber (better for tables)"""
#         text = ""
#
#         with pdfplumber.open(file_path) as pdf:
#             for page in pdf.pages:
#                 page_text = page.extract_text()
#                 if page_text:
#                     text += page_text + "\n"
#
#         return text.strip()
#
#     def _extract_with_pymupdf(self, file_path: str) -> Optional[str]:
#         """Extract text using PyMuPDF (good for complex layouts)"""
#         text = ""
#
#         doc = fitz.open(file_path)
#         for page in doc:
#             text += page.get_text() + "\n"
#         doc.close()
#
#         return text.strip()
#
#     def extract_metadata(self, file_path: str) -> Dict[str, Any]:
#         """Extract PDF metadata"""
#         metadata = {}
#
#         try:
#             with open(file_path, 'rb') as file:
#                 pdf_reader = PyPDF2.PdfReader(file)
#
#                 if pdf_reader.metadata:
#                     metadata.update({
#                         'title': pdf_reader.metadata.get('/Title', ''),
#                         'author': pdf_reader.metadata.get('/Author', ''),
#                         'subject': pdf_reader.metadata.get('/Subject', ''),
#                         'creator': pdf_reader.metadata.get('/Creator', ''),
#                         'producer': pdf_reader.metadata.get('/Producer', ''),
#                         'creation_date': pdf_reader.metadata.get('/CreationDate', ''),
#                         'modification_date': pdf_reader.metadata.get('/ModDate', '')
#                     })
#
#                 metadata['num_pages'] = len(pdf_reader.pages)
#                 metadata['file_size'] = os.path.getsize(file_path)
#
#         except Exception as e:
#             logger.error(f"Error extracting metadata from {file_path}: {e}")
#
#         return metadata
#
#     def validate_pdf(self, file_path: str) -> bool:
#         """Validate if file is a readable PDF"""
#         try:
#             with open(file_path, 'rb') as file:
#                 pdf_reader = PyPDF2.PdfReader(file)
#                 # Try to read first page
#                 if len(pdf_reader.pages) > 0:
#                     first_page = pdf_reader.pages[0]
#                     text = first_page.extract_text()
#                     return True
#                 return False
#         except Exception as e:
#             logger.error(f"PDF validation failed for {file_path}: {e}")
#             return False
#
#     def detect_language(self, text: str) -> str:
#         """Detect language of extracted text"""
#         try:
#             from langdetect import detect
#             return detect(text)
#         except:
#             return 'en'  # Default to English
#
#     def extract_with_ocr(self, file_path: str) -> Optional[str]:
#         """Extract text using OCR for scanned PDFs"""
#         try:
#             import pytesseract
#             from PIL import Image
#             import fitz
#
#             text = ""
#             doc = fitz.open(file_path)
#
#             for page_num in range(len(doc)):
#                 page = doc[page_num]
#                 pix = page.get_pixmap()
#                 img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
#
#                 # Perform OCR
#                 page_text = pytesseract.image_to_string(img)
#                 text += page_text + "\n"
#
#             doc.close()
#             return text.strip()
#
#         except ImportError:
#             logger.warning("OCR libraries not installed. Install pytesseract and PIL for OCR support.")
#             return None
#         except Exception as e:
#             logger.error(f"OCR extraction failed: {e}")
#             return None
#
#
# # Global PDF parser instance
# pdf_parser = PDFParser()
