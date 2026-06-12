import pandas as pd
import joblib

from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer

print("Loading dataset...")

# Use only first 50,000 rows for faster training
df = pd.read_csv(
    "../dataset/Reviews.csv",
    nrows=100000
)

print("Cleaning data...")

df = df[
    [
        "Text",
        "Score",
        "HelpfulnessNumerator",
        "HelpfulnessDenominator"
    ]
].dropna()

print(f"Rows loaded: {len(df)}")

print("Creating fake review labels...")

# Pseudo-label generation
df["fake"] = (
    (df["Score"] == 5)
    &
    (df["HelpfulnessNumerator"] == 0)
).astype(int)

print("Preparing training data...")

X = df["Text"]
y = df["fake"]

print("Building model...")

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            max_features=5000,
            stop_words="english"
        )
    ),
    (
        "rf",
        RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            n_jobs=-1
        )
    )
])

print("Training model...")

model.fit(X, y)

print("Saving model...")

joblib.dump(
    model,
    "fake_review_model.pkl"
)

print("=" * 50)
print("MODEL TRAINED SUCCESSFULLY")
print("File created: fake_review_model.pkl")
print("=" * 50)