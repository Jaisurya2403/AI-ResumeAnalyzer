# Machine Learning Component: Resume-to-Job Suitability Prediction

## 1. Problem Statement
In automated recruitment and candidate assessment workflows, relying solely on generative language models for numerical evaluation can lead to hallucinated scores, inconsistency, and lack of reproducible mathematical decision boundaries. 

To solve this, we designed and integrated a **Supervised Machine Learning Module** using a **Random Forest Classifier (`RandomForestClassifier`)** to perform deterministic, probabilistic candidate-to-job suitability classification based on extracted numerical resume features and target job requirements.

---

## 2. Machine Learning Architecture & Workflow

```
Candidate Resume PDF / Text
             ↓
[Document Extraction & OCR]
             ↓
[Structured Resume Parser]
             ↓
[Unified Feature Extractor (feature_extractor.py)]
             ↓
  ┌────────────────────────────────────────────────────────┐
  │ 11-Dimensional Numerical Feature Vector                │
  │ • skills_match_count         • skills_match_ratio      │
  │ • tech_skills_count          • projects_count          │
  │ • certifications_count       • experience_years        │
  │ • education_level            • prog_languages_count    │
  │ • missing_skills_count       • has_internship          │
  │ • resume_word_count                                    │
  └────────────────────────────────────────────────────────┘
             ↓
[Trained Random Forest Classifier (resume_suitability_model.pkl)]
             ↓
  ┌────────────────────────────────────────────────────────┐
  │ ML Model Output                                        │
  │ • Classification: Suitable (1) / Not Suitable (0)      │
  │ • Suitability Probability Score: e.g., 88.4%           │
  │ • Matched & Missing Skills Breakdown                   │
  │ • Feature Importance Rankings                          │
  └────────────────────────────────────────────────────────┘
             ↓
 ┌───────────────────────────────┴───────────────────────────────┐
 │                                                               │
 ▼                                                               ▼
[Oracle Database Persistence & Frontend UI]           [Groq LLM Interview Agent]
• Stored in `candidates` table                        • Contextualizes Round 2 MCQs
• Displayed in Royal Glass ML Card                    • Probes missing skill areas
• Transparent metrics breakdown                       • Adapts practical scenarios
```

---

## 3. Dataset Description & Reproducibility
- **Dataset File**: `ml/data/training_data.csv` (1,500 candidate-job pairs)
- **Data Generator Script**: `ml/data/generate_dataset.py` (Deterministic random seed: `42`)
- **Class Balance**:
  - `1 (Suitable)`: 52.4% (786 samples)
  - `0 (Not Suitable)`: 47.6% (714 samples)
- **Data Formulation**:
  - Skill coverage modeled using Beta distributions reflecting industry applicant pools.
  - Multi-factor hiring ground-truth logic incorporating skill match ratio (42%), project depth (20%), practical experience & internships (18%), tech diversity (12%), and education/certifications (8%) with subtle realistic variance.

---

## 4. Feature Taxonomy (11 Numerical Features)

| # | Feature Name | Data Type | Description |
|---|--------------|-----------|-------------|
| 1 | `skills_match_ratio` | `float` | Ratio of candidate matched skills to total required role skills (0.0 to 1.0) |
| 2 | `skills_match_count` | `int` | Raw count of required role skills found in candidate profile |
| 3 | `missing_skills_count` | `int` | Number of core required skills not found in resume |
| 4 | `projects_count` | `int` | Number of verifiable technical projects |
| 5 | `experience_years` | `float` | Professional / industry experience in years |
| 6 | `tech_skills_count` | `int` | Total count of recognized technical tools, libraries, and frameworks |
| 7 | `resume_word_count` | `int` | Document text density proxy |
| 8 | `prog_languages_count`| `int` | Number of core programming languages (e.g., Java, Python, C++, JS, SQL) |
| 9 | `has_internship` | `int` (0/1) | Indicator of completed internships or industrial training |
| 10| `certifications_count`| `int` | Number of accredited technical certifications |
| 11| `education_level` | `int` | 0 = Diploma/Other, 1 = Bachelor's (B.Tech/BE), 2 = Master's/PhD |

---

## 5. Model Training & Evaluation Metrics

- **Algorithm**: `RandomForestClassifier` (`n_estimators=120`, `max_depth=9`, `class_weight='balanced'`, `random_state=42`)
- **Train/Test Split**: 80% Train (1,200 samples) / 20% Test (300 samples) with Stratification

### Evaluation Results on Unseen Test Set:
- **Training Accuracy**: `97.83%`
- **Testing Accuracy**: `88.33%`
- **Precision**: `86.75%`
- **Recall**: `91.72%`
- **F1-Score**: `89.16%`

### Confusion Matrix (Test Set):
```
                 Predicted Negative (0)    Predicted Positive (1)
Actual Negative:         121 (TN)                   22 (FP)
Actual Positive:          13 (FN)                  144 (TP)
```

### Feature Importance Rankings:
1. `skills_match_ratio`: **26.64%**
2. `skills_match_count`: **15.14%**
3. `missing_skills_count`: **13.21%**
4. `projects_count`: **11.64%**
5. `experience_years`: **10.98%**
6. `tech_skills_count`: **10.91%**
7. `resume_word_count`: **4.20%**
8. `prog_languages_count`: **2.48%**
9. `has_internship`: **2.27%**
10. `certifications_count`: **1.85%**
11. `education_level`: **0.66%**

---

## 6. Separation of Responsibilities: ML vs Groq LLM

| Responsibility | Supervised ML Model (Random Forest) | GenAI LLM (Groq / Qwen / Llama) |
|---|---|---|
| **Role Suitability Prediction** | ✅ Yes (Supervised Binary Classification) | ❌ No |
| **Suitability Probability %** | ✅ Yes (`predict_proba` calibrated score) | ❌ No |
| **Feature Importance Analysis** | ✅ Yes (MDI Tree Importances) | ❌ No |
| **Resume Text Understanding** | ❌ No | ✅ Yes (JSON extraction & OCR parsing) |
| **Adaptive Interview Simulation** | ❌ No | ✅ Yes (Dynamic Question Synthesis) |
| **Voice / Speech Evaluation** | ❌ No | ✅ Yes (Linguistic & grammar feedback) |

---

## 7. How to Run the Complete System

### Step 1: Start ML Microservice (FastAPI - Port 8000)
```powershell
cd "D:\KIT Hackathon\AI-ResumeAnalyzer\ml"
python -m pip install -r requirements.txt
python train_model.py
python app.py
```
*Health endpoint*: `http://localhost:8000/health`  
*Model Info*: `http://localhost:8000/model-info`

### Step 2: Start Backend (Spring Boot - Port 8085)
```powershell
cd "D:\KIT Hackathon\AI-ResumeAnalyzer\Backend"
.\mvnw.cmd spring-boot:run
```

### Step 3: Start Frontend (React + Vite - Port 5173)
```powershell
cd "D:\KIT Hackathon\AI-ResumeAnalyzer\Frontend\my-react-app"
npm install
npm run dev
```
