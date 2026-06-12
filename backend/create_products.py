import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

df = pd.read_sql(
    "SELECT DISTINCT amazon_product_id FROM reviews",
    engine
)

df.rename(
    columns={
        "amazon_product_id":
        "amazon_product_id"
    },
    inplace=True
)

df.to_sql(
    "products",
    engine,
    if_exists="append",
    index=False
)

print(
    "Products imported:",
    len(df)
)