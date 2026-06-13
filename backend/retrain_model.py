"""
TrustMart AI - Fake Review Model: Full Retrain with Fix
========================================================
Fixes:
1. Trains on real DB reviews (not synthetic data)
2. Corrected multi-condition labeling heuristic
3. Adds numerical features: review_length, word_count, rating_norm, helpfulness_ratio
4. class_weight='balanced' on RandomForestClassifier
5. Uses predict_proba() with 0.60 threshold at inference
6. Backs up old model first
7. Prints full classification report + per-product comparison table
"""

import sys
import shutil
import joblib
import warnings
import numpy as np
import pandas as pd
from pathlib import Path
from scipy.sparse import hstack, csr_matrix

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

warnings.filterwarnings("ignore")

MODEL_PATH  = Path(__file__).parent / "fake_review_model.pkl"
BACKUP_PATH = Path(__file__).parent / "fake_review_model_backup.pkl"

# ── Minimum quality thresholds ─────────────────────────────────────────────────
MIN_FAKE_PRECISION = 0.60
MIN_FAKE_RECALL    = 0.40
MIN_ACCURACY       = 0.65


# ══════════════════════════════════════════════════════════════════════════════
# STEP 1: Load training data from the real database
# ══════════════════════════════════════════════════════════════════════════════

def load_db_reviews():
    """Pull all reviews from the real SQLite DB for training."""
    from dotenv import load_dotenv
    import os
    load_dotenv(str(Path(__file__).parent / ".env"))
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        raise RuntimeError("DATABASE_URL not set in .env")

    from sqlalchemy import create_engine, text
    engine = create_engine(db_url)

    print("  Connecting to database...")
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT
                r.score,
                r.helpful_num,
                r.helpful_den,
                r.review_text,
                r.summary
            FROM reviews r
            WHERE r.review_text IS NOT NULL
              AND LENGTH(r.review_text) > 5
        """)).fetchall()

    print(f"  Loaded {len(rows)} reviews from DB.")
    return rows, engine


# ══════════════════════════════════════════════════════════════════════════════
# STEP 2: Corrected multi-condition labeling heuristic
# ══════════════════════════════════════════════════════════════════════════════

def create_labels(rows):
    """
    Corrected fake label heuristic.
    fake = 1 if ANY of:
      (a) rating==5 AND helpfulness_ratio < 0.1 AND review_length < 150 chars
      (b) rating==1 AND helpfulness_ratio < 0.1 AND review_length < 80 chars
      (c) review is extremely short (< 20 chars) — spam/bot pattern
    genuine = 0 otherwise
    """
    records = []
    for row in rows:
        score      = row.score or 3
        hn         = row.helpful_num or 0
        hd         = row.helpful_den or 0
        text_      = row.review_text or ""
        rev_len    = len(text_)
        word_count = len(text_.split())
        help_ratio = (hn / hd) if hd > 0 else 0.0
        rating_norm = (score - 1) / 4.0  # normalize 1-5 to 0-1

        # Multi-condition fake labeling
        is_fake = (
            # Cond (a): 5-star with no community validation and very short
            (score == 5 and help_ratio < 0.1 and rev_len < 150)
            or
            # Cond (b): 1-star with no community validation and very short
            (score == 1 and help_ratio < 0.1 and rev_len < 80)
            or
            # Cond (c): extremely short reviews (< 20 chars = spam/bot)
            (rev_len < 20)
        )

        records.append({
            "text":         text_,
            "score":        score,
            "helpful_num":  hn,
            "helpful_den":  hd,
            "review_length": rev_len,
            "word_count":   word_count,
            "helpfulness_ratio": help_ratio,
            "rating_norm":  rating_norm,
            "fake":         int(is_fake),
        })

    df = pd.DataFrame(records)
    return df


# ══════════════════════════════════════════════════════════════════════════════
# STEP 3: Feature engineering — TF-IDF + numerical features
# ══════════════════════════════════════════════════════════════════════════════

class HybridFakeDetector:
    """
    Combines TF-IDF text features with numerical features:
      - review_length
      - word_count
      - rating_norm (0-1 scaled rating)
      - helpfulness_ratio
    Uses predict_proba with a 0.60 threshold.
    """

    def __init__(self, threshold=0.60):
        self.threshold = threshold
        self.tfidf = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
        )
        self.clf = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )

    def _build_features(self, texts, num_features, fit=False):
        if fit:
            tfidf_mat = self.tfidf.fit_transform(texts)
        else:
            tfidf_mat = self.tfidf.transform(texts)
        num_mat = csr_matrix(num_features)
        return hstack([tfidf_mat, num_mat])

    def fit(self, df):
        texts = df["text"].tolist()
        num_feats = df[["review_length", "word_count", "rating_norm", "helpfulness_ratio"]].values
        X = self._build_features(texts, num_feats, fit=True)
        y = df["fake"].values
        self.clf.fit(X, y)
        return self

    def predict_proba_raw(self, texts, num_feats):
        X = self._build_features(texts, num_feats, fit=False)
        return self.clf.predict_proba(X)[:, 1]

    def predict(self, texts, num_feats=None):
        if num_feats is None:
            # Inference-time default: unknown helpfulness, derive from text
            num_feats = np.array([
                [len(t), len(t.split()), 0.8, 0.0]
                for t in texts
            ])
        probs = self.predict_proba_raw(texts, num_feats)
        return (probs >= self.threshold).astype(int), probs

    def predict_single(self, review_text, score=None, helpful_num=0, helpful_den=0):
        """Called by the inference service for a single review."""
        rev_len    = len(review_text)
        word_count = len(review_text.split())
        help_ratio = (helpful_num / helpful_den) if helpful_den > 0 else 0.0
        rating_norm = ((score - 1) / 4.0) if score is not None else 0.8
        num_feats = np.array([[rev_len, word_count, rating_norm, help_ratio]])
        probs = self.predict_proba_raw([review_text], num_feats)
        return int(probs[0] >= self.threshold), float(probs[0])


def evaluate_model(detector, df_test, label=""):
    """Evaluate model, return metrics dict."""
    texts     = df_test["text"].tolist()
    num_feats = df_test[["review_length", "word_count", "rating_norm", "helpfulness_ratio"]].values
    preds, probs = detector.predict(texts, num_feats)
    y_true = df_test["fake"].values

    print(f"\n{'='*60}")
    print(f"  Classification Report {label}")
    print('='*60)
    report = classification_report(y_true, preds, target_names=["Genuine", "Fake"], output_dict=True)
    print(classification_report(y_true, preds, target_names=["Genuine", "Fake"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_true, preds))

    return report


def try_alternative_classifier(df_train, df_test, detector):
    """Try GradientBoosting if RF doesn't meet thresholds."""
    print("  Trying GradientBoostingClassifier...")
    detector.clf = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42,
    )
    detector.fit(df_train)
    report = evaluate_model(detector, df_test, "(GradientBoosting)")
    fake_metrics = report.get("Fake", {})
    if (fake_metrics.get("precision", 0) >= MIN_FAKE_PRECISION and
            fake_metrics.get("recall", 0) >= MIN_FAKE_RECALL and
            report.get("accuracy", 0) >= MIN_ACCURACY):
        return detector, report
    return None, None


