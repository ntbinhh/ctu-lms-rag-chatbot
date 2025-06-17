import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./NewsDetailPage.css";
const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8000/news/${id}`)
      .then(res => setNews(res.data))
      .catch(() => setNews(null));
  }, [id]);

  if (!news) return <p style={{ padding: "2rem" }}>Đang tải bài viết...</p>;

  return (
    <>
      <Header />
      <main style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
        <h1 style={{ fontSize: "1.75rem", color: "#0d47a1" }}>{news.title}</h1>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Ngày đăng: {new Date(news.created_at).toLocaleDateString()}
        </p>
        <div
            className="news-content"
          style={{ marginTop: "1.5rem", lineHeight: "1.8", color: "#333" }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
        <div style={{ marginTop: "2rem" }}>
          <Link to="/" style={{ color: "#1e88e5", textDecoration: "underline" }}>← Quay về trang chủ</Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NewsDetailPage;
