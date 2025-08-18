import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import TeacherHeader from "../components/TeacherHeader.jsx";
import ChatbotWidget from "../components/ChatbotWidget";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function DashboardTeacher() {
  const navigate = useNavigate();

  const menuCards = [
    {
      title: "Lịch giảng dạy",
      icon: "pi pi-calendar",
      description: "Xem lịch giảng dạy của tôi theo tuần, theo lớp",
      path: "/teacher/schedule",
      color: "#0c4da2"
    },
    {
      title: "Danh sách lớp",
      icon: "pi pi-users",
      description: "Xem danh sách sinh viên các lớp đang giảng dạy và xuất file",
      path: "/teacher/classes",
      color: "#28a745"
    }
  ];

  const cardStyle = {
    marginBottom: "1.5rem",
    border: "none",
    borderRadius: "15px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer"
  };

  const cardHoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <TeacherHeader />
      
      <main style={{ paddingTop: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h1 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "700", 
              color: "#0c4da2", 
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}>
              <i className="pi pi-graduation-cap"></i>
              Dashboard Giảng viên
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#666", margin: 0 }}>
              Chào mừng bạn đến với hệ thống quản lý giảng dạy
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
            gap: "2rem" 
          }}>
            {menuCards.map((card, index) => (
              <Card
                key={index}
                style={cardStyle}
                className="dashboard-card"
                onClick={() => navigate(card.path)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, cardHoverStyle);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, cardStyle);
                }}
              >
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  textAlign: "center",
                  padding: "2rem"
                }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    boxShadow: `0 4px 15px ${card.color}40`
                  }}>
                    <i className={card.icon} style={{ fontSize: "2rem", color: "white" }}></i>
                  </div>
                  
                  <h3 style={{ 
                    margin: "0 0 1rem 0", 
                    color: "#333", 
                    fontSize: "1.3rem",
                    fontWeight: "600"
                  }}>
                    {card.title}
                  </h3>
                  
                  <p style={{ 
                    margin: "0 0 1.5rem 0", 
                    color: "#666", 
                    fontSize: "0.95rem",
                    lineHeight: "1.5"
                  }}>
                    {card.description}
                  </p>
                  
                  <Button
                    label="Truy cập"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    style={{
                      background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)`,
                      border: "none",
                      borderRadius: "25px",
                      padding: "0.75rem 2rem",
                      fontWeight: "600"
                    }}
                    className="p-button-sm"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