# ══════════════════════════════════════════════════════════════════════════════
# STEP 4: Per-product comparison table
# ══════════════════════════════════════════════════════════════════════════════

def build_comparison_table(engine, detector, old_model):
    """Print Product | Avg Rating | Sentiment % | Fake % Before | Fake % After"""
    from sqlalchemy import text
    from app.services.sentiment_service import analyze_reviews

    with engine.connect() as conn:
        products = conn.execute(text("SELECT id, amazon_product_id FROM products LIMIT 10")).fetchall()

    print(f"\n{'='*85}")
    print(f"  Per-Product Fake % Comparison")
    print(f"{'='*85}")
    print(f"  {'Product ID':<10} {'ASIN':<14} {'Avg Rating':<12} {'Reviews':<9} {'Old Fake%':<12} {'New Fake%'}")
    print(f"  {'-'*80}")

    for prod in products:
        with engine.connect() as conn:
            rows = conn.execute(text("""
                SELECT score, helpful_num, helpful_den, review_text
                FROM reviews
                WHERE amazon_product_id = :asin
            """), {"asin": prod.amazon_product_id}).fetchall()

        if not rows:
            continue

        scores = [r.score for r in rows if r.score]
        avg_rating = round(sum(scores) / len(scores), 2) if scores else 0

        # OLD model fake %
        old_fake = sum(
            1 for r in rows
            if old_model.predict([r.review_text or ""])[0] == 1
        )
        old_pct = round(old_fake / len(rows) * 100, 1) if rows else 0

        # NEW model fake %
        new_fake = sum(
            1 for r in rows
            if detector.predict_single(
                r.review_text or "",
                score=r.score,
                helpful_num=r.helpful_num or 0,
                helpful_den=r.helpful_den or 0,
            )[0] == 1
        )
        new_pct = round(new_fake / len(rows) * 100, 1) if rows else 0

        print(f"  {prod.id:<10} {prod.amazon_product_id:<14} {avg_rating:<12} {len(rows):<9} {old_pct:<12} {new_pct}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    print("=" * 60)
    print("  TrustMart AI -- Fake Review Model Full Retrain")
    print("=" * 60)
    print(f"\n  Python : {sys.version.split()[0]}")
    import sklearn; print(f"  sklearn: {sklearn.__version__}")
    print()

    # ── Backup old model ──────────────────────────────────────────────────────
    if MODEL_PATH.exists():
        shutil.copy2(str(MODEL_PATH), str(BACKUP_PATH))
        print(f"[0] Backed up old model -> {BACKUP_PATH.name}")
        old_model = joblib.load(str(BACKUP_PATH))
    else:
        old_model = None
        print("[0] No existing model to back up.")

    # ── Load DB data ──────────────────────────────────────────────────────────
    print("\n[1] Loading reviews from database...")
    rows, engine = load_db_reviews()

    # ── Label ─────────────────────────────────────────────────────────────────
    print("\n[2] Creating corrected labels...")
    df = create_labels(rows)
    n_fake    = df["fake"].sum()
    n_genuine = (df["fake"] == 0).sum()
    print(f"  Total samples : {len(df)}")
    print(f"  Fake (label=1): {n_fake}  ({n_fake/len(df)*100:.1f}%)")
    print(f"  Genuine (0)   : {n_genuine}  ({n_genuine/len(df)*100:.1f}%)")

    if n_fake == 0 or n_genuine == 0:
        print("  ERROR: All samples in one class. Check DB data.")
        sys.exit(1)

    # ── Train/test split ──────────────────────────────────────────────────────
    print("\n[3] Train/test split (80/20 stratified)...")
    df_train, df_test = train_test_split(
        df, test_size=0.2, random_state=42, stratify=df["fake"]
    )
    print(f"  Train: {len(df_train)}  Test: {len(df_test)}")

    # ── Train RandomForest (primary) ──────────────────────────────────────────
    print("\n[4] Training HybridFakeDetector (RF + numerical features)...")
    detector = HybridFakeDetector(threshold=0.60)
    detector.fit(df_train)
    print("  Training complete.")

    # ── Evaluate ──────────────────────────────────────────────────────────────
    print("\n[5] Evaluating on test set...")
    report = evaluate_model(detector, df_test, "(RandomForest)")
    fake_metrics = report.get("Fake", {})
    accuracy     = report.get("accuracy", 0)

    meets_threshold = (
        fake_metrics.get("precision", 0) >= MIN_FAKE_PRECISION
        and fake_metrics.get("recall", 0) >= MIN_FAKE_RECALL
        and accuracy >= MIN_ACCURACY
    )

    if not meets_threshold:
        print("\n  RF did not meet thresholds. Trying GradientBoosting...")
        alt_detector, alt_report = try_alternative_classifier(df_train, df_test, detector)
        if alt_detector:
            detector = alt_detector
            report   = alt_report
        else:
            print("  WARNING: No classifier met all thresholds. Saving best RF anyway.")

    # ── Comparison table ──────────────────────────────────────────────────────
    print("\n[6] Per-product fake % comparison...")
    if old_model:
        build_comparison_table(engine, detector, old_model)
    else:
        print("  (No old model to compare against)")

    # ── Save ──────────────────────────────────────────────────────────────────
    print(f"\n[7] Saving new model -> {MODEL_PATH.name}")
    joblib.dump(detector, str(MODEL_PATH), protocol=4)
    print("  Saved successfully.")

    # ── Quick sanity check ────────────────────────────────────────────────────
    print("\n[8] Sanity check on saved model...")
    loaded = joblib.load(str(MODEL_PATH))
    test_cases = [
        ("Great!", 5, 0, 0),
        ("I have been using this product for months and the quality is excellent. Worth every penny.", 5, 15, 18),
        ("Very disappointed. Broke after two uses.", 1, 0, 0),
        ("Wonderful product love it amazing!", 5, 0, 0),
        ("Detailed review: setup took time but instructions were clear. Good value for price.", 4, 5, 7),
    ]
    print(f"  {'Review (truncated)':<55} | Score | Pred | Prob(fake)")
    print(f"  {'-'*85}")
    for txt, score, hn, hd in test_cases:
        pred, prob = loaded.predict_single(txt, score=score, helpful_num=hn, helpful_den=hd)
        print(f"  {txt[:55]:<55} | {score}     | {pred}    | {prob:.4f}")

    print("\n" + "=" * 60)
    print("  RETRAIN COMPLETE")
    fake_prec = fake_metrics.get("precision", 0)
    fake_rec  = fake_metrics.get("recall", 0)
    print(f"  Fake Precision : {fake_prec:.2f} (min {MIN_FAKE_PRECISION})")
    print(f"  Fake Recall    : {fake_rec:.2f} (min {MIN_FAKE_RECALL})")
    print(f"  Accuracy       : {accuracy:.2f} (min {MIN_ACCURACY})")
    print(f"  Thresholds met : {'YES' if meets_threshold else 'PARTIAL - see report above'}")
    print("=" * 60)


if __name__ == "__main__":
    main()
