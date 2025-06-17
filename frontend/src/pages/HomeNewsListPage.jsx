import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NewsListPage = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/news")
      .then(res => setNews(res.data))
      .catch(() => setNews([]));
  }, []);

  const extractThumbnail = (html) => {
    const imgMatch = html.match(/<img.*?src=["'](.*?)["']/);
    return imgMatch ? imgMatch[1] : "https://via.placeholder.com/600x350?text=No+Image";
  };

  const extractText = (html, max = 180) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.slice(0, max) + "...";
  };

  return (
    <>
      <Header />
      <main style={{ width: "70%", maxWidth: "1000px", margin: "2rem auto", padding: "0 1rem" }}>
        <h2 style={{ color: "#0d47a1", marginBottom: "2rem", borderLeft: "5px solid #2196f3", paddingLeft: "0.75rem" }}>
          DANH SÁCH TIN TỨC
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {news.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: "1rem", background: "#fff", padding: "1rem", borderRadius: "6px", boxShadow: "0 1px 5px rgba(0,0,0,0.05)" }}>
              <img
                src={extractThumbnail(item.content)}
                alt="news-thumb"
                style={{ width: "180px", height: "120px", objectFit: "cover", borderRadius: "4px" }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>
                  <Link to={`/news/${item.id}`} style={{ color: "#0d47a1", textDecoration: "none" }}>
                    {item.title}
                  </Link>
                </h3>
                <p style={{ color: "#555", fontSize: "0.95rem" }}>{extractText(item.content)}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NewsListPage;