import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

print("Loading CSV...")

df = pd.read_csv(
    "../dataset/Reviews.csv",
    nrows=50000
)

print("Rows loaded:", len(df))

reviews_df = pd.DataFrame({
    "amazon_user_id": df["UserId"],
    "amazon_product_id": df["ProductId"],
    "score": df["Score"],
    "helpful_num": df["HelpfulnessNumerator"],
    "helpful_den": df["HelpfulnessDenominator"],
    "review_time": df["Time"],
    "summary": df["Summary"],
    "review_text": df["Text"]
})

print("Importing into PostgreSQL...")

reviews_df.to_sql(
    "reviews",
    engine,
    if_exists="append",
    index=False
)

print("Import Complete!")