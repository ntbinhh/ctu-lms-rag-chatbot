import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Main Info Section */}
          <div className="footer-section main-info">
            <div className="footer-logo">
              <img src="/logo192.png" alt="CTU Logo" />
              <div className="footer-title">
                <h3>TRUNG TÂM LIÊN KẾT ĐÀO TẠO</h3>
                <p>TRƯỜNG ĐẠI HỌC CẦN THƠ</p>
              </div>
            </div>
            <p className="footer-description">
              Đào tạo chất lượng cao, kết nối tri thức với thực tiễn, 
              xây dựng tương lai vững chắc cho thế hệ trẻ khu vực Đồng bằng sông Cửu Long.
            </p>
          </div>

          {/* Contact Info */}
          <div className="footer-section contact-info">
            <h4>Thông tin liên hệ</h4>
            <div className="contact-item">
              <i className="pi pi-map-marker"></i>
              <div>
                <strong>Địa chỉ:</strong><br />
                Tầng trệt - Nhà Điều hành Trường Đại học Cần Thơ<br />
                Khu II, đường 3/2, phường Xuân Khánh, quận Ninh Kiều, TP. Cần Thơ
              </div>
            </div>
            <div className="contact-item">
              <i className="pi pi-phone"></i>
              <div>
                <strong>Điện thoại:</strong><br />
                (0292) 3734370 - 3831634
              </div>
            </div>
            <div className="contact-item">
              <i className="pi pi-envelope"></i>
              <div>
                <strong>Email:</strong><br />
                <a href="mailto:ttlkdt@ctu.edu.vn">ttlkdt@ctu.edu.vn</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section quick-links">
            <h4>Liên kết nhanh</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/about">Giới thiệu</a></li>
              <li><a href="/programs">Chương trình đào tạo</a></li>
              <li><a href="/news_home">Tin tức</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="footer-section social-media">
            <h4>Theo dõi chúng tôi</h4>
            <div className="social-links">
              <button type="button" aria-label="Facebook" className="social-link" onClick={() => window.open('https://facebook.com/ctu.edu.vn', '_blank')}>
                <i className="pi pi-facebook"></i>
              </button>
              <button type="button" aria-label="YouTube" className="social-link" onClick={() => window.open('https://youtube.com/@ctuuniversity', '_blank')}>
                <i className="pi pi-youtube"></i>
              </button>
              <button type="button" aria-label="LinkedIn" className="social-link" onClick={() => window.open('https://linkedin.com/company/can-tho-university', '_blank')}>
                <i className="pi pi-linkedin"></i>
              </button>
              <button type="button" aria-label="Twitter" className="social-link" onClick={() => window.open('https://twitter.com/ctu_edu_vn', '_blank')}>
                <i className="pi pi-twitter"></i>
              </button>
            </div>
            <div className="back-to-top">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Về đầu trang"
              >
                <i className="pi pi-arrow-up"></i>
                Về đầu trang
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="copyright">
            <p>
              © {currentYear} Trung tâm Liên kết Đào tạo - Trường Đại học Cần Thơ. 
              Tất cả quyền được bảo lưu.
            </p>
            <div className="footer-meta">
              <a href="/privacy-policy">Chính sách bảo mật</a>
              <span>|</span>
              <a href="/terms-of-service">Điều khoản sử dụng</a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-footer {
          background: linear-gradient(135deg, #0c4da2 0%, #1e88e5 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .modern-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(255,255,255,0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 1rem;
          position: relative;
          z-index: 1;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        .footer-section {
          position: relative;
          z-index: 2;
        }

        .footer-section.contact-info {
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-section h4 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #ffffff;
          position: relative;
        }

        .footer-section h4::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 30px;
          height: 3px;
          background: #ffffff;
          border-radius: 2px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .footer-logo img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
        }

        .footer-title h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          line-height: 1.2;
        }

        .footer-title p {
          font-size: 0.9rem;
          margin: 0;
          opacity: 0.9;
        }

        .footer-description {
          font-size: 0.95rem;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0;
        }

        .contact-item {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          align-items: flex-start;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .contact-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .contact-item i {
          font-size: 1.1rem;
          margin-top: 0.2rem;
          color: #f97316;
          min-width: 16px;
          flex-shrink: 0;
        }

        .contact-item a {
          color: #ffffff;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .contact-item a:hover {
          color: #e3f2fd;
        }

        .quick-links ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .quick-links li {
          margin-bottom: 0.75rem;
        }

        .quick-links a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .quick-links a:hover {
          color: #ffffff;
          padding-left: 0.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .social-link {
          width: 45px;
          height: 45px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .back-to-top button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .back-to-top button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          margin: 2rem 0 1.5rem;
        }

        .footer-bottom {
          text-align: center;
        }

        .copyright {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .footer-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .footer-meta a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-meta a:hover {
          color: #ffffff;
        }

        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1rem 1rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-section.contact-info {
            padding: 1rem;
          }

          .contact-item {
            padding: 0.5rem;
          }

          .footer-logo {
            justify-content: center;
            text-align: center;
          }

          .footer-section {
            text-align: center;
          }

          .contact-item {
            justify-content: center;
            text-align: left;
          }

          .social-links {
            justify-content: center;
          }

          .copyright {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
