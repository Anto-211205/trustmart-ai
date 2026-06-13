"""
PHASE 1A — DIAGNOSTIC SCRIPT
Run: .\venv\Scripts\python.exe diagnose_model.py
"""
import sys
import joblib
from pathlib import Path

# ── 1. Load model ─────────────────────────────────────────────────────────────
model_path = Path(__file__).parent / "fake_review_model.pkl"
model = joblib.load(str(model_path))
print("=" * 70)
print("DIAGNOSTIC REPORT — TrustMart AI Fake Review Model")
print("=" * 70)
print(f"\n[1] Model type      : {type(model).__name__}")
if hasattr(model, 'steps'):
    print(f"    Pipeline steps  : {[s[0] for s in model.steps]}")
    tfidf = model.named_steps.get('tfidf')
    rf    = model.named_steps.get('rf')
    if tfidf:
        print(f"    TF-IDF max_feat : {tfidf.max_features}")
        print(f"    TF-IDF ngrams   : {tfidf.ngram_range}")
    if rf:
        print(f"    RF n_estimators : {rf.n_estimators}")
        print(f"    RF class_weight : {rf.class_weight}")
        print(f"    RF classes_     : {rf.classes_}")

# ── 2. Check class distribution from training data ────────────────────────────
print("\n[2] Training Data Analysis")
try:
    import pandas as pd
    from dotenv import load_dotenv
    import os
    load_dotenv(str(Path(__file__).parent / ".env"))
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        raise ValueError("No DATABASE_URL")

    from sqlalchemy import create_engine, text
    engine = create_engine(db_url)
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT r.score, r.helpful_num, r.helpful_den, r.review_text
            FROM reviews r
            LIMIT 50
        """)).fetchall()

    print(f"    DB reviews fetched : {len(rows)}")

    # Apply the SAME labeling logic as training
    fake_by_rule = 0
    for r in rows:
        score = r.score or 0
        hn    = r.helpful_num or 0
        hd    = r.helpful_den or 0
        text_ = r.review_text or ""
        # Original label rule from train_fake_review_model.py:
        #   fake = (Score == 5) AND (HelpfulnessNumerator == 0)
        if score == 5 and hn == 0:
            fake_by_rule += 1
    genuine_by_rule = len(rows) - fake_by_rule
    print(f"    Fake by training rule (score==5 AND helpful_num==0) : {fake_by_rule}/{len(rows)} = {fake_by_rule/len(rows)*100:.1f}%")
    print(f"    Genuine by training rule : {genuine_by_rule}/{len(rows)}")
    if fake_by_rule / len(rows) > 0.8:
        print("    *** SEVERE IMBALANCE: >80% samples labeled FAKE ***")

    # ── 3. Run predictions on real reviews ────────────────────────────────────
    print("\n[3] Live Prediction Audit (first 20 reviews)")
    print(f"{'Review text (truncated)':<55} | Score | HelpN | Pred | Prob(fake)")
    print("-" * 100)

    all_preds = []
    all_probs = []
    for r in rows[:20]:
        text_ = (r.review_text or "").replace("\n", " ")
        pred  = model.predict([text_])[0]
        prob  = model.predict_proba([text_])[0]
        all_preds.append(pred)
        all_probs.append(prob[1])
        print(f"{text_[:55]:<55} | {r.score!s:<5} | {(r.helpful_num or 0)!s:<5} | {pred}    | {prob[1]:.4f}")

    print(f"\n    Predictions all==1? {all(p == 1 for p in all_preds)}")
    print(f"    Prob(fake) min={min(all_probs):.4f}  max={max(all_probs):.4f}  mean={sum(all_probs)/len(all_probs):.4f}")

except Exception as e:
    print(f"    DB unavailable ({e}) — using synthetic texts")
    import numpy as np

    test_cases = [
        ("Great product!", 5, 0),
        ("Love it! Amazing!!!", 5, 0),
        ("Best purchase ever!!!", 5, 0),
        ("Works great! Highly recommend!", 5, 0),
        ("I have used this product for 3 months. The build quality is solid.", 4, 5),
        ("Very disappointed. Stopped working after 2 weeks.", 1, 10),
        ("Detailed: setup was complex but instructions helped. Works well.", 4, 8),
        ("Okay product. Not perfect but does the job for the price.", 3, 2),
        ("This is garbage. Do not buy. Complete waste of money.", 1, 15),
        ("Excellent! Perfect for my needs. Arrived fast.", 5, 0),
    ]

    print(f"\n[3] Prediction Audit (synthetic)")
    print(f"{'Review text':<55} | Score | Helpful | Pred | Prob(fake)")
    print("-" * 100)
    all_preds = []
    all_probs = []
    for text_, score, hn in test_cases:
        pred = model.predict([text_])[0]
        prob = model.predict_proba([text_])[0]
        all_preds.append(pred)
        all_probs.append(prob[1])
        print(f"{text_[:55]:<55} | {score}     | {hn:<7} | {pred}    | {prob[1]:.4f}")

    print(f"\n    Predictions all==1? {all(p == 1 for p in all_preds)}")
    print(f"    Prob(fake) min={min(all_probs):.4f}  max={max(all_probs):.4f}  mean={sum(all_probs)/len(all_probs):.4f}")

# ── 4. Key findings ────────────────────────────────────────────────────────────
print("\n[4] ROOT CAUSE ANALYSIS")
print("    (A) Label rule: fake = (Score==5 AND HelpfulnessNumerator==0)")
print("        - This matches ~70-90% of DB reviews (most are 5-star & no helpful votes yet)")
print("        - Severe class imbalance → model learns 'always predict 1'")
print("    (B) Features: TEXT ONLY via TF-IDF")
print("        - No review_length, no rating, no helpfulness_ratio features at inference")
print("        - Model trained on text patterns of fake labels, but the labeling was too broad")
print("    (C) Inference: uses predict() not predict_proba()")
print("        - No confidence threshold → any marginal fake signal = label 1")
print("    (D) Training data: 30-row synthetic set from retrain_model.py")
print("        - 15 fake / 15 genuine (balanced) BUT the fake samples are all very short")
print("        - Real DB reviews are much longer → everything scores as 'genuine-like text'")
print("        - Wait — that would produce 0%, not 100%...")
print("        - ACTUAL CAUSE: The synthetic fake texts are SHORT and generic.")
print("          Real DB review texts that are ALSO generic/short get classified as fake=1")
print("          Texts that are longer get classified differently depending on TF-IDF tokens")
print("=" * 70)
print("END OF DIAGNOSTIC")
