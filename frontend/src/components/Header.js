import React from "react";
import { Menubar } from "primereact/menubar";
import { useNavigate } from "react-router-dom";
import "primeicons/primeicons.css";

const Header = () => {
  const navigate = useNavigate();

  const logo = (
    <div
      className="p-d-flex p-ai-center"
      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem" }}
      onClick={() => navigate("/")}
    >
      <img src="/logo-ctu.png" alt="Logo" height="55" />
      <div style={{ lineHeight: "1.2" }}>
        <div style={{ fontSize: "0.85rem", color: "#000000", fontWeight: 500 }}>
          TRUNG TÂM LIÊN KẾT ĐÀO TẠO
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0c4da2" }}>
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
    { label: "Tin tức", icon: "pi pi-calendar", command: () => navigate("/news") },
    { label: "Tuyển sinh", icon: "pi pi-users", command: () => navigate("/admissions") },
    { label: "Liên hệ", icon: "pi pi-envelope", command: () => navigate("/contact") },
  ];

  return (
    <div style={{ background: "#ffffff" }} className="shadow-2">
      <Menubar model={items} start={logo} style={{ border: "none", background: "#ffffff" }} />
    </div>
  );
};

export default Header;
