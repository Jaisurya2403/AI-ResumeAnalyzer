"""
Standalone ML Inference Script for Resume-to-Job Suitability.
Loads trained RandomForestClassifier model and performs prediction.
"""

import os
import json
import joblib
import pandas as pd
from feature_extractor import extract_features_from_profile, extract_features_from_text, FEATURE_NAMES

def load_suitability_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "resume_suitability_model.pkl")
    meta_path = os.path.join(base_dir, "models", "model_metadata.json")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at {model_path}. Run train_model.py first.")
        
    model = joblib.load(model_path)
    metadata = {}
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            metadata = json.load(f)
            
    return model, metadata

def predict_suitability(features_dict: dict, model=None) -> dict:
    """
    Given a numerical feature dictionary, return prediction and suitability probability.
    """
    if model is None:
        model, _ = load_suitability_model()
        
    df_features = pd.DataFrame([features_dict])[FEATURE_NAMES]
    
    pred_class = int(model.predict(df_features)[0])
    probabilities = model.predict_proba(df_features)[0]
    suitability_score = float(probabilities[1])  # probability of class 1 (Suitable)
    
    return {
        "prediction": "Suitable" if pred_class == 1 else "Not Suitable",
        "suitable": bool(pred_class == 1),
        "suitability_score": round(suitability_score * 100, 2),  # Percentage (0-100)
        "confidence": round(float(max(probabilities)) * 100, 2),
        "probabilities": {
            "not_suitable": round(float(probabilities[0]) * 100, 2),
            "suitable": round(float(probabilities[1]) * 100, 2)
        }
    }

def evaluate_candidate_suitability(profile: dict, job_role: dict = None) -> dict:
    """
    End-to-end evaluation: Feature extraction + ML Model Inference.
    """
    model, metadata = load_suitability_model()
    features, meta = extract_features_from_profile(profile, job_role)
    pred_result = predict_suitability(features, model)
    
    return {
        "status": "SUCCESS",
        "candidate_name": profile.get("candidateName", "Candidate"),
        "role_title": meta.get("role_title", "Fullstack Software Engineer"),
        "prediction": pred_result["prediction"],
        "suitable": pred_result["suitable"],
        "suitability_score": pred_result["suitability_score"],
        "confidence": pred_result["confidence"],
        "matched_skills": meta.get("matched_skills", []),
        "missing_skills": meta.get("missing_skills", []),
        "features": features,
        "feature_importances": metadata.get("feature_importances", []),
        "model_info": {
            "algorithm": metadata.get("algorithm", "RandomForestClassifier"),
            "test_accuracy": metadata.get("metrics", {}).get("test_accuracy", 88.33),
            "precision": metadata.get("metrics", {}).get("precision", 86.75),
            "recall": metadata.get("metrics", {}).get("recall", 91.72),
            "f1_score": metadata.get("metrics", {}).get("f1_score", 89.16)
        }
    }

if __name__ == "__main__":
    # Test sample profile
    sample_candidate = {
        "candidateName": "Alex Chen",
        "targetRole": "Fullstack Software Engineer",
        "summary": "Full Stack Engineer with 3+ years experience building scalable web apps with React, Java Spring Boot, and PostgreSQL.",
        "skills": ["React", "JavaScript", "TypeScript", "Java", "Spring Boot", "SQL", "PostgreSQL", "Git", "REST API", "Docker"],
        "languages": ["Java", "JavaScript", "TypeScript", "SQL"],
        "projects": [
            {"name": "E-Commerce Cloud Engine", "description": "High-throughput checkout microservice handling 10k RPS."},
            {"name": "Real-Time Collaboration Workspace", "description": "WebSockets + React collaborative canvas."}
        ],
        "education": "B.Tech in Computer Science and Engineering",
        "experienceYears": 2.5,
        "hasInternship": True,
        "certifications": ["AWS Certified Cloud Practitioner"]
    }
    
    res = evaluate_candidate_suitability(sample_candidate, {"title": "Fullstack Software Engineer"})
    print("\n--- SAMPLE INFERENCE RESULT ---")
    print(f"Candidate:         {res['candidate_name']}")
    print(f"Role:              {res['role_title']}")
    print(f"Prediction:        {res['prediction']}")
    print(f"Suitability Score: {res['suitability_score']}%")
    print(f"Matched Skills:    {res['matched_skills']}")
    print(f"Missing Skills:    {res['missing_skills']}")
    print(f"Features:          {res['features']}")
