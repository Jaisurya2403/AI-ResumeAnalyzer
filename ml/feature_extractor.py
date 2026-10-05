"""
Feature Extractor for Resume-to-Job Suitability Prediction.
Provides unified feature extraction for both model training and real-time inference.
"""

import re
from typing import Dict, List, Any, Tuple

# Standard Role Skill Taxonomies for robust matching
ROLE_SKILL_MAP = {
    "fullstack": [
        "react", "javascript", "typescript", "node.js", "nodejs", "express", 
        "java", "spring boot", "springboot", "python", "sql", "postgresql", 
        "mongodb", "html", "css", "rest api", "git", "docker"
    ],
    "backend": [
        "java", "spring boot", "springboot", "python", "django", "fastapi", 
        "node.js", "nodejs", "c++", "c#", ".net", "go", "golang", "sql", 
        "mysql", "postgresql", "redis", "kafka", "docker", "microservices", 
        "rest api", "graphql", "aws", "git"
    ],
    "frontend": [
        "javascript", "typescript", "react", "next.js", "vue", "angular", 
        "html", "html5", "css", "css3", "tailwind", "sass", "redux", 
        "responsive design", "rest api", "graphql", "webpack", "vite", "git"
    ],
    "devops": [
        "linux", "bash", "shell scripting", "docker", "kubernetes", "k8s", 
        "aws", "azure", "gcp", "terraform", "ansible", "ci/cd", "jenkins", 
        "github actions", "prometheus", "grafana", "git", "python"
    ],
    "machine learning": [
        "python", "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", 
        "numpy", "sql", "machine learning", "deep learning", "nlp", 
        "computer vision", "opencv", "data visualization", "docker", "git"
    ],
    "data science": [
        "python", "r", "sql", "pandas", "numpy", "scikit-learn", "tableau", 
        "power bi", "data analysis", "statistics", "machine learning", 
        "bigquery", "spark", "hadoop", "git"
    ],
    "mobile": [
        "flutter", "dart", "react native", "android", "ios", "kotlin", 
        "swift", "java", "mobile app development", "rest api", "firebase", "git"
    ]
}

PROGRAMMING_LANGUAGES = {
    "java", "python", "c", "c++", "cpp", "c#", "csharp", "javascript", 
    "typescript", "go", "golang", "rust", "ruby", "php", "kotlin", 
    "swift", "dart", "scala", "r", "sql", "bash", "shell", "html", "css"
}

FEATURE_NAMES = [
    "skills_match_count",
    "skills_match_ratio",
    "tech_skills_count",
    "projects_count",
    "certifications_count",
    "experience_years",
    "education_level",
    "prog_languages_count",
    "missing_skills_count",
    "has_internship",
    "resume_word_count"
]


def _normalize_string(s: str) -> str:
    """Normalize string for fuzzy token matching."""
    return re.sub(r'[^a-z0-9#+.]', ' ', str(s).lower()).strip()


def get_required_skills_for_role(role_title: str, custom_job_desc: str = None) -> List[str]:
    """Determine the required skill set from role title or custom job description."""
    role_norm = _normalize_string(role_title or "")
    
    # Check taxonomy matching
    matched_tax = None
    for key, skills in ROLE_SKILL_MAP.items():
        if key in role_norm:
            matched_tax = skills
            break
            
    if not matched_tax:
        # Default to fullstack/general engineering
        matched_tax = ROLE_SKILL_MAP["fullstack"]
        
    required_skills = list(matched_tax)
    
    # If custom job description provided, extract additional technical keywords
    if custom_job_desc and len(custom_job_desc.strip()) > 10:
        desc_norm = _normalize_string(custom_job_desc)
        for lang in PROGRAMMING_LANGUAGES:
            if re.search(r'\b' + re.escape(lang) + r'\b', desc_norm):
                if lang not in required_skills:
                    required_skills.append(lang)
                    
    return required_skills


