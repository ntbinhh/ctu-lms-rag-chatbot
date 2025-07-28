import React from "react";
import StudentHeader from "../components/StudentHeader";
import ChatbotWidget from "../components/ChatbotWidget";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "./DashboardStudent.css";

export default function DashboardStudent() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Xem Lịch Học",
      description: "Xem thời khóa biểu và lịch học của bạn",
      icon: "pi pi-calendar",
      action: () => navigate("/student/schedule"),
      color: "#0c4da2"
    },
    {
      title: "Chương Trình Đào Tạo", 
      description: "Xem chương trình học và môn học",
      icon: "pi pi-book",
      action: () => navigate("/student/programs"),
      color: "#28a745"
    },
    {
      title: "Chatbot Hỗ Trợ",
      description: "Hỏi đáp về lịch học và chương trình đào tạo với AI",
      icon: "pi pi-comment",
      action: () => {
        // Scroll to bottom to show chatbot
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
      color: "#6f42c1"
    }
  ];

  return (
    <div className="dashboard-student">
      <StudentHeader />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            <i className="pi pi-user" style={{ marginRight: '0.5rem' }}></i>
            Dashboard Sinh viên
          </h1>
          <p className="dashboard-subtitle">
            Chào mừng bạn đến với hệ thống quản lý học tập. Chọn chức năng bạn muốn sử dụng.
          </p>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Truy cập nhanh</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Card key={index} className="action-card">
                <div className="card-content" onClick={action.action}>
                  <div 
                    className="card-icon"
                    style={{ backgroundColor: action.color }}
                  >
                    <i className={action.icon}></i>
                  </div>
                  <div className="card-info">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <div className="card-arrow">
                    <i className="pi pi-chevron-right"></i>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="features-section">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="features-grid">
            <Card className="feature-card">
              <div className="feature-content">
                <div className="feature-icon">
                  <i className="pi pi-clock" style={{ color: '#ff6b6b' }}></i>
                </div>
                <h4>Lịch Học Thời Gian Thực</h4>
                <p>Xem lịch học hôm nay và cả tuần với thông tin chi tiết về môn học, giảng viên và phòng học.</p>
              </div>
            </Card>

            <Card className="feature-card">
              <div className="feature-content">
                <div className="feature-icon">
                  <i className="pi pi-robot" style={{ color: '#4ecdc4' }}></i>
                </div>
                <h4>Chatbot AI Hỗ Trợ</h4>
                <p>Hỏi đáp tự nhiên về lịch học, chương trình đào tạo với chatbot thông minh, có thể trả lời các câu hỏi về học tập.</p>
              </div>
            </Card>

            <Card className="feature-card">
              <div className="feature-content">
                <div className="feature-icon">
                  <i className="pi pi-graduation-cap" style={{ color: '#45b7d1' }}></i>
                </div>
                <h4>Chương Trình Học</h4>
                <p>Theo dõi tiến độ học tập và xem chi tiết chương trình đào tạo của ngành học.</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="info-section">
          <Card className="info-card">
            <div className="info-content">
              <div className="info-icon">
                <i className="pi pi-info-circle"></i>
              </div>
              <div className="info-text">
                <h4>Hướng dẫn sử dụng</h4>
                <p>
                  • Sử dụng menu trên cùng để điều hướng giữa các chức năng<br/>
                  • Chatbot ở góc dưới phải có thể trả lời câu hỏi về lịch học<br/>
                  • Tất cả dữ liệu được cập nhật tự động từ hệ thống
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Chatbot Widget - Floating */}
      <ChatbotWidget />
    </div>
  );
}
