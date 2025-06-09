import React from "react";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Người dùng",
      icon: "pi pi-users",
      command: () => navigate("/admin/users"),
    },
    {
      label: "Cơ sở liên kết",
      icon: "pi pi-building",
      items: [
        {
          label: "Thêm CSLK",
          icon: "pi pi-plus",
          command: () => navigate("/admin/facilities"),
        },
        {
          label: "Danh sách CSLK",
          icon: "pi pi-list",
          command: () => navigate("/admin/facilities/list"),
        },
      ],
    },
    {
      label: "Cài đặt",
      icon: "pi pi-cog",
      command: () => navigate("/admin/settings"),
    },
    {
      label: "Báo cáo",
      icon: "pi pi-chart-bar",
      command: () => navigate("/admin/reports"),
    },
  ];

  const start = (
    <img
      src="/logo.png"
      alt="Logo"
      className="admin-header__logo"
      style={{ height: "32px", cursor: "pointer" }}
      onClick={() => navigate("/")}
    />
  );

  const end = (
    <Button
      label="Đăng xuất"
      icon="pi pi-sign-out"
      className="p-button-danger p-button-sm"
      onClick={handleLogout}
    />
  );

  return (
    <div className="admin-header">
      <Menubar model={menuItems} start={start} end={end} />
    </div>
  );
};

export default AdminHeader;
