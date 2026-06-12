import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  getProductReviews,
  getProductStats,
  getTrustScore,
  getFakeReviews,
} from "../services/api";

export default function ProductDetails() {
  const { id } = useParams();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [trust, setTrust] = useState(null);
  const [fakeData, setFakeData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reviewsData = await getProductReviews(id);
        const statsData = await getProductStats(id);
        const trustData = await getTrustScore(id);
        const fakeReviewData = await getFakeReviews(id);

        setReviews(reviewsData);
        setStats(statsData);
        setTrust(trustData);
        setFakeData(fakeReviewData);
      } catch (error) {
        console.error("Error loading product details:", error);
      }
    };

    loadData();
  }, [id]);

  if (!stats || !trust || !fakeData) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>TrustMart AI</h1>

      <h2>Product #{id}</h2>

      {/* Product Stats */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2>⭐ Average Rating: {stats.avg_rating}</h2>
        <h2>📊 Review Count: {stats.review_count}</h2>
      </div>

      {/* Trust Score */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2>🤖 AI Trust Score: {trust.trust_score}%</h2>

        <p>😊 Positive: {trust.sentiment.positive}%</p>
        <p>😐 Neutral: {trust.sentiment.neutral}%</p>
        <p>😡 Negative: {trust.sentiment.negative}%</p>
      </div>

      {/* Fake Reviews */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2>🚨 Fake Review Detection</h2>

        <p>Total Reviews: {fakeData.total_reviews}</p>
        <p>Fake Reviews: {fakeData.fake_reviews}</p>
        <p>Genuine Reviews: {fakeData.genuine_reviews}</p>
        <p>Fake Percentage: {fakeData.fake_percentage}%</p>
      </div>

      <h2>Customer Reviews</h2>

      {reviews.map((review, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "10px",
          }}
        >
          <h3>⭐ {review.score}</h3>

          <h3>{review.summary}</h3>

          <div
            dangerouslySetInnerHTML={{
              __html: review.review_text,
            }}
          />
        </div>
      ))}
    </div>
  );
}