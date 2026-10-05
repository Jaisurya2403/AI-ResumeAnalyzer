"""
Training Pipeline for Resume-to-Job Suitability Machine Learning Model.
Uses RandomForestClassifier from scikit-learn.
Outputs trained serialized model, evaluation metrics, and feature importance rankings.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def train_and_evaluate_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "training_data.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_output_path = os.path.join(models_dir, "resume_suitability_model.pkl")
    meta_output_path = os.path.join(models_dir, "model_metadata.json")
    
    print("=================================================================")
    print("STARTING RESUME SUITABILITY RANDOM FOREST TRAINING PIPELINE")
    print("=================================================================")
    
    if not os.path.exists(data_path):
        from data.generate_dataset import generate_suitability_dataset
        print(f"Data file not found. Generating new dataset at {data_path}...")
        df = generate_suitability_dataset(1500, data_path)
    else:
        df = pd.read_csv(data_path)
        print(f"Loaded dataset from {data_path} with {len(df)} samples.")
        
    feature_cols = [
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
    
    X = df[feature_cols]
    y = df["suitable"]
    
    print(f"\nFeatures ({len(feature_cols)}): {', '.join(feature_cols)}")
    print(f"Target distribution:\n{y.value_counts()}")
    
    # Train / Test Split (80% Train, 20% Test, Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"\nTraining set size: {len(X_train)} samples")
    print(f"Testing set size: {len(X_test)} samples")
    
    # Initialize & Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=120,
        max_depth=9,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    
    print("\nTraining RandomForestClassifier...")
    rf_model.fit(X_train, y_train)
    print("[OK] Model training completed successfully.")
    
    # Predictions
    y_train_pred = rf_model.predict(X_train)
    y_test_pred = rf_model.predict(X_test)
    y_test_proba = rf_model.predict_proba(X_test)[:, 1]
    
    # Calculate Evaluation Metrics
    train_accuracy = float(accuracy_score(y_train, y_train_pred))
    test_accuracy = float(accuracy_score(y_test, y_test_pred))
    precision = float(precision_score(y_test, y_test_pred))
    recall = float(recall_score(y_test, y_test_pred))
    f1 = float(f1_score(y_test, y_test_pred))
    cm = confusion_matrix(y_test, y_test_pred).tolist()
    
    # Feature Importances
    importances = rf_model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    
    feature_importance_list = []
    for idx in sorted_idx:
        feat_name = feature_cols[idx]
        feat_imp = float(importances[idx])
        feature_importance_list.append({
            "feature": feat_name,
            "importance": round(feat_imp, 4),
            "percentage": round(feat_imp * 100, 2)
        })
        
    print("\n=================================================================")
    print("MODEL EVALUATION RESULTS (TEST SET)")
    print("=================================================================")
    print(f"Algorithm:           RandomForestClassifier (n_estimators=120, max_depth=9)")
    print(f"Training Accuracy:   {train_accuracy * 100:.2f}%")
    print(f"Testing Accuracy:    {test_accuracy * 100:.2f}%")
    print(f"Precision:           {precision * 100:.2f}%")
    print(f"Recall:              {recall * 100:.2f}%")
    print(f"F1-Score:            {f1 * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(f"  [ TN: {cm[0][0]:3d} | FP: {cm[0][1]:3d} ]")
    print(f"  [ FN: {cm[1][0]:3d} | TP: {cm[1][1]:3d} ]")
    
    print("\nFeature Importances:")
    for item in feature_importance_list:
        bar = "#" * int(item["percentage"] / 2)
        print(f"  {item['feature']:<22} {item['percentage']:5.2f}% | {bar}")
        
    # Save Model Artifacts
    joblib.dump(rf_model, model_output_path)
    print(f"\n[OK] Saved trained model to: {model_output_path}")
    
    metadata = {
        "model_name": "Resume-to-Job Suitability Classifier",
        "algorithm": "RandomForestClassifier",
        "hyperparameters": {
            "n_estimators": 120,
            "max_depth": 9,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
            "max_features": "sqrt",
            "class_weight": "balanced",
            "random_state": 42
        },
        "dataset": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features_count": len(feature_cols)
        },
        "features": feature_cols,
        "metrics": {
            "train_accuracy": round(train_accuracy * 100, 2),
            "test_accuracy": round(test_accuracy * 100, 2),
            "precision": round(precision * 100, 2),
            "recall": round(recall * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1]
            }
        },
        "feature_importances": feature_importance_list
    }
    
    with open(meta_output_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"[OK] Saved metadata and metrics to: {meta_output_path}")
    print("=================================================================\n")
    return metadata

if __name__ == "__main__":
    train_and_evaluate_model()