def extract_features_from_profile(profile: Dict[str, Any], job_role: Dict[str, Any] = None) -> Tuple[Dict[str, float], Dict[str, Any]]:
    """
    Extract numerical feature vector and detailed skill comparison from a structured candidate profile.
    
    Returns:
        (feature_dict, meta_dict)
    """
    job_role = job_role or {}
    role_title = job_role.get("title") or profile.get("targetRole") or "Fullstack Software Engineer"
    job_desc = job_role.get("description") or job_role.get("requirements") or ""
    
    required_skills = get_required_skills_for_role(role_title, job_desc)
    
    # Candidate raw skills
    candidate_skills_raw = profile.get("skills") or []
    candidate_skill_names = []
    
    for s in candidate_skills_raw:
        if isinstance(s, dict):
            candidate_skill_names.append(s.get("name") or s.get("skill") or "")
        elif isinstance(s, str):
            candidate_skill_names.append(s)
            
    # Include languages in skills pool
    candidate_languages = profile.get("languages") or []
    for l in candidate_languages:
        if isinstance(l, str):
            candidate_skill_names.append(l)
            
    normalized_candidate_skills = [_normalize_string(s) for s in candidate_skill_names if s]
    combined_resume_text = _normalize_string(
        " ".join(candidate_skill_names) + " " + 
        (profile.get("summary") or "") + " " + 
        " ".join([str(p.get("name", "")) + " " + str(p.get("description", "")) for p in (profile.get("projects") or []) if isinstance(p, dict)])
    )
    
    # 1. Matched and Missing Skills
    matched_skills = []
    missing_skills = []
    
    for req in required_skills:
        req_norm = _normalize_string(req)
        # Check direct skill list or text presence
        found = any(req_norm == s or req_norm in s or s in req_norm for s in normalized_candidate_skills)
        if not found:
            found = bool(re.search(r'\b' + re.escape(req_norm) + r'\b', combined_resume_text))
            
        if found:
            matched_skills.append(req.title() if len(req) > 3 else req.upper())
        else:
            missing_skills.append(req.title() if len(req) > 3 else req.upper())
            
    skills_match_count = len(matched_skills)
    missing_skills_count = len(missing_skills)
    total_required = max(1, skills_match_count + missing_skills_count)
    skills_match_ratio = round(skills_match_count / total_required, 4)
    
    # 2. Technical Skills Count
    tech_skills_count = max(len(candidate_skill_names), skills_match_count)
    
    # 3. Projects Count
    projects = profile.get("projects") or []
    projects_count = len(projects)
    
    # 4. Certifications Count
    certifications = profile.get("certifications") or []
    certifications_count = len(certifications)
    
    # 5. Experience Years
    exp_years = float(profile.get("experienceYears") or profile.get("yearsOfExperience") or 0.0)
    if exp_years == 0.0:
        # Heuristic inference from summary/text
        exp_match = re.search(r'(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)', combined_resume_text)
        if exp_match:
            try:
                exp_years = float(exp_match.group(1))
            except Exception:
                exp_years = 1.0
        elif projects_count >= 3:
            exp_years = 1.5
        elif projects_count >= 1:
            exp_years = 0.5
            
    # 6. Education Level
    # 0 = None/Diploma, 1 = Bachelor's (B.Tech, BE, BS, BCA), 2 = Master's/PhD (M.Tech, MS, MCA, PhD)
    education_str = _normalize_string(str(profile.get("education") or profile.get("degree") or combined_resume_text))
    education_level = 1  # Default standard Bachelor's
    if any(deg in education_str for deg in ["master", "m.tech", "mtech", "ms", "mca", "phd", "doctorate"]):
        education_level = 2
    elif any(deg in education_str for deg in ["bachelor", "b.tech", "btech", "be", "b.e", "bs", "bca", "b.sc", "bsc"]):
        education_level = 1
    elif any(deg in education_str for deg in ["high school", "diploma", "12th"]):
        education_level = 0
        
    # 7. Programming Languages Count
    prog_langs_found = set()
    for lang in PROGRAMMING_LANGUAGES:
        if any(_normalize_string(lang) == s or _normalize_string(lang) in s for s in normalized_candidate_skills):
            prog_langs_found.add(lang)
        elif re.search(r'\b' + re.escape(lang) + r'\b', combined_resume_text):
            prog_langs_found.add(lang)
    prog_languages_count = max(1, len(prog_langs_found))
    
    # 8. Internship Indicator
    has_internship = 1 if (
        profile.get("hasInternship") or 
        "intern" in combined_resume_text or 
        "trainee" in combined_resume_text or 
        "apprenticeship" in combined_resume_text
    ) else 0
    
    # 9. Resume Word Count
    word_count = len(combined_resume_text.split())
    if word_count < 50:
        word_count = 250 + (tech_skills_count * 15) + (projects_count * 40)
        
    features = {
        "skills_match_count": float(skills_match_count),
        "skills_match_ratio": float(skills_match_ratio),
        "tech_skills_count": float(tech_skills_count),
        "projects_count": float(projects_count),
        "certifications_count": float(certifications_count),
        "experience_years": float(exp_years),
        "education_level": float(education_level),
        "prog_languages_count": float(prog_languages_count),
        "missing_skills_count": float(missing_skills_count),
        "has_internship": float(has_internship),
        "resume_word_count": float(word_count)
    }
    
    meta = {
        "role_title": role_title,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "prog_languages": [l.title() for l in prog_langs_found],
        "total_required_skills": total_required
    }
    
    return features, meta


def extract_features_from_text(resume_text: str, role_title: str = "Fullstack Software Engineer", job_desc: str = "") -> Tuple[Dict[str, float], Dict[str, Any]]:
    """Extract features directly from raw resume text."""
    synthetic_profile = {
        "candidateName": "Candidate",
        "targetRole": role_title,
        "summary": resume_text[:500] if len(resume_text) > 500 else resume_text,
        "skills": [],
        "languages": [],
        "projects": [],
        "education": resume_text
    }
    
    # Find mentioned technical skills in text
    text_norm = _normalize_string(resume_text)
    extracted_skills = []
    for role_k, skills in ROLE_SKILL_MAP.items():
        for s in skills:
            s_norm = _normalize_string(s)
            if re.search(r'\b' + re.escape(s_norm) + r'\b', text_norm):
                if s not in extracted_skills:
                    extracted_skills.append(s)
                    
    synthetic_profile["skills"] = extracted_skills
    
    # Project heuristic
    proj_matches = re.findall(r'(?:project|developed|built|created|engineered)\s*[:\-]?\s*([^\n\r]+)', resume_text, re.IGNORECASE)
    synthetic_profile["projects"] = [{"name": f"Project {i+1}", "description": m} for i, m in enumerate(proj_matches[:5])]
    
    return extract_features_from_profile(synthetic_profile, {"title": role_title, "description": job_desc})
