import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export default API;

export const getProducts = async () => {
  const res = await API.get("/products");
  return res.data;
};

export const getProductReviews = async (id) => {
  const res = await API.get(`/reviews/product/${id}`);
  return res.data;
};

export const getProductStats = async (id) => {
  const res = await API.get(`/reviews/stats/${id}`);
  return res.data;
};

export const getTrustScore = async (id) => {
  const res = await API.get(`/reviews/trust-score/${id}`);
  return res.data;
};

export const getFakeReviews = async (id) => {
  const res = await API.get(`/reviews/fake-reviews/${id}`);
  return res.data;
};