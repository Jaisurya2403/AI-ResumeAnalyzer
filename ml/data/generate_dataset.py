"""
Dataset Generator for Resume-to-Job Suitability Machine Learning Model.
Produces a statistically sound, realistic, reproducible training dataset of candidate-job pairs.
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

def generate_suitability_dataset(n_samples: int = 1500, output_path: str = "training_data.csv") -> pd.DataFrame:
    """
    Generate synthetic yet logically consistent candidate-job suitability data.
    
    Logic:
    - High match ratio (> 0.60) + adequate projects (>= 2) + skills (>= 5) -> High probability of Suitable (1)
    - Low match ratio (< 0.35) or high missing skills (> 10) -> High probability of Not Suitable (0)
    - Mid-tier candidates (skill match 0.40 - 0.55) are decided by experience, internship, projects, and education.
    """
    
    # 1. Total required skills per job typically ranges between 8 and 18
    total_required = np.random.randint(8, 19, size=n_samples)
    
    # 2. Number of skills matched (from 0 up to total_required)
    # Using Beta distribution to create realistic skill distributions across applicant pool
    match_pcts = np.random.beta(a=2.2, b=2.0, size=n_samples) # skewed realistic distribution
    skills_match_count = np.round(match_pcts * total_required).astype(int)
    skills_match_count = np.clip(skills_match_count, 0, total_required)
    
    # 3. Missing skills count
    missing_skills_count = total_required - skills_match_count
    
    # 4. Skills match ratio
    skills_match_ratio = np.round(skills_match_count / total_required, 4)
    
    # 5. Technical skills count (candidate might know other technologies beyond required)
    extra_tech_skills = np.random.poisson(lam=3.5, size=n_samples)
    tech_skills_count = skills_match_count + extra_tech_skills
    tech_skills_count = np.clip(tech_skills_count, 1, 25)
    
    # 6. Projects count (0 to 6)
    projects_count = np.random.choice([0, 1, 2, 3, 4, 5], size=n_samples, p=[0.08, 0.22, 0.35, 0.22, 0.10, 0.03])
    
    # 7. Certifications count (0 to 4)
    certifications_count = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.45, 0.30, 0.15, 0.07, 0.03])
    
    # 8. Experience years (0.0 to 10.0 years)
    exp_pool = np.random.exponential(scale=2.2, size=n_samples)
    experience_years = np.round(np.clip(exp_pool, 0.0, 12.0), 1)
    
    # 9. Education level (0=None/Diploma, 1=Bachelor's, 2=Master's/PhD)
    education_level = np.random.choice([0, 1, 2], size=n_samples, p=[0.07, 0.75, 0.18])
    
    # 10. Programming languages count (1 to 6)
    prog_languages_count = np.random.choice([1, 2, 3, 4, 5, 6], size=n_samples, p=[0.15, 0.35, 0.30, 0.12, 0.06, 0.02])
    
    # 11. Internship indicator (0 or 1)
    has_internship = np.random.binomial(n=1, p=0.62, size=n_samples)
    
    # 12. Resume word count (150 to 900 words)
    resume_word_count = np.random.normal(loc=420, scale=110, size=n_samples).astype(int)
    resume_word_count = np.clip(resume_word_count, 150, 950)
    
    # Calculate Ground-Truth Suitability Score (Supervised Ground Truth)
    # Composite suitability formula weighting key hiring criteria:
    # - Skill Match Ratio: 40%
    # - Project Depth & Practical Work: 20%
    # - Experience & Internship: 20%
    # - Tech Diversity (Languages & Tech Skills): 10%
    # - Education & Certifications: 10%
    
    skill_score = skills_match_ratio * 100.0
    project_score = np.clip(projects_count / 3.0, 0.0, 1.0) * 100.0
    exp_score = np.clip((experience_years * 20.0) + (has_internship * 30.0), 0.0, 100.0)
    tech_score = np.clip((tech_skills_count / 10.0) * 50.0 + (prog_languages_count / 4.0) * 50.0, 0.0, 100.0)
    edu_score = (education_level / 2.0) * 50.0 + (np.clip(certifications_count / 2.0, 0.0, 1.0)) * 50.0
    
    composite_suitability = (
        0.42 * skill_score + 
        0.20 * project_score + 
        0.18 * exp_score + 
        0.12 * tech_score + 
        0.08 * edu_score
    )
    
    # Add subtle real-world noise/variance (-4% to +4%)
    noise = np.random.normal(0, 3.5, size=n_samples)
    final_score = np.clip(composite_suitability + noise, 0.0, 100.0)
    
    # Binary threshold: Candidates with composite score >= 58.0 are marked Suitable (1), otherwise Not Suitable (0)
    # With a strict penalty if critical skills match ratio is under 30%
    suitable = ((final_score >= 58.0) & (skills_match_ratio >= 0.28)).astype(int)
    
    df = pd.DataFrame({
        "skills_match_count": skills_match_count,
        "skills_match_ratio": skills_match_ratio,
        "tech_skills_count": tech_skills_count,
        "projects_count": projects_count,
        "certifications_count": certifications_count,
        "experience_years": experience_years,
        "education_level": education_level,
        "prog_languages_count": prog_languages_count,
        "missing_skills_count": missing_skills_count,
        "has_internship": has_internship,
        "resume_word_count": resume_word_count,
        "suitability_score_raw": np.round(final_score, 2),
        "suitable": suitable
    })
    
    # Save to disk
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} candidate dataset samples at: {output_path}")
    print(f"Class distribution:\n{df['suitable'].value_counts(normalize=True).round(3) * 100}%")
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_csv = os.path.join(current_dir, "training_data.csv")
    generate_suitability_dataset(1500, target_csv)
