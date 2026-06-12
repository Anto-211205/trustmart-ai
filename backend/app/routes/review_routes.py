from fastapi import APIRouter
from sqlalchemy import text

from app.database.db import engine
from app.services.sentiment_service import analyze_reviews
from app.services.trust_score_service import calculate_trust_score
from app.services.fake_review_service import (
    predict_fake_review
)
router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


@router.get("/count")
def get_review_count():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM reviews")
        )

        count = result.scalar()

    return {
        "review_count": count
    }


@router.get("/product/{product_id}")
def get_reviews_by_product(product_id: int):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT score,
                       summary,
                       review_text
                FROM reviews
                WHERE amazon_product_id =
                (
                    SELECT amazon_product_id
                    FROM products
                    WHERE id = :product_id
                )
                LIMIT 20
            """),
            {"product_id": product_id}
        )

        reviews = []

        for row in result:
            reviews.append(dict(row._mapping))

    return reviews


@router.get("/stats/{product_id}")
def get_review_stats(product_id: int):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT
                    COUNT(*) AS review_count,
                    ROUND(AVG(score), 2) AS avg_rating
                FROM reviews
                WHERE amazon_product_id =
                (
                    SELECT amazon_product_id
                    FROM products
                    WHERE id = :product_id
                )
            """),
            {"product_id": product_id}
        )

        row = result.fetchone()

    return {
        "review_count": row.review_count,
        "avg_rating": float(row.avg_rating)
        if row.avg_rating else 0
    }


@router.get("/sentiment/{product_id}")
def get_sentiment(product_id: int):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT review_text
                FROM reviews
                WHERE amazon_product_id =
                (
                    SELECT amazon_product_id
                    FROM products
                    WHERE id = :product_id
                )
            """),
            {"product_id": product_id}
        )

        reviews = []

        for row in result:
            reviews.append(dict(row._mapping))
            

    return analyze_reviews(reviews)
@router.get("/trust-score/{product_id}")
def get_trust_score(product_id: int):

    with engine.connect() as conn:

        stats_result = conn.execute(
            text("""
                SELECT
                    COUNT(*) AS review_count,
                    ROUND(AVG(score), 2) AS avg_rating
                FROM reviews
                WHERE amazon_product_id =
                (
                    SELECT amazon_product_id
                    FROM products
                    WHERE id = :product_id
                )
            """),
            {"product_id": product_id}
        )

        stats_row = stats_result.fetchone()

        stats = {
            "review_count": stats_row.review_count,
            "avg_rating": float(stats_row.avg_rating)
        }

        review_result = conn.execute(
            text("""
                SELECT review_text
                FROM reviews
                WHERE amazon_product_id =
                (
                    SELECT amazon_product_id
                    FROM products
                    WHERE id = :product_id
                )
            """),
            {"product_id": product_id}
        )

        reviews = [
            dict(row._mapping)
            for row in review_result
        ]

    sentiment = analyze_reviews(reviews)

    trust_score = calculate_trust_score(
        stats,
        sentiment
    )

    return {
        "trust_score": trust_score,
        "avg_rating": stats["avg_rating"],
        "sentiment": sentiment
    }
@router.get("/fake-reviews/{product_id}")
def get_fake_reviews(product_id: int):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT review_text
                FROM reviews
                WHERE amazon_product_id =
                (
                    SELECT amazon_product_id
                    FROM products
                    WHERE id = :product_id
                )
            """),
            {"product_id": product_id}
        )

        reviews = [
            dict(row._mapping)
            for row in result
        ]

    fake_count = 0

    for review in reviews:

        text_review = review["review_text"]

        prediction = predict_fake_review(
            text_review
        )

        if prediction == 1:
            fake_count += 1

    total_reviews = len(reviews)

    genuine_reviews = (
        total_reviews - fake_count
    )

    fake_percentage = 0

    if total_reviews > 0:
        fake_percentage = round(
            (fake_count / total_reviews)
            * 100,
            2
        )

    return {
        "total_reviews": total_reviews,
        "fake_reviews": fake_count,
        "genuine_reviews": genuine_reviews,
        "fake_percentage": fake_percentage
    }