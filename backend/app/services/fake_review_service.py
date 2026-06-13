import joblib
from pathlib import Path

MODEL_PATH = (
    Path(__file__)
    .parent.parent.parent
    / "fake_review_model.pkl"
)

import sys

# Fix for loading HybridFakeDetector pickled in __main__
ROOT_DIR = Path(__file__).parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))
import retrain_model
import __main__
__main__.HybridFakeDetector = retrain_model.HybridFakeDetector

model = joblib.load(str(MODEL_PATH))


def predict_fake_review(review_text, score=None, helpful_num=0, helpful_den=0):
    """
    Predict whether a review is fake.

    Supports both the new HybridFakeDetector (with numerical features
    and predict_proba threshold=0.60) and the legacy sklearn Pipeline
    (predict() only). Falls back gracefully so the API never breaks.

    Returns:
        int: 1 = fake, 0 = genuine
    """
    # New model: HybridFakeDetector with predict_single()
    if hasattr(model, "predict_single"):
        prediction, _ = model.predict_single(
            review_text,
            score=score,
            helpful_num=helpful_num or 0,
            helpful_den=helpful_den or 0,
        )
        return int(prediction)

    # Legacy sklearn Pipeline fallback (predict only)
    try:
        return int(model.predict([review_text])[0])
    except Exception:
        return 0