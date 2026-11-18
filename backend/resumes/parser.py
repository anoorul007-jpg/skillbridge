"""
SkillBridge Resume Parser & NLP Technical Skill Extractor
Uses PyMuPDF (fitz) and python-docx for text extraction, with NLP regex heuristics
and a comprehensive technical skills ontology.
"""

import os
import re
import fitz  # PyMuPDF
from docx import Document

TECHNICAL_SKILLS_DICTIONARY = {
    # Programming Languages
    "Python": ["python", "python3", "py"],
    "JavaScript": ["javascript", "js", "es6", "es2015"],
    "TypeScript": ["typescript", "ts"],
    "Java": ["java", "j2se", "j2ee"],
    "C++": ["c++", "cpp"],
    "C": [" c ", "c programming"],
    "C#": ["c#", "csharp", ".net"],
    "Go": ["golang", " go "],
    "Rust": ["rust"],
    "PHP": ["php"],
    "Ruby": ["ruby", "ruby on rails"],
    "Swift": ["swift"],
    "Kotlin": ["kotlin"],
    "SQL": ["sql", "postgresql", "mysql", "sqlite", "mssql", "pl/sql"],

    # Frontend Technologies
    "React.js": ["react", "react.js", "reactjs"],
    "Vue.js": ["vue", "vue.js", "vuejs"],
    "Angular": ["angular", "angularjs"],
    "HTML5": ["html", "html5"],
    "CSS3": ["css", "css3"],
    "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind-css"],
    "Bootstrap": ["bootstrap", "bootstrap5"],
    "Next.js": ["nextjs", "next.js"],
    "Redux": ["redux", "redux toolkit"],

    # Backend & Web Frameworks
    "Django": ["django", "django rest framework", "drf"],
    "Flask": ["flask"],
    "FastAPI": ["fastapi"],
    "Node.js": ["node", "node.js", "nodejs"],
    "Express.js": ["express", "express.js", "expressjs"],
    "Spring Boot": ["spring boot", "springboot", "spring mvc"],
    "RESTful APIs": ["rest api", "restful api", "rest", "apis", "api development"],
    "GraphQL": ["graphql"],

    # Databases & Storage
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "SQLite": ["sqlite", "sqlite3"],
    "Firebase": ["firebase", "firestore"],

    # Cloud, DevOps & Tools
    "Git": ["git", "github", "gitlab"],
    "Docker": ["docker", "containerization"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "Google Cloud Platform": ["gcp", "google cloud"],
    "Microsoft Azure": ["azure", "microsoft azure"],
    "CI/CD": ["ci/cd", "ci cd", "continuous integration", "github actions", "jenkins"],
    "Linux": ["linux", "ubuntu", "bash", "shell scripting"],

    # Data Science & AI/ML
    "Machine Learning": ["machine learning", "ml"],
    "Deep Learning": ["deep learning", "neural networks"],
    "Artificial Intelligence": ["artificial intelligence", "ai"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "TensorFlow": ["tensorflow", "tf"],
    "PyTorch": ["pytorch"],
    "Natural Language Processing": ["nlp", "natural language processing", "spacy", "nltk"],
    "Computer Vision": ["computer vision", "opencv"],
    "Data Analysis": ["data analysis", "data analytics", "data visualization"],
    "Power BI": ["power bi", "powerbi"],
    "Tableau": ["tableau"],

    # Cybersecurity
    "Network Security": ["network security", "tcp/ip", "firewalls"],
    "Penetration Testing": ["penetration testing", "pen testing", "ethical hacking"],
    "OWASP": ["owasp", "owasp top 10"],
    "Cryptography": ["cryptography", "encryption", "ssl/tls"],
    "Wireshark": ["wireshark", "nmap", "metasploit"],
    "SIEM": ["siem", "soc", "incident response"],
}


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from a PDF file using PyMuPDF."""
    text_chunks = []
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text = page.get_text()
                if text:
                    text_chunks.append(text)
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"
    return "\n".join(text_chunks)


def extract_text_from_docx(docx_path: str) -> str:
    """Extracts raw text from a DOCX file using python-docx."""
    try:
        doc = Document(docx_path)
        text_chunks = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        text_chunks.append(cell.text.strip())
        return "\n".join(text_chunks)
    except Exception as e:
        return f"Error extracting DOCX: {str(e)}"


def parse_resume_content(raw_text: str) -> dict:
    """
    Parses resume text and extracts candidate metadata, skills,
    education, experience, projects, and certifications.
    """
    cleaned_text = raw_text.replace("\r\n", "\n")
    lower_text = " " + cleaned_text.lower() + " "

    # 1. Extract Contact Info
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'(\+?[0-9]{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}'
    linkedin_pattern = r'(https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+)'
    github_pattern = r'(https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+)'

    emails = re.findall(email_pattern, cleaned_text)
    phones = re.findall(phone_pattern, cleaned_text)
    linkedins = re.findall(linkedin_pattern, cleaned_text, re.IGNORECASE)
    githubs = re.findall(github_pattern, cleaned_text, re.IGNORECASE)

    email = emails[0] if emails else ""
    # Format phone if tuple returned by regex
    phone = ""
    if phones:
        first_phone = phones[0]
        phone = "".join(first_phone) if isinstance(first_phone, tuple) else str(first_phone)
        phone = phone.strip()

    linkedin = linkedins[0] if linkedins else ""
    github = githubs[0] if githubs else ""

    # Estimate candidate name (usually top lines)
    lines = [line.strip() for line in cleaned_text.split("\n") if line.strip()]
    candidate_name = ""
    for line in lines[:5]:
        # Skip if contains email, phone, or website
        if "@" in line or "http" in line or re.search(r'\d', line):
            continue
        if len(line.split()) in [2, 3, 4] and len(line) < 40:
            candidate_name = line
            break

    # 2. Extract Skills matching technical dictionary
    detected_skills = []
    for skill_name, aliases in TECHNICAL_SKILLS_DICTIONARY.items():
        matched = False
        for alias in aliases:
            # Word boundary regex search
            pattern = r'(?:\b|_)' + re.escape(alias) + r'(?:\b|_)'
            if re.search(pattern, lower_text):
                matched = True
                break
        if matched:
            detected_skills.append(skill_name)

    # 3. Extract Education Highlights
    education_entries = []
    edu_keywords = ["bachelor", "master", "b.tech", "btech", "b.e", "b.sc", "m.tech", "mtech", "mca", "bca", "university", "institute", "college", "degree", "diploma"]
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(kw in line_lower for kw in edu_keywords):
            # Capture context line
            entry = line
            if i + 1 < len(lines) and len(lines[i+1]) < 80 and not any(h in lines[i+1].lower() for h in ["skills", "experience", "projects"]):
                entry += " - " + lines[i+1]
            if entry not in education_entries and len(education_entries) < 3:
                education_entries.append(entry)

    # 4. Extract Project Highlights
    project_entries = []
    project_headers = ["projects", "academic projects", "personal projects", "key projects"]
    in_project_section = False
    for line in lines:
        line_clean = line.strip()
        line_lower = line_clean.lower()
        if any(h == line_lower or f"{h}:" in line_lower for h in project_headers):
            in_project_section = True
            continue
        if in_project_section:
            if any(s in line_lower for s in ["experience", "work history", "education", "certifications", "skills"]):
                if len(line_clean.split()) <= 3:
                    in_project_section = False
                    continue
            if len(line_clean) > 10 and not line_clean.startswith("•") and len(project_entries) < 4:
                project_entries.append(line_clean)

    # 5. Extract Certifications
    certifications = []
    cert_keywords = ["certified", "certification", "aws certified", "coursera", "udemy", "oracle", "hackerrank", "google cloud certified"]
    for line in lines:
        line_lower = line.lower()
        if any(ck in line_lower for ck in cert_keywords) and len(line) < 120:
            if line.strip() not in certifications and len(certifications) < 4:
                certifications.append(line.strip())

    # 6. Extract Experience / Internships
    experience_entries = []
    exp_keywords = ["intern", "internship", "developer", "engineer", "associate", "specialist", "trainee", "consultant"]
    for line in lines:
        line_lower = line.lower()
        if any(ek in line_lower for ek in exp_keywords) and len(line) < 120:
            if line.strip() not in experience_entries and len(experience_entries) < 4:
                experience_entries.append(line.strip())

    return {
        "candidate_name": candidate_name or "Applicant",
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "skills": detected_skills,
        "education": education_entries,
        "projects": project_entries,
        "certifications": certifications,
        "experience": experience_entries,
        "disclaimer": "SkillBridge parses text using NLP heuristics. Please verify and edit all extracted details to ensure 100% accuracy."
    }
