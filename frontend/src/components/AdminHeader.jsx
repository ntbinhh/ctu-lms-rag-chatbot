import React from "react";
import "./AdminHeader.css"; // Import CSS thủ công

const AdminHeader = () => (
  <header className="admin-header">
    {/* Logo + Dashboard Title */}
    <div className="admin-header__left">
      <a href="/">
        <img
          src="/logo.png"
          alt="Logo"
          className="admin-header__logo"
        />
      </a>
      <span className="admin-header__title">Admin Dashboard</span>
    </div>

    {/* Navigation Menu */}
    <nav className="admin-header__nav">
      <a href="/admin/users">Quản lý người dùng</a>
      <a href="/admin/settings">Cài đặt</a>
      <a href="/admin/reports">Báo cáo</a>
    </nav>

    {/* Logout Button */}
    <div>
      <button className="admin-header__logout">Đăng xuất</button>
    </div>
  </header>
);

export default AdminHeader;
