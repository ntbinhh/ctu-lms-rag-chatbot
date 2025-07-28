import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import TeacherHeader from "../components/TeacherHeader";
import ChatbotWidget from "../components/ChatbotWidget";
import "./TeacherClassesView.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const TeacherClassesView = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsDialog, setStudentsDialog] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchTeacherInfo();
      await fetchClasses();
    };
    initializeData();
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        return;
      }

      const response = await axios.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Kiểm tra role
      if (response.data.role !== "teacher") {
        setError("Bạn không có quyền truy cập trang này. Chỉ dành cho giảng viên.");
        return;
      }
      
      setTeacherInfo(response.data);
      console.log("Teacher info loaded:", response.data);
    } catch (error) {
      console.error("Error fetching teacher info:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập vào trang này.");
      } else {
        setError("Không thể tải thông tin giảng viên.");
      }
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/teacher/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Classes loaded:", response.data);
      setClasses(response.data);
      
    } catch (error) {
      console.error("Error fetching classes:", error);
      
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 404) {
        setError("Không tìm thấy thông tin lớp học.");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập thông tin này.");
      } else {
        setError("Không thể tải danh sách lớp học. Vui lòng thử lại.");
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    setStudentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/classes/${classId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchDebugInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/teacher/debug", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDebugInfo(response.data);
      setShowDebug(true);
    } catch (error) {
      console.error("Error fetching debug info:", error);
    }
  };

  const viewStudents = (classData) => {
    setSelectedClass(classData);
    setStudentsDialog(true);
    fetchStudents(classData.id);
  };

  const renderClassCard = (classData) => {
    return (
      <Card key={classData.id} className="class-card">
        <div className="class-header">
          <div className="class-info">
            <h3>{classData.name}</h3>
            <p className="class-code">Mã lớp: {classData.code}</p>
          </div>
          <div className="class-stats">
            <Badge 
              value={`${classData.student_count} SV`} 
              severity="info" 
              className="student-count-badge"
            />
          </div>
        </div>

        <div className="class-content">
          <div className="class-details">
            <div className="detail-item">
              <i className="pi pi-building"></i>
              <span>Khoa: {classData.khoa || "Chưa xác định"}</span>
            </div>
            
            {classData.nien_khoa && (
              <div className="detail-item">
                <i className="pi pi-calendar"></i>
                <span>Niên khóa: {classData.nien_khoa}</span>
              </div>
            )}
            
            {classData.major && (
              <div className="detail-item">
                <i className="pi pi-book"></i>
                <span>Ngành: {classData.major}</span>
              </div>
            )}
          </div>

          <div className="subjects-section">
            <h4>Môn học giảng dạy:</h4>
            <div className="subjects-list">
              {classData.subjects && classData.subjects.length > 0 ? (
                classData.subjects.map((subject, index) => (
                  <Chip 
                    key={index}
                    label={`${subject.name} (${subject.code})`}
                    className="subject-chip"
                  />
                ))
              ) : (
                <span className="no-subjects">Chưa có môn học</span>
              )}
            </div>
          </div>

          <div className="class-actions">
            <Button
              label="Xem sinh viên"
              icon="pi pi-users"
              className="p-button-outlined"
              onClick={() => viewStudents(classData)}
            />
          </div>
        </div>
      </Card>
    );
  };

  const renderStudentsDialog = () => {
    return (
      <Dialog
        header={`Danh sách sinh viên - ${selectedClass?.name}`}
        visible={studentsDialog}
        style={{ width: '70vw' }}
        onHide={() => setStudentsDialog(false)}
      >
        {studentsLoading ? (
          <div className="loading-container">
            <i className="pi pi-spin pi-spinner"></i>
            <span>Đang tải danh sách sinh viên...</span>
          </div>
        ) : (
          <DataTable
            value={students}
            paginator
            rows={10}
            emptyMessage="Không có sinh viên nào trong lớp này"
            className="students-table"
          >
            <Column field="mssv" header="MSSV" sortable />
            <Column field="name" header="Họ và tên" sortable />
            <Column field="email" header="Email" />
            <Column field="phone" header="Số điện thoại" />
            <Column 
              field="status" 
              header="Trạng thái" 
              body={(rowData) => (
                <Tag 
                  value={rowData.status === 'active' ? 'Đang học' : 'Nghỉ học'}
                  severity={rowData.status === 'active' ? 'success' : 'danger'}
                />
              )}
            />
          </DataTable>
        )}
      </Dialog>
    );
  };

  return (
    <div className="teacher-classes-view">
      <TeacherHeader />
      
      <div className="classes-container">
        <div className="classes-header-section">
          <h1>
            <i className="pi pi-users"></i>
            Danh sách lớp giảng dạy
          </h1>
          {teacherInfo && (
            <div className="teacher-info">
              <p>Giảng viên: <strong>{teacherInfo.name}</strong></p>
              <p>Mã GV: <strong>{teacherInfo.code}</strong></p>
              <p>Khoa: <strong>{teacherInfo.faculty}</strong></p>
            </div>
          )}
          <div className="actions">
            <Button 
              label="Tải lại" 
              icon="pi pi-refresh" 
              onClick={fetchClasses}
              className="p-button-outlined"
              disabled={loading}
            />
            <Button 
              label="Debug Info" 
              icon="pi pi-info-circle" 
              className="p-button-outlined"
              onClick={fetchDebugInfo}
              size="small"
            />
          </div>
        </div>

        {error && (
          <Message 
            severity="error" 
            text={error} 
            className="error-message"
          />
        )}

        {loading && (
          <div className="loading-container">
            <i className="pi pi-spin pi-spinner"></i>
            <span>Đang tải danh sách lớp...</span>
          </div>
        )}

        {!loading && (
          <div className="classes-content">
            {classes.length === 0 ? (
              <Message 
                severity="info" 
                text="Hiện tại bạn chưa được phân công giảng dạy lớp nào." 
                className="no-classes-message"
              />
            ) : (
              <>
                <div className="classes-summary">
                  <h3>
                    <i className="pi pi-chart-bar"></i>
                    Tổng quan
                  </h3>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <Badge value={classes.length} severity="success" />
                      <span>Lớp giảng dạy</span>
                    </div>
                    <div className="stat-item">
                      <Badge 
                        value={classes.reduce((total, cls) => total + cls.student_count, 0)} 
                        severity="info" 
                      />
                      <span>Tổng sinh viên</span>
                    </div>
                    <div className="stat-item">
                      <Badge 
                        value={[...new Set(classes.flatMap(cls => cls.subjects.map(s => s.code)))].length} 
                        severity="warning" 
                      />
                      <span>Môn học</span>
                    </div>
                  </div>
                </div>

                <div className="classes-grid">
                  {classes.map(classData => renderClassCard(classData))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {renderStudentsDialog()}

      {/* Debug Dialog */}
      <Dialog 
        header="Debug Information" 
        visible={showDebug} 
        style={{ width: '50vw' }} 
        onHide={() => setShowDebug(false)}
      >
        {debugInfo && (
          <div>
            <h4>User Info:</h4>
            <pre>{JSON.stringify(debugInfo.user, null, 2)}</pre>
            
            <h4>Teacher Profile:</h4>
            <pre>{JSON.stringify(debugInfo.teacher_profile, null, 2)}</pre>
            
            <h4>Stats:</h4>
            <p>Schedule Items: {debugInfo.schedule_items_count}</p>
            <p>Classes: {debugInfo.distinct_classes}</p>
            <p>Class IDs: {JSON.stringify(debugInfo.class_ids)}</p>
          </div>
        )}
      </Dialog>
      
      <ChatbotWidget />
    </div>
  );
};

export default TeacherClassesView;
