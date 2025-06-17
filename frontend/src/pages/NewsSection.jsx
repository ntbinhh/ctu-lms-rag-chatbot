import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./NewsHomeSection.css";

const NewsHomeSection = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/news")
      .then(res => setNews(res.data))
      .catch(() => setNews([]));
  }, []);

  const top2 = news.slice(0, 2);
  const latest10 = news.slice(0, 10);

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
        <div style={{
    width: "80%",
    maxWidth: "2000px",
    margin: "0 auto",
    }}>
    <section className="news-section">
      <h2 className="news-title">TIN TỨC</h2>

      <div className="top-news">
        {top2.map((item) => (
          <div key={item.id} className="top-news-item">
            <img src={extractThumbnail(item.content)} alt="thumb"style={{
    width: "100%",
    maxHeight: "300px",  // ✅ chiều cao tối đa
    objectFit: "cover",
    borderRadius: "4px"
  }} />
            <h3><Link to={`/news/${item.id}`}>{item.title}</Link></h3>
            <p>{extractText(item.content)}</p>
            <Link to={`/news/${item.id}`} className="read-more">Xem thêm</Link>
          </div>
        ))}
      </div>

      <div className="news-slider">
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={3}
          slidesPerGroup={1}
          navigation
          loop={true}
        >
          {latest10.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="news-card">
                <img src={extractThumbnail(item.content)} alt="thumb" />
                <div className="news-card-body">
                  <small>TIN TỨC - SỰ KIỆN</small>
                  <p className="card-title">
                    <Link to={`/news/${item.id}`}>{item.title}</Link>
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="see-more-wrapper">
          <Link to="/news" className="see-more-btn">+ XEM THÊM</Link>
        </div>
      </div>
    </section>
    </div>
  );
};

export default NewsHomeSection;