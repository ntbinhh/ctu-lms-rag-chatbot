import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";
import { Panel } from "primereact/panel";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import "./DashboardAdmin.css";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalClasses: 0,
    totalFacilities: 0,
    totalManagers: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState({ label: '7 ngày qua', value: '7d' });
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'online', 'offline', 'checking'
  
  const navigate = useNavigate();
  const toast = useRef(null);

  const timeRanges = [
    { label: '7 ngày qua', value: '7d' },
    { label: '30 ngày qua', value: '30d' },
    { label: '3 tháng qua', value: '3m' },
    { label: '6 tháng qua', value: '6m' },
    { label: '1 năm qua', value: '1y' }
  ];

  const quickActions = [
    {
      label: "Quản lý học viên",
      icon: "pi pi-users",
      color: "primary",
      path: "/admin/students",
      description: "Thêm, sửa, xóa thông tin học viên"
    },
    {
      label: "Thêm học viên",
      icon: "pi pi-user-plus",
      color: "success",
      path: "/admin/add-student",
      description: "Thêm học viên mới vào hệ thống"
    },
    {
      label: "Quản lý giảng viên",
      icon: "pi pi-id-card",
      color: "info",
      path: "/admin/teachers",
      description: "Quản lý thông tin giảng viên"
    },
    {
      label: "Quản lý khóa học",
      icon: "pi pi-book",
      color: "warning",
      path: "/admin/courses",
      description: "Quản lý các khóa học và chương trình"
    },
    {
      label: "Lịch học",
      icon: "pi pi-calendar",
      color: "secondary",
      path: "/admin/schedule",
      description: "Xem và quản lý lịch học"
    },
    {
      label: "Báo cáo",
      icon: "pi pi-chart-line",
      color: "help",
      path: "/admin/reports",
      description: "Xem báo cáo thống kê hệ thống"
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const debugApiResponse = (data, apiName) => {
    console.log(`=== ${apiName} API Response ===`);
    console.log("Data type:", typeof data);
    console.log("Is array:", Array.isArray(data));
    console.log("Length:", data?.length);
    if (data && data.length > 0) {
      console.log("First item:", data[0]);
      console.log("Fields:", Object.keys(data[0]));
    }
    console.log("Raw data:", data);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Check if we have a token first
      if (!token) {
        console.warn("No authentication token found");
        loadFallbackData();
        return;
      }

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Try to fetch real data with timeout
      const timeout = 10000; // 10 seconds timeout
      const axiosConfig = { headers, timeout };
      
      const [
        classesResponse,
        teachersResponse,
        coursesResponse,
        facilitiesResponse,
        managersResponse
      ] = await Promise.all([
        axios.get("http://localhost:8000/admin/classes", axiosConfig)
          .then(res => {
            console.log("✅ Classes API success:", res.data?.length || 0);
            return res;
          })
          .catch(e => {
            console.error("❌ Classes API error:", e.response?.status, e.response?.data || e.message);
            return { data: [] };
          }),
        axios.get("http://localhost:8000/admin/users/teachers", axiosConfig)
          .then(res => {
            console.log("✅ Teachers API success:", res.data?.length || 0);
            return res;
          })
          .catch(e => {
            console.error("❌ Teachers API error:", e.response?.status, e.response?.data || e.message);
            return { data: [] };
          }),
        axios.get("http://localhost:8000/admin/courses", axiosConfig)
          .then(res => {
            console.log("✅ Courses API success:", res.data?.length || 0);
            return res;
          })
          .catch(e => {
            console.error("❌ Courses API error:", e.response?.status, e.response?.data || e.message);
            return { data: [] };
          }),
        axios.get("http://localhost:8000/admin/facilities", axiosConfig)
          .then(res => {
            console.log("✅ Facilities API success:", res.data?.length || 0);
            return res;
          })
          .catch(e => {
            console.error("❌ Facilities API error:", e.response?.status, e.response?.data || e.message);
            return { data: [] };
          }),
        axios.get("http://localhost:8000/admin/users/managers", axiosConfig)
          .then(res => {
            console.log("✅ Managers API success:", res.data?.length || 0);
            return res;
          })
          .catch(e => {
            console.error("❌ Managers API error:", e.response?.status, e.response?.data || e.message);
            return { data: [] };
          })
      ]);

      // Get students data by aggregating from all classes
      let allStudents = [];
      if (classesResponse.data && classesResponse.data.length > 0) {
        console.log(`📚 Found ${classesResponse.data.length} classes, fetching students...`);
        
        const studentPromises = classesResponse.data.map(cls => 
          axios.get(`http://localhost:8000/admin/classes/${cls.id}/students`, axiosConfig)
            .then(response => {
              const students = response.data.students || [];
              console.log(`👥 Class ${cls.ma_lop || cls.id}: ${students.length} students`);
              return students;
            })
            .catch(e => {
              console.error(`❌ Students for class ${cls.id} error:`, e.response?.status, e.response?.data || e.message);
              return [];
            })
        );
        
        const studentsArrays = await Promise.all(studentPromises);
        allStudents = studentsArrays.flat();
        console.log(`👥 Total students aggregated: ${allStudents.length}`);
      } else {
        console.warn("📚 No classes found, cannot fetch students");
      }

      // Check if we got any real data
      const hasRealData = allStudents.length > 0 || 
                         teachersResponse.data.length > 0 || 
                         coursesResponse.data.length > 0;

      // Debug: log the actual data structure
      console.log("API Responses:", {
        students: allStudents.length || 0,
        teachers: teachersResponse.data?.length || 0, 
        courses: coursesResponse.data?.length || 0,
        classes: classesResponse.data?.length || 0,
        facilities: facilitiesResponse.data?.length || 0,
        managers: managersResponse.data?.length || 0
      });

      // Debug each API response in detail
      debugApiResponse(allStudents, "Students");
      debugApiResponse(teachersResponse.data, "Teachers");
      debugApiResponse(coursesResponse.data, "Courses");
      debugApiResponse(classesResponse.data, "Classes");

      if (hasRealData) {
        // Use real data
        setConnectionStatus('online');
        
        // Get the actual counts
        const studentCount = allStudents.length || 0;
        const teacherCount = Array.isArray(teachersResponse.data) ? teachersResponse.data.length : 0;
        const courseCount = Array.isArray(coursesResponse.data) ? coursesResponse.data.length : 0;
        const classCount = Array.isArray(classesResponse.data) ? classesResponse.data.length : 0;
        const facilityCount = Array.isArray(facilitiesResponse.data) ? facilitiesResponse.data.length : 0;
        const managerCount = Array.isArray(managersResponse.data) ? managersResponse.data.length : 0;
        
        setStats({
          totalStudents: studentCount,
          totalTeachers: teacherCount,
          totalCourses: courseCount,
          totalClasses: classCount,
          totalFacilities: facilityCount,
          totalManagers: managerCount
        });

        const recentStudentsData = allStudents.slice(0, 5);
        
        // Process student data to ensure consistent field names
        const processedStudents = recentStudentsData.map(student => ({
          student_code: student.student_code || student.student_id || student.id || "N/A",
          full_name: student.full_name || student.name || student.fullName || "Chưa có tên",
          email: student.email || "Chưa có email",
          status: student.status || student.active || student.is_active || "Đang học"
        }));
        
        setRecentStudents(processedStudents);

        console.log("Processed students:", processedStudents);

        // Generate activities based on real data
        const activities = [];
        
        if (processedStudents.length > 0) {
          processedStudents.forEach((student, index) => {
            activities.push({
              id: `student_${index}`,
              action: `Thêm học viên mới: ${student.full_name}`,
              user: "Admin",
              time: `${(index + 1) * 5} phút trước`,
              type: "success"
            });
          });
        }

        activities.push(
          {
            id: "system_1",
            action: `Hệ thống có ${teacherCount} giảng viên`,
            user: "System",
            time: "30 phút trước",
            type: "info"
          },
          {
            id: "system_2", 
            action: `Tổng cộng ${classCount} lớp học`,
            user: "System",
            time: "1 giờ trước",
            type: "warning"
          },
          {
            id: "system_3",
            action: `Quản lý ${facilityCount} cơ sở đào tạo`,
            user: "Admin",
            time: "2 giờ trước",
            type: "secondary"
          }
        );

        setRecentActivities(activities.slice(0, 10));

        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: `Tải thành công: ${studentCount} học viên, ${teacherCount} giảng viên, ${classCount} lớp học`,
          life: 3000
        });

      } else {
        // No real data available, use fallback
        console.warn("No real data available, using fallback data");
        setConnectionStatus('offline');
        loadFallbackData();
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setConnectionStatus('offline');
      loadFallbackData();
      
      toast.current?.show({
        severity: "warn",
        summary: "Thông báo",
        detail: "Đang sử dụng dữ liệu mẫu do không thể kết nối server.",
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackData = () => {
    // Fallback demo data when API is not available
    setConnectionStatus('offline');
    setStats({
      totalStudents: 1250,
      totalTeachers: 95,
      totalCourses: 45,
      totalClasses: 78,
      totalFacilities: 5,
      totalManagers: 12
    });

    setRecentStudents([
      {
        student_code: "SV001",
        full_name: "Nguyễn Văn An",
        email: "nvan@ctu.edu.vn",
        status: "Đang học"
      },
      {
        student_code: "SV002", 
        full_name: "Trần Thị Bình",
        email: "ttbinh@ctu.edu.vn",
        status: "Đang học"
      },
      {
        student_code: "SV003",
        full_name: "Lê Văn Cường",
        email: "lvcuong@ctu.edu.vn", 
        status: "Tạm dừng"
      },
      {
        student_code: "SV004",
        full_name: "Phạm Thị Dung",
        email: "ptdung@ctu.edu.vn",
        status: "Đang học"
      },
      {
        student_code: "SV005",
        full_name: "Hoàng Văn Em",
        email: "hvem@ctu.edu.vn",
        status: "Đang học"
      }
    ]);

    setRecentActivities([
      {
        id: "demo_1",
        action: "Thêm học viên mới: Nguyễn Văn An",
        user: "Admin",
        time: "5 phút trước",
        type: "success"
      },
      {
        id: "demo_2",
        action: "Cập nhật thông tin giảng viên",
        user: "Manager",
        time: "15 phút trước", 
        type: "info"
      },
      {
        id: "demo_3",
        action: "Tạo lớp học mới: Lập trình Web",
        user: "Admin",
        time: "30 phút trước",
        type: "success"
      },
      {
        id: "demo_4",
        action: "Cập nhật khóa học: Khoa học máy tính",
        user: "Manager",
        time: "1 giờ trước",
        type: "warning"
      },
      {
        id: "demo_5",
        action: "Thêm cơ sở đào tạo mới",
        user: "Admin",
        time: "2 giờ trước",
        type: "secondary"
      }
    ]);
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const activityTypeTemplate = (rowData) => {
    const severityMap = {
      success: "success",
      info: "info", 
      warning: "warning",
      secondary: "secondary"
    };
    return <Badge value={rowData.type} severity={severityMap[rowData.type]} />;
  };

  const studentStatusTemplate = (rowData) => {
    // Check multiple possible status fields
    const status = rowData.status || rowData.active || rowData.is_active || "Đang học";
    const displayStatus = typeof status === 'boolean' 
      ? (status ? "Đang học" : "Tạm dừng")
      : status;
    
    const severity = displayStatus === "Đang học" ? "success" : 
                    displayStatus === "Tạm dừng" ? "warning" : "info";
    
    return <Badge value={displayStatus} severity={severity} />;
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      
      <main className="dashboard-admin-content">
        <div className="dashboard-header-section">
          <div>
            <h2>🛠️ Dashboard Admin</h2>
            <div className="connection-status">
              {connectionStatus === 'online' && (
                <Badge value="🟢 Kết nối thành công" severity="success" />
              )}
              {connectionStatus === 'offline' && (
                <Badge value="🔴 Dữ liệu mẫu" severity="warning" />
              )}
              {connectionStatus === 'checking' && (
                <Badge value="🟡 Đang kiểm tra..." severity="info" />
              )}
            </div>
          </div>
          <div className="dashboard-controls">
            <Button 
              icon="pi pi-refresh" 
              label="Tải lại dữ liệu"
              className="p-button-outlined p-button-secondary"
              onClick={fetchDashboardData}
              loading={loading}
              style={{ marginRight: '1rem' }}
            />
            <Dropdown 
              value={selectedTimeRange} 
              options={timeRanges} 
              onChange={(e) => setSelectedTimeRange(e.value)}
              className="time-range-dropdown"
              placeholder="Chọn khoảng thời gian"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <Card className="stat-card stat-primary">
            <div className="stat-content">
              <div className="stat-icon">
                <i className="pi pi-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalStudents.toLocaleString()}</h3>
                <p>Tổng học viên</p>
                <ProgressBar value={75} className="stat-progress" />
              </div>
            </div>
          </Card>

          <Card className="stat-card stat-success">
            <div className="stat-content">
              <div className="stat-icon">
                <i className="pi pi-id-card"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalTeachers.toLocaleString()}</h3>
                <p>Tổng giảng viên</p>
                <ProgressBar value={60} className="stat-progress" />
              </div>
            </div>
          </Card>

          <Card className="stat-card stat-info">
            <div className="stat-content">
              <div className="stat-icon">
                <i className="pi pi-book"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalCourses.toLocaleString()}</h3>
                <p>Tổng khóa học</p>
                <ProgressBar value={85} className="stat-progress" />
              </div>
            </div>
          </Card>

          <Card className="stat-card stat-warning">
            <div className="stat-content">
              <div className="stat-icon">
                <i className="pi pi-calendar"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalClasses.toLocaleString()}</h3>
                <p>Tổng lớp học</p>
                <ProgressBar value={70} className="stat-progress" />
              </div>
            </div>
          </Card>

          <Card className="stat-card stat-secondary">
            <div className="stat-content">
              <div className="stat-icon">
                <i className="pi pi-building"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalFacilities.toLocaleString()}</h3>
                <p>Cơ sở đào tạo</p>
                <ProgressBar value={90} className="stat-progress" />
              </div>
            </div>
          </Card>

          <Card className="stat-card stat-help">
            <div className="stat-content">
              <div className="stat-icon">
                <i className="pi pi-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalManagers.toLocaleString()}</h3>
                <p>Quản lý</p>
                <ProgressBar value={50} className="stat-progress" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Panel header="🚀 Thao tác nhanh" className="quick-actions-panel">
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Card key={index} className="quick-action-card">
                <div className="action-content" onClick={() => handleQuickAction(action.path)}>
                  <div className={`action-icon action-${action.color}`}>
                    <i className={action.icon}></i>
                  </div>
                  <div className="action-info">
                    <h4>{action.label}</h4>
                    <p>{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Panel>

        {/* Data Tables */}
        <div className="dashboard-tables">
          <div className="table-section">
            <Panel header="👥 Học viên gần đây" className="recent-students-panel">
              <DataTable 
                value={recentStudents} 
                responsiveLayout="scroll"
                loading={loading}
                emptyMessage="Chưa có dữ liệu"
                className="modern-table"
              >
                <Column field="student_code" header="Mã SV" />
                <Column field="full_name" header="Họ tên" />
                <Column field="email" header="Email" />
                <Column 
                  field="status" 
                  header="Trạng thái" 
                  body={studentStatusTemplate}
                />
              </DataTable>
            </Panel>
          </div>

          <div className="table-section">
            <Panel header="🔔 Hoạt động gần đây" className="recent-activities-panel">
              <DataTable 
                value={recentActivities} 
                responsiveLayout="scroll"
                className="modern-table"
              >
                <Column field="action" header="Hoạt động" />
                <Column field="user" header="Người thực hiện" />
                <Column field="time" header="Thời gian" />
                <Column 
                  field="type" 
                  header="Loại" 
                  body={activityTypeTemplate}
                />
              </DataTable>
            </Panel>
          </div>
        </div>
      </main>
      
      <AdminFooter />
    </>
  );
}