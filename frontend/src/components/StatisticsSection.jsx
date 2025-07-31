import React, { useState, useEffect } from "react";

const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    students: 0,
    postgraduate: 0,
    professors: 0,
    research: 0,
    papers: 0,
    international: 0
  });

  const finalCounts = {
    students: 44176,
    postgraduate: 3054,
    professors: 206,
    research: 642,
    papers: 2140,
    international: 73
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.querySelector('.statistics-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const steps = 60; // 60 steps for smooth animation
      const stepTime = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCounts({
          students: Math.floor(finalCounts.students * progress),
          postgraduate: Math.floor(finalCounts.postgraduate * progress),
          professors: Math.floor(finalCounts.professors * progress),
          research: Math.floor(finalCounts.research * progress),
          papers: Math.floor(finalCounts.papers * progress),
          international: Math.floor(finalCounts.international * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setCounts(finalCounts);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const statistics = [
    {
      icon: "fas fa-user-graduate",
      count: counts.students,
      suffix: "",
      label: "Sinh viên",
      color: "#2196F3"
    },
    {
      icon: "fas fa-graduation-cap",
      count: counts.postgraduate,
      suffix: "",
      label: "Học viên sau đại học",
      color: "#4CAF50"
    },
    {
      icon: "fas fa-chalkboard-teacher",
      count: counts.professors,
      suffix: "",
      label: "Giáo sư, Phó Giáo sư",
      color: "#FF9800"
    },
    {
      icon: "fas fa-microscope",
      count: counts.research,
      suffix: "",
      label: "Đề tài NCKH",
      color: "#9C27B0"
    },
    {
      icon: "fas fa-newspaper",
      count: counts.papers,
      suffix: "",
      label: "Bài báo",
      color: "#E91E63"
    },
    {
      icon: "fas fa-globe-americas",
      count: counts.international,
      suffix: "",
      label: "Dự án quốc tế",
      color: "#00BCD4"
    }
  ];

  return (
    <div className="statistics-section">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"></link>
      <div className="stats-background">
        <div className="stats-overlay">
          <div className="stats-content">
            <h2 className="stats-title">
              Những con số nổi bật
            </h2>
            <p className="stats-subtitle">
              Số liệu thống kê đến tháng 12/2024
            </p>
            
            <div className="stats-grid">
              {statistics.map((stat, index) => (
                <div 
                  key={index} 
                  className="stat-card"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div 
                    className="stat-icon"
                  >
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-number">
                    {stat.count.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .statistics-section {
          position: relative;
          margin: 4rem 0;
          overflow: hidden;
        }

        .stats-background {
          background: linear-gradient(135deg, #0c4da2 0%, #1e88e5 50%, #2196f3 100%);
          position: relative;
          border-radius: 20px;
          overflow: hidden;
        }

        .stats-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse"><polygon points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23hexagons)"/></svg>');
          pointer-events: none;
        }

        .stats-overlay {
          background: rgba(12, 77, 162, 0.9);
          padding: 4rem 2rem;
          position: relative;
          z-index: 1;
        }

        .stats-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .stats-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          opacity: 0;
          transform: translateY(30px);
          animation: ${isVisible ? 'fadeInUp 0.8s ease-out forwards' : 'none'};
        }

        .stats-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
          opacity: 0;
          transform: translateY(30px);
          animation: ${isVisible ? 'fadeInUp 0.8s ease-out 0.2s forwards' : 'none'};
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .stat-card {
          text-align: center;
          padding: 2rem 1rem;
          opacity: 0;
          transform: translateY(30px);
          animation: ${isVisible ? 'fadeInUp 0.8s ease-out forwards' : 'none'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .stat-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white !important;
          text-align: center;
        }

        .stat-icon i {
          color: white !important;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .stat-label {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          line-height: 1.3;
        }

        @media (max-width: 768px) {
          .stats-overlay {
            padding: 3rem 1rem;
          }
          
          .stats-title {
            font-size: 2rem;
          }
          
          .stats-subtitle {
            font-size: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          
          .stat-number {
            font-size: 2.2rem;
          }
          
          .stat-icon {
            font-size: 3rem;
          }
          
          .stat-label {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .stat-card {
            padding: 1.5rem;
          }
          
          .stat-number {
            font-size: 2.5rem;
          }
          
          .stat-icon {
            font-size: 2.5rem;
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

export default StatisticsSection;
