import joblib
from pathlib import Path

MODEL_PATH = (
    Path(__file__)
    .parent.parent.parent
    / "fake_review_model.pkl"
)

model = joblib.load(MODEL_PATH)


def predict_fake_review(review_text):

    prediction = model.predict(
        [review_text]
    )[0]

    return int(prediction)