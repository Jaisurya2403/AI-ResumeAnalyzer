"""
Comprehensive Training Dataset Generator for Resume-to-Job Suitability Prediction.
Generates full CSV datasets with both descriptive metadata and numerical feature vectors.
"""

import os
import random
import numpy as np
import pandas as pd

np.random.seed(42)
random.seed(42)

ROLES = [
    "Fullstack Software Engineer",
    "Backend Java Developer",
    "Frontend React Engineer",
    "Cloud & DevOps Engineer",
    "Python / AI Engineer",
    "Mobile Application Developer"
]

SKILL_SETS = {
    "Fullstack Software Engineer": [
        "React", "JavaScript", "TypeScript", "Node.js", "Java", "Spring Boot", 
        "SQL", "PostgreSQL", "MongoDB", "REST API", "Git", "Docker", "HTML5", "CSS3"
    ],
    "Backend Java Developer": [
        "Java", "Spring Boot", "Microservices", "REST API", "SQL", "PostgreSQL", 
        "MySQL", "Hibernate", "Redis", "Kafka", "Docker", "AWS", "Git", "Maven"
    ],
    "Frontend React Engineer": [
        "React", "JavaScript", "TypeScript", "Next.js", "HTML5", "CSS3", 
        "Tailwind CSS", "Redux", "REST API", "GraphQL", "Webpack", "Vite", "Git"
    ],
    "Cloud & DevOps Engineer": [
        "Linux", "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", 
        "Jenkins", "GitHub Actions", "Ansible", "Python", "Bash", "Prometheus", "Git"
    ],
    "Python / AI Engineer": [
        "Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "NumPy", 
        "SQL", "FastAPI", "Docker", "NLP", "Computer Vision", "REST API", "Git"
    ],
    "Mobile Application Developer": [
        "Flutter", "Dart", "React Native", "Android", "Kotlin", "Swift", 
        "Java", "Firebase", "REST API", "SQLite", "Git", "UI/UX"
    ]
}

FIRST_NAMES = ["Aarav", "Aditi", "Rohan", "Sneha", "Vikram", "Priya", "Rahul", "Ananya", "Karthik", "Pooja", "Alex", "Emily", "David", "Sarah", "Michael", "Elena", "Daniel", "Chloe", "James", "Maya"]
LAST_NAMES = ["Sharma", "Verma", "Patel", "Reddy", "Iyer", "Nair", "Gupta", "Singh", "Kumar", "Rao", "Chen", "Smith", "Johnson", "Brown", "Taylor", "Wilson", "Davis", "Miller", "Anderson", "Thomas"]

