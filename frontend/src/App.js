import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardTeacher from "./pages/DashboardTeacher";
import DashboardStudent from "./pages/DashboardStudent";
import FacilitiesPage from "./components/FacilitiesPage";
import FacilitiesListPage from "./components/FacilitiesListPage";
import AddManagerForm from "./components/manager/AddManagerForm";
import ManagerList from "./components/manager/ManagerList";
import AddFacultyForm from "./components/faculty/AddFacultyForm";
import FacultyList from "./components/faculty/FacultyListPage";
import AddMajorForm from "./components/training/AddMajorForm";
import MajorListPage from "./components/training/MajorListPage";
import AddCourseForm from "./components/hocphan/AddCourseForm";
import CourseListPage from "./components/hocphan/CourseListPage";
import AddProgramForm from "./components/program/AddProgramForm";
import ProgramListPage from "./components/program/ProgramListPage";
import SliderImageUpload from "./components/homepage/SliderImageUpload";
import AddNewsForm from "./components/homepage/AddNewsForm";
import NewsListPage from "./components/homepage/NewsListPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import HomeNewsListPage from "./pages/HomeNewsListPage";
import PublicProgramView from "./pages/PublicProgramView";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import DashboardManager from "./pages/DashboardManager";
import AddRoomForm from "./components/manager/AddRoomForm";
import RoomListPage from "./components/manager/RoomListPage";
import AddTeacherForm from "./components/AddTeacherForm";
import TeacherListPage from "./components/TeacherListPage";
import AddClassForm from "./components/AddClassForm";
import ClassListPage from "./components/ClassListPage";
import AddSchedulePage from "./components/AddSchedulePage";
import ScheduleViewPage from "./components/ScheduleViewPage";
import AddStudentForm from "./components/AddStudentForm";
import StudentList from "./components/StudentList";
import StudentProgramView from "./pages/StudentProgramView";
import StudentScheduleView from "./pages/StudentScheduleView";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/news_home" element={<HomeNewsListPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/programs" element={<PublicProgramView />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FacilitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facilities/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FacilitiesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/managers/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddManagerForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/managers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManagerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculties/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddFacultyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculties/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FacultyList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/majors/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddMajorForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/majors/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MajorListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddCourseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CourseListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddProgramForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProgramListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/homepage/slider"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SliderImageUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/homepage/news/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddNewsForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/homepage/news/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewsListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <DashboardTeacher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/programs"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentProgramView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentScheduleView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <DashboardManager />
            </ProtectedRoute>
          }
        />
        {/* Nếu có thêm route cho manager thì thêm tương tự như trên */}
        <Route
          path="/manager/rooms/add"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <AddRoomForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/rooms/list"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <RoomListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/teachers/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddTeacherForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/teachers/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeacherListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddClassForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/list"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ClassListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AddSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules/view"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "manager"]}>
              <ScheduleViewPage />
            </ProtectedRoute>
          }
        />
                
        <Route
          path="/admin/students/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddStudentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StudentList />
            </ProtectedRoute>
          }
        />
      </Routes>
          
      
        
      
    </Router>
  );
}

export default App;
