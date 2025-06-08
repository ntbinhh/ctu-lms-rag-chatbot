import React from "react";
import "./AdminHeader.css";

const AdminHeader = () => {
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <a href="/">
          <img src="/logo.png" alt="Logo" className="admin-header__logo" />
        </a>
        <span className="admin-header__title">Admin Dashboard</span>
      </div>

      <nav className="admin-header__nav">
        <a href="/admin/users">Quản lý người dùng</a>
        <a href="/admin/settings">Cài đặt</a>
        <a href="/admin/reports">Báo cáo</a>

        <div className="dropdown">
          <button className="dropdown-toggle">Cơ sở liên kết ▾</button>
          <div className="dropdown-menu">
            <a href="/admin/facilities">➕ Thêm CSLK</a>
            <a href="/admin/facilities/list">📋 Danh sách CSLK</a>
          </div>
        </div>
      </nav>

      <div>
        <button className="admin-header__logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
