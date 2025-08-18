import React from "react";
import { Button } from "primereact/button";

const IntroductionSection = () => {
  const features = [
    {
      icon: "pi pi-graduation-cap",
      title: "Chương trình Đào tạo Chất lượng",
      description: "Đào tạo theo tiêu chuẩn quốc tế với đội ngũ giảng viên giàu kinh nghiệm từ Đại học Cần Thơ",
      color: "#2196F3"
    },
    {
      icon: "pi pi-users",
      title: "Môi trường Học tập Hiện đại",
      description: "Cơ sở vật chất hiện đại, trang thiết bị tiên tiến phục vụ học tập và nghiên cứu hiệu quả",
      color: "#4CAF50"
    },
    {
      icon: "pi pi-globe",
      title: "Kết nối Quốc tế",
      description: "Hợp tác với các trường đại học và tổ chức giáo dục uy tín trên thế giới",
      color: "#FF9800"
    },
    {
      icon: "pi pi-trophy",
      title: "Thành tựu Xuất sắc",
      description: "Được công nhận và đánh giá cao về chất lượng đào tạo trong khu vực ĐBSCL",
      color: "#9C27B0"
    }
  ];

  return (
    <div className="introduction-section">
      <div className="intro-header">
        <div className="title-wrapper">
          <span className="section-badge animate-fade-up">Giới thiệu</span>
          <h2 className="section-title animate-fade-up">
            Trung tâm Liên kết Đào tạo
            <span className="title-highlight">Đại học Cần Thơ</span>
          </h2>
        </div>
        <p className="section-subtitle animate-fade-up">
          Nơi khởi nguồn tri thức, kết nối tương lai. Chúng tôi tự hào là trung tâm liên kết đào tạo 
          hàng đầu khu vực Đồng bằng sông Cửu Long, mang đến cơ hội học tập chất lượng cao cho mọi học viên.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`feature-card animate-fade-up`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div 
              className="feature-icon"
              style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
            >
              <i className={feature.icon}></i>
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="intro-actions animate-fade-up">
        <Button 
          label="Tìm hiểu thêm" 
          icon="pi pi-arrow-right" 
          className="intro-btn intro-btn-learn"
          onClick={() => window.location.href = '/about'}
        />
        {/* <Button 
          label="Xem chương trình đào tạo" 
          icon="pi pi-book" 
          className="intro-btn intro-btn-programs"
          onClick={() => window.location.href = '/programs'}
        /> */}
      </div>

      <style jsx>{`
        .introduction-section {
          padding: 4rem 0;
          background: white;
          position: relative;
        }

        .intro-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
          padding: 0 2rem;
        }

        .title-wrapper {
          margin-bottom: 1.5rem;
        }

        .section-badge {
          display: inline-block;
          background: #0c4da2;
          color: white;
          padding: 0.4rem 1.2rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          opacity: 0;
          transform: translateY(20px);
        }

        .section-badge.animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0c4da2;
          margin-bottom: 0;
          line-height: 1.3;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          opacity: 0;
          transform: translateY(30px);
        }

        .section-title.animate-fade-up {
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }

        .title-highlight {
          color: #2196F3;
          font-size: 0.9em;
          font-weight: 600;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #5a6c7d;
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(30px);
        }

        .section-subtitle.animate-fade-up {
          animation: fadeInUp 0.8s ease-out 0.4s forwards;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
          padding: 0 1rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #e0e6ed;
          opacity: 0;
          transform: translateY(30px);
        }

        .feature-card.animate-fade-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
          border-color: #0c4da2;
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 1.8rem;
          background: #f8f9fa;
          border: 2px solid #e0e6ed;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          background: #0c4da2;
          color: white;
          border-color: #0c4da2;
          transform: scale(1.05);
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0c4da2;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .feature-description {
          font-size: 0.95rem;
          color: #5a6c7d;
          line-height: 1.6;
          margin-bottom: 0;
        }

        .intro-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(30px);
          margin-top: 2.5rem;
        }

        .intro-actions.animate-fade-up {
          animation: fadeInUp 0.8s ease-out 0.6s forwards;
        }

        .intro-btn {
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
          border: 2px solid transparent !important;
        }

        .intro-btn-learn {
          background: linear-gradient(135deg, #0c4da2, #1976d2) !important;
          color: white !important;
          border-color: #0c4da2 !important;
        }

        .intro-btn-learn:hover {
          background: linear-gradient(135deg, #0a3d82, #1565c0) !important;
          border-color: #0a3d82 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 15px rgba(12, 77, 162, 0.3) !important;
        }

        .intro-btn-programs {
          background: linear-gradient(135deg, #2e7d32, #388e3c) !important;
          color: white !important;
          border-color: #2e7d32 !important;
        }

        .intro-btn-programs:hover {
          background: linear-gradient(135deg, #1b5e20, #2e7d32) !important;
          border-color: #1b5e20 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3) !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .introduction-section {
            padding: 5rem 0;
          }

          .section-title {
            font-size: 2.2rem;
            line-height: 1.3;
          }

          .section-badge {
            font-size: 0.8rem;
            padding: 0.4rem 1.2rem;
          }

          .feature-icon {
            width: 80px;
            height: 80px;
            font-size: 2rem;
          }

          .features-grid {
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .introduction-section {
            padding: 3rem 0;
          }

          .intro-header {
            margin-bottom: 2.5rem;
            padding: 0 1.5rem;
          }

          .section-title {
            font-size: 1.8rem;
            line-height: 1.4;
          }

          .section-subtitle {
            font-size: 1rem;
            padding: 0 1rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
            padding: 0 1.5rem;
          }

          .feature-card {
            padding: 1.5rem;
          }

          .feature-icon {
            width: 60px;
            height: 60px;
            font-size: 1.6rem;
            margin-bottom: 1.2rem;
          }

          .feature-title {
            font-size: 1.1rem;
          }

          .intro-actions {
            gap: 0.8rem;
            margin-top: 2rem;
          }

          .intro-actions .intro-btn {
            padding: 0.6rem 1.2rem !important;
            font-size: 0.9rem !important;
          }
        }

        @media (max-width: 480px) {
          .introduction-section {
            padding: 2.5rem 0;
          }

          .section-title {
            font-size: 1.6rem;
            line-height: 1.5;
          }

          .section-subtitle {
            font-size: 0.95rem;
            padding: 0 1rem;
          }

          .features-grid {
            padding: 0 1rem;
            gap: 1.2rem;
          }

          .feature-card {
            padding: 1.2rem;
          }

          .feature-icon {
            width: 55px;
            height: 55px;
            font-size: 1.4rem;
            margin-bottom: 1rem;
          }

          .feature-title {
            font-size: 1rem;
          }

          .feature-description {
            font-size: 0.85rem;
          }
          
          .intro-actions {
            flex-direction: column;
            align-items: center;
            gap: 0.7rem;
          }

          .intro-actions .intro-btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
            padding: 0.7rem 1rem !important;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default IntroductionSection;
