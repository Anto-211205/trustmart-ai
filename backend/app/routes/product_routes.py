from fastapi import APIRouter
from sqlalchemy import text

from app.database.db import engine

router = APIRouter()

@router.get("/products/count")
def product_count():

    with engine.connect() as conn:

        result = conn.execute(
            text(
                "SELECT COUNT(*) FROM products"
            )
        )

        count = result.scalar()

    return {
        "product_count": count
    }


@router.get("/reviews/count")
def review_count():

    with engine.connect() as conn:

        result = conn.execute(
            text(
                "SELECT COUNT(*) FROM reviews"
            )
        )

        count = result.scalar()

    return {
        "review_count": count
    }
@router.get("/products")
def get_products():

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT *
                FROM products
                LIMIT 20
            """)
        )

        products = []

        for row in result:
            products.append(
                dict(row._mapping)
            )

    return products