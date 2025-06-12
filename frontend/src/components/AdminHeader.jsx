import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { TieredMenu } from "primereact/tieredmenu";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Tiered menu for Người dùng
  const tieredUserMenu = [
    {
      label: "Quản lý",
      icon: "pi pi-briefcase",
      items: [
        {
          label: "Thêm quản lý",
          icon: "pi pi-user-plus",
          command: () => navigate("/admin/users/admins/add"),
        },
        {
          label: "Danh sách quản lý",
          icon: "pi pi-users",
          command: () => navigate("/admin/users/admins"),
        },
      ],
    },
    {
      label: "Giáo viên",
      icon: "pi pi-user-edit",
      items: [
        {
          label: "Thêm giáo viên",
          icon: "pi pi-user-plus",
          command: () => navigate("/admin/users/teachers/add"),
        },
        {
          label: "Danh sách giáo viên",
          icon: "pi pi-users",
          command: () => navigate("/admin/users/teachers"),
        },
      ],
    },
    {
      label: "Học viên",
      icon: "pi pi-user",
      items: [
        {
          label: "Thêm học viên",
          icon: "pi pi-user-plus",
          command: () => navigate("/admin/users/students/add"),
        },
        {
          label: "Danh sách học viên",
          icon: "pi pi-users",
          command: () => navigate("/admin/users/students"),
        },
      ],
    },
  ];

  const menuItems = [
    {
      label: "Người dùng",
      icon: "pi pi-users",
      command: (e) => userMenuRef.current.toggle(e.originalEvent),
    },
    {
      label: "Cơ sở liên kết",
      icon: "pi pi-building",
      items: [
        {
          label: "Thêm CSLK",
          icon: "pi pi-plus-circle",
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
      style={{ height: "32px", cursor: "pointer" }}
      onClick={() => navigate("/admin")}
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
    <div className="admin-header" style={{ position: "relative", zIndex: 1000 }}>
      <Menubar model={menuItems} start={start} end={end} />
      <TieredMenu model={tieredUserMenu} popup ref={userMenuRef} breakpoint="767px" />
    </div>
  );
};

export default AdminHeader;
