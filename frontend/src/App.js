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

// Import các trang cần thiết
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
      </Routes>
    </Router>
  );
}

export default App;