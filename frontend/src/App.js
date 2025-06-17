import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // Trang chủ
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardTeacher from "./pages/DashboardTeacher";
import DashboardStudent from "./pages/DashboardStudent";
import './index.css';
import FacilitiesPage from "./components/FacilitiesPage";
import FacilitiesListPage from "./components/FacilitiesListPage"; // Trang danh sách cơ sở đào tạo
import AddManagerForm from "./components/manager/AddManagerForm";
import ManagerList from "./components/manager/ManagerList";
import AddFacultyForm from "./components/faculty/AddFacultyForm";
import FacultyList from "./components/faculty/FacultyListPage";
import AddMajorForm from "./components/training/AddMajorForm";
import MajorListPage from "./components/training/MajorListPage";
import AddCourseForm from "./components/hocphan/AddCourseForm";
import CourseListPage from "./components/hocphan/CourseListPage"; // Trang danh sách học phần
import AddProgramForm from "./components/program/AddProgramForm"; // Trang thêm chương trình đào tạo
import ProgramListPage from "./components/program/ProgramListPage"; // Trang danh sách chương trình đào tạo
import Layout from "./Layout"; // Layout chung cho ứng dụng
// Import các trang cần thiết
import SliderImageUpload from "./components/homepage/SliderImageUpload";
import AddNewsForm from "./components/homepage/AddNewsForm"; // Trang thêm bài viết
import NewsListPage from "./components/homepage/NewsListPage"; // Trang danh sách bài viết
import NewsDetailPage from "./pages/NewsDetailPage";
import HomeNewsListPage from "./pages/HomeNewsListPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />           {/* Trang chủ */}
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/teacher" element={<DashboardTeacher />} />
        <Route path="/student" element={<DashboardStudent />} />
        <Route path="/admin/facilities" element={<FacilitiesPage />} />
        <Route path="/admin/facilities/list" element={<FacilitiesListPage />} />
        <Route path="/admin/users/managers/add" element={<AddManagerForm />} />
        <Route path="/admin/users/managers" element={<ManagerList />} />
        <Route path="/admin/faculties/add" element={<AddFacultyForm />} />
        <Route path="/admin/faculties/list" element={<FacultyList />} />
        <Route path="/admin/majors/add" element={<AddMajorForm />} />
        <Route path="/admin/majors/list" element={<MajorListPage />} />
        <Route path="/admin/courses/add" element={<AddCourseForm />} />
        <Route path="/admin/courses/list" element={<CourseListPage />} /> {/* Trang danh sách học phần */}
        <Route path="/admin/programs/add" element={<AddProgramForm />} /> {/* Trang thêm chương trình đào tạo */}
        <Route path="/admin/programs/list" element={<ProgramListPage />} /> {/* Trang danh sách chương trình đào tạo */}
        <Route path="/admin/homepage/slider" element={<SliderImageUpload />} /> {/* Trang quản lý slider */}
        <Route path="/admin/homepage/news/add" element={<AddNewsForm />} /> {/* Trang thêm bài viết */}
        <Route path="/admin/homepage/news/list" element={<NewsListPage />} /> {/* Trang danh sách bài viết */}
        {/* Các route khác có thể thêm vào đây */}
        <Route path="/news" element={<HomeNewsListPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} /> {/* Trang chi tiết bài viết */}
        {/* Sử dụng Layout cho các trang khác nếu cần */}
      </Routes>
    </Router>
  );
}

export default App;