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
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    {
  label: "Trang chủ",
  icon: "pi pi-home",
  items: [
    {
      label: "Ảnh slider",
      icon: "pi pi-images",
      command: () => navigate("/admin/homepage/slider"),
    },
    {
      label: "Video",
      icon: "pi pi-video",
      command: () => navigate("/admin/homepage/videos"),
    },
    {
      label: "Bài viết / nội dung",
      icon: "pi pi-file",
      command: () => navigate("/admin/homepage/articles"),
    },
  ],
},
    {
      label: "Người dùng",
      icon: "pi pi-users",
      items: [
        {
          label: "Quản lý",
          icon: "pi pi-briefcase",
          items: [
            {
              label: "Thêm quản lý",
              icon: "pi pi-user-plus",
              command: () => navigate("/admin/users/managers/add"),
            },
            {
              label: "Danh sách quản lý",
              icon: "pi pi-users",
              command: () => navigate("/admin/users/managers"),
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
      ],
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
      label: "Đào tạo",
      icon: "pi pi-book",
      items: [
        {
          label: "Khoa",
          icon: "pi pi-sitemap",
          items: [
            {
              label: "Thêm khoa",
              icon: "pi pi-plus",
              command: () => navigate("/admin/faculties/add"),
            },
            {
              label: "Danh sách khoa",
              icon: "pi pi-list",
              command: () => navigate("/admin/faculties/list"),
            },
          ],
        },
        {
          label: "Ngành đào tạo",
          icon: "pi pi-briefcase",
          items: [
            {
              label: "Thêm ngành",
              icon: "pi pi-plus",
              command: () => navigate("/admin/majors/add"),
            },
            {
              label: "Danh sách ngành",
              icon: "pi pi-list",
              command: () => navigate("/admin/majors/list"),
            },
          ],
        },
        {
          label: "Học phần",
          icon: "pi pi-file",
          items: [
            {
              label: "Thêm học phần",
              icon: "pi pi-plus",
              command: () => navigate("/admin/courses/add"),
            },
            {
              label: "Danh sách học phần",
              icon: "pi pi-list",
              command: () => navigate("/admin/courses/list"),
            },
          ],
        },
        {
      label: "Chương trình đào tạo",
      icon: "pi pi-bookmark",
      items: [
        {
          label: "Thêm chương trình",
          icon: "pi pi-plus",
          command: () => navigate("/admin/programs/add"),
        },
        {
          label: "Danh sách chương trình",
          icon: "pi pi-list",
          command: () => navigate("/admin/programs/list"),
        },
      ],
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
    </div>
  );
};

export default AdminHeader;
