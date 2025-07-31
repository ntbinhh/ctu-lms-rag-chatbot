import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./NewsHomeSection_New.css";

const NewsHomeSection = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/news")
      .then(res => {
        setNews(res.data);
        setIsLoading(false);
      })
      .catch(() => {
        setNews([]);
        setIsLoading(false);
      });
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

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (isLoading) {
    return (
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1rem",
        boxSizing: "border-box"
      }}>
        <section className="news-section">
          <h2 className="news-title">TIN TỨC</h2>
          <div className="news-loading">
            {[1, 2, 3].map((item) => (
              <div key={item} className="news-skeleton"></div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1rem",
      boxSizing: "border-box"
    }}>
      <section className="news-section">
        <h2 className="news-title">TIN TỨC & SỰ KIỆN</h2>

        {top2.length > 0 && (
          <div className="top-news">
            {top2.map((item) => (
              <article key={item.id} className="top-news-item">
                <img 
                  src={extractThumbnail(item.content)} 
                  alt={item.title}
                  loading="lazy"
                />
                <div className="news-content">
                  <h3>
                    <Link to={`/news/${item.id}`}>{item.title}</Link>
                  </h3>
                  <p>{extractText(item.content)}</p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '1rem'
                  }}>
                    <small style={{ color: '#1e88e5', fontSize: '0.8rem' }}>
                      {formatDate(item.created_at || new Date())}
                    </small>
                    <Link to={`/news/${item.id}`} className="read-more">
                      Xem thêm
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {latest10.length > 0 && (
          <div className="news-slider">
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              slidesPerGroup={1}
              navigation={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              loop={latest10.length > 3}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
            >
              {latest10.map((item) => (
                <SwiperSlide key={item.id}>
                  <article className="news-card">
                    <img 
                      src={extractThumbnail(item.content)} 
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="news-card-body">
                      <small>TIN TỨC - SỰ KIỆN</small>
                      <p className="card-title">
                        <Link to={`/news/${item.id}`}>{item.title}</Link>
                      </p>
                      <small style={{ 
                        color: '#1e88e5', 
                        fontSize: '0.7rem',
                        marginTop: 'auto',
                        display: 'block'
                      }}>
                        {formatDate(item.created_at || new Date())}
                      </small>
                    </div>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <div className="see-more-wrapper">
              <Link to="/news_home" className="see-more-btn">
                + Xem tất cả tin tức
              </Link>
            </div>
          </div>
        )}

        {news.length === 0 && !isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#5a6c7d'
          }}>
            <i className="pi pi-info-circle" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <p>Chưa có tin tức nào được đăng tải.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default NewsHomeSection;