import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>TrustMart Products</h1>

      <h3>Total Products: {products.length}</h3>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            margin: "10px 0",
            borderRadius: "8px",
          }}
        >
          <h2>Product #{product.id}</h2>

          <p>{product.amazon_product_id}</p>

          <Link to={`/product/${product.id}`}>
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Products;