def generate_enhanced_dataset(n_samples=2000):
    rows = []
    
    for i in range(n_samples):
        cand_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        target_role = random.choice(ROLES)
        role_skills = SKILL_SETS[target_role]
        total_required = len(role_skills)
        
        # Skill match fraction
        match_pct = float(np.clip(np.random.beta(a=2.2, b=2.0), 0.05, 1.0))
        matched_count = int(np.round(match_pct * total_required))
        matched_count = max(1, min(matched_count, total_required))
        missing_count = total_required - matched_count
        match_ratio = round(matched_count / total_required, 4)
        
        # Selected matched & missing skills
        matched_skills = random.sample(role_skills, matched_count)
        missing_skills = [s for s in role_skills if s not in matched_skills]
        
        # Extra technical skills known
        extra_skills_count = int(np.random.poisson(lam=3.5))
        tech_skills_count = matched_count + extra_skills_count
        
        projects_count = int(np.random.choice([0, 1, 2, 3, 4, 5], p=[0.08, 0.22, 0.35, 0.22, 0.10, 0.03]))
        certifications_count = int(np.random.choice([0, 1, 2, 3, 4], p=[0.45, 0.30, 0.15, 0.07, 0.03]))
        
        exp_years = float(np.round(np.clip(np.random.exponential(scale=2.2), 0.0, 12.0), 1))
        education_level = int(np.random.choice([0, 1, 2], p=[0.07, 0.75, 0.18])) # 0=Diploma, 1=Bachelors, 2=Masters
        education_str = "Diploma / Associate" if education_level == 0 else ("B.Tech / B.E / B.S" if education_level == 1 else "M.Tech / M.S / Ph.D")
        
        prog_languages_count = int(np.random.choice([1, 2, 3, 4, 5, 6], p=[0.15, 0.35, 0.30, 0.12, 0.06, 0.02]))
        has_internship = int(np.random.binomial(n=1, p=0.62))
        resume_word_count = int(np.clip(np.random.normal(loc=420, scale=110), 150, 950))
        
        # Ground-truth suitability calculation
        skill_score = match_ratio * 100.0
        project_score = min(1.0, projects_count / 3.0) * 100.0
        exp_score = min(100.0, (exp_years * 20.0) + (has_internship * 30.0))
        tech_score = min(100.0, (tech_skills_count / 10.0) * 50.0 + (prog_languages_count / 4.0) * 50.0)
        edu_score = (education_level / 2.0) * 50.0 + (min(1.0, certifications_count / 2.0)) * 50.0
        
        composite = (
            0.42 * skill_score + 
            0.20 * project_score + 
            0.18 * exp_score + 
            0.12 * tech_score + 
            0.08 * edu_score
        )
        
        noise = float(np.random.normal(0, 3.5))
        suitability_score_raw = round(float(np.clip(composite + noise, 0.0, 100.0)), 2)
        suitable = 1 if (suitability_score_raw >= 58.0 and match_ratio >= 0.28) else 0
        
        rows.append({
            "candidate_id": f"CAND_{1000 + i}",
            "candidate_name": cand_name,
            "target_role": target_role,
            "skills_match_count": matched_count,
            "skills_match_ratio": match_ratio,
            "tech_skills_count": tech_skills_count,
            "projects_count": projects_count,
            "certifications_count": certifications_count,
            "experience_years": exp_years,
            "education_level": education_level,
            "education_degree": education_str,
            "prog_languages_count": prog_languages_count,
            "missing_skills_count": missing_count,
            "has_internship": has_internship,
            "resume_word_count": resume_word_count,
            "matched_skills": "; ".join(matched_skills),
            "missing_skills": "; ".join(missing_skills),
            "suitability_score_raw": suitability_score_raw,
            "suitable": suitable
        })
        
    df = pd.DataFrame(rows)
    return df

if __name__ == "__main__":
    df = generate_enhanced_dataset(2000)
    
    # 1. Save standard training features file for ML model
    ml_data_dir = r"D:\KIT Hackathon\AI-ResumeAnalyzer\ml\data"
    os.makedirs(ml_data_dir, exist_ok=True)
    
    num_cols = [
        "skills_match_count", "skills_match_ratio", "tech_skills_count", 
        "projects_count", "certifications_count", "experience_years", 
        "education_level", "prog_languages_count", "missing_skills_count", 
        "has_internship", "resume_word_count", "suitability_score_raw", "suitable"
    ]
    df[num_cols].to_csv(os.path.join(ml_data_dir, "training_data.csv"), index=False)
    
    # 2. Save complete comprehensive dataset with text & metadata
    full_csv_path = os.path.join(ml_data_dir, "resume_suitability_training_dataset.csv")
    df.to_csv(full_csv_path, index=False)
    
    # 3. Save copy to project root for easy access
    root_csv_path = r"D:\KIT Hackathon\AI-ResumeAnalyzer\resume_suitability_dataset.csv"
    df.to_csv(root_csv_path, index=False)
    
    print(f"[OK] Training dataset successfully created at:")
    print(f"  1. {os.path.join(ml_data_dir, 'training_data.csv')} (Feature vectors for ML)")
    print(f"  2. {full_csv_path} (Full dataset with names, roles, matched/missing skills)")
    print(f"  3. {root_csv_path} (Root project copy)")
    print(f"Total Records: {len(df)} samples")
    print(f"Class Distribution: {df['suitable'].value_counts().to_dict()}")
