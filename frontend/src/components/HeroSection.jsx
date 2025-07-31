import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";

const HeroSection = () => {
  const [currentText, setCurrentText] = useState(0);
  const texts = [
    "TRUNG TÂM LIÊN KẾT ĐÀO TẠO",
    "ĐẠI HỌC CẦN THƠ",
    "NƠI KHỞI NGUỒN TRI THỨC"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-text-container">
              <h1 className="hero-title">
                {texts.map((text, index) => (
                  <span
                    key={index}
                    className={`hero-text ${index === currentText ? 'active' : ''}`}
                  >
                    {text}
                  </span>
                ))}
              </h1>
              <p className="hero-subtitle">
                Mang đến cơ hội học tập chất lượng cao, 
                kết nối tri thức với thực tiễn, 
                xây dựng tương lai vững chắc cho thế hệ trẻ.
              </p>
              <div className="hero-actions">
                <Button 
                  label="Khám phá ngay" 
                  icon="pi pi-arrow-right" 
                  className="hero-btn primary"
                  onClick={() => window.location.href = '/programs'}
                />
                <Button 
                  label="Xem thêm" 
                  icon="pi pi-play" 
                  className="hero-btn secondary"
                  onClick={() => window.location.href = '/about'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          margin: 2rem 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }

        .hero-background {
          background: linear-gradient(135deg, 
            rgba(12, 77, 162, 0.9) 0%, 
            rgba(30, 136, 229, 0.8) 50%, 
            rgba(33, 150, 243, 0.9) 100%
          ),
          url("/images/banner.jpg");
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          min-height: 500px;
          position: relative;
        }

        .hero-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M10 10h80v80h-80z" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/><circle cx="25" cy="25" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23circuit)"/></svg>');
          pointer-events: none;
        }

        .hero-overlay {
          background: rgba(12, 77, 162, 0.1);
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 0 2rem;
        }

        .hero-content {
          text-align: center;
          max-width: 1000px;
          padding: 2rem;
          color: white;
          width: 100%;
        }

        .hero-text-container {
          position: relative;
          height: 120px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          position: relative;
          line-height: 1.2;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .hero-text {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-text.active {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-btn {
          padding: 1rem 2rem !important;
          font-size: 1.1rem !important;
          font-weight: 600 !important;
          border-radius: 50px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: none !important;
          min-width: 160px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
        }

        .hero-btn.primary {
          background: linear-gradient(135deg, #ffffff, #f0f0f0) !important;
          color: #0c4da2 !important;
        }

        .hero-btn.primary:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.25) !important;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
        }

        .hero-btn.secondary {
          background: transparent !important;
          color: white !important;
          border: 2px solid rgba(255,255,255,0.8) !important;
        }

        .hero-btn.secondary:hover {
          transform: translateY(-3px) !important;
          background: rgba(255,255,255,0.1) !important;
          border-color: white !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.25) !important;
        }

        @media (max-width: 1024px) {
          .hero-content {
            max-width: 900px;
            padding: 1.5rem;
          }
          
          .hero-overlay {
            padding: 0 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .hero-background {
            background-attachment: scroll;
            min-height: 400px;
          }
          
          .hero-overlay {
            min-height: 400px;
            padding: 0 1rem;
          }
          
          .hero-content {
            padding: 1rem;
            max-width: 100%;
          }
          
          .hero-title {
            font-size: 2.2rem;
          }
          
          .hero-text-container {
            height: 100px;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }
          
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .hero-btn {
            width: 100%;
            max-width: 250px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.8rem;
          }
          
          .hero-text-container {
            height: 80px;
          }
          
          .hero-subtitle {
            font-size: 1rem;
          }
          
          .hero-btn {
            font-size: 1rem !important;
            padding: 0.875rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
