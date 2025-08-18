import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "primeicons/primeicons.css";

const Header = () => {
  const navigate = useNavigate();

  const logo = (
    <div
      className="ctu-header-logo"
      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem" }}
      onClick={() => navigate("/")}
    >
      <img src="/logo192.png" alt="Logo" height="50" />
      <div style={{ lineHeight: "1.2" }}>
        <div className="ctu-header-logo-text-small">
          TRUNG TÂM LIÊN KẾT ĐÀO TẠO
        </div>
        <div className="ctu-header-logo-text-main">
          TRƯỜNG ĐẠI HỌC CẦN THƠ
        </div>
      </div>
    </div>
  );

  const items = [
    { label: "Trang chủ", icon: "pi pi-home", command: () => navigate("/") },
    {
      label: "Giới thiệu",
      items: [
        { label: "Tổng quan", command: () => navigate("/about") },
        { label: "Sứ mạng - Tầm nhìn", command: () => navigate("/mission") },
      ],
    },
    { label: "Tin tức", icon: "pi pi-calendar", command: () => navigate("/news_home") },
    { label: "Tuyển sinh", icon: "pi pi-users", command: () => navigate("/admissions") },
    { label: "Liên hệ", icon: "pi pi-envelope", command: () => navigate("/contact") },
    { label: "Chương trình đào tạo", icon: "pi pi-book", command: () => navigate("/programs") },
  ];

  const loginButton = (
    <div className="ctu-header-login-section">
      <Button 
        label="Đăng nhập" 
        icon="pi pi-sign-in" 
        className="ctu-header-login-btn"
        onClick={() => navigate("/login")}
      />
    </div>
  );

  return (
    <>
      <div style={{ background: "#ffffff" }} className="shadow-2">
        <Menubar 
          model={items} 
          start={logo} 
          end={loginButton}
          style={{ border: "none", background: "#ffffff" }} 
        />
      </div>
      
      <style jsx>{`
        .header-login-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-login-btn {
          background: linear-gradient(135deg, #0c4da2, #1976d2) !important;
          border: none !important;
          color: white !important;
          padding: 0.5rem 1.25rem !important;
          border-radius: 25px !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 2px 8px rgba(12, 77, 162, 0.2) !important;
        }

        .header-login-btn:hover {
          background: linear-gradient(135deg, #0a3d82, #1565c0) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(12, 77, 162, 0.3) !important;
        }

        .header-login-btn:active {
          transform: translateY(0) !important;
        }

        @media (max-width: 768px) {
          .header-login-btn {
            padding: 0.4rem 1rem !important;
            font-size: 0.85rem !important;
          }
        }

        @media (max-width: 480px) {
          .header-login-section {
            gap: 0.5rem;
          }
          
          .header-login-btn {
            padding: 0.35rem 0.8rem !important;
            font-size: 0.8rem !important;
            min-width: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
