import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./TeacherHeader.css";

const TeacherHeader = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Lịch dạy",
      icon: "pi pi-calendar",
      command: () => navigate("/teacher/schedule"),
    },
    {
      label: "Danh sách lớp",
      icon: "pi pi-users",
      command: () => navigate("/teacher/classes"),
    },
  ];

  const start = (
    <div
      className="p-d-flex p-ai-center"
      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem" }}
      onClick={() => navigate("/teacher")}
    >
      <img src="/logo192.png" alt="Logo" style={{ height: "32px", cursor: "pointer" }} />
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

  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Button
        icon="pi pi-comment"
        rounded
        size="small"
        className="p-button-info"
        onClick={() => {
          // Trigger chatbot open event
          window.dispatchEvent(new CustomEvent('openChatbot'));
        }}
        tooltip="Chatbot Hỗ Trợ"
        tooltipOptions={{ position: 'bottom' }}
        aria-label="Mở chatbot hỗ trợ"
      />
      <Button
        label="Đăng xuất"
        icon="pi pi-sign-out"
        size="small"
        className="p-button-danger"
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />
    </div>
  );

  return (
    <div className="teacher-header" style={{ position: "relative", zIndex: 1000 }}>
      <Menubar model={menuItems} start={start} end={end} />
    </div>
  );
};

export default TeacherHeader;
