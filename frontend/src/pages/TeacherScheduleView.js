import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Badge } from "primereact/badge";
import { Chip } from "primereact/chip";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import TeacherHeader from "../components/TeacherHeader";
import ChatbotWidget from "../components/ChatbotWidget";
import "./TeacherScheduleView.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"];
const hocKyOptions = ["HK1", "HK2", "HK3"];

const TeacherScheduleView = () => {
  const [hocKy, setHocKy] = useState("");
  const [namHoc, setNamHoc] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [weekList, setWeekList] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const itemsPerPage = 5;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = scheduleItems.slice(startIndex, endIndex);

  useEffect(() => {
    const initializeData = async () => {
      await fetchTeacherInfo();
      await fetchSemesters();
      await fetchWeeks();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      const semester = semesters.find(s => s.label === selectedSemester);
      if (semester) {
        setHocKy(semester.hoc_ky);
        setNamHoc(semester.nam_hoc);
        fetchSchedule(semester.hoc_ky, semester.nam_hoc);
      }
    }
  }, [selectedSemester, semesters]);

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

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("/teacher/semesters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Semesters loaded:", response.data);
      setSemesters(response.data);
      
      // Auto select latest semester
      if (response.data.length > 0) {
        setSelectedSemester(response.data[0].label);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchWeeks = async () => {
    try {
      const response = await axios.get("/weeks/weeks");
      setWeekList(response.data);
      console.log("Weeks loaded:", response.data.length);
    } catch (error) {
      console.error("Error fetching weeks:", error);
    }
  };

  const fetchSchedule = async (semester_hoc_ky = null, semester_nam_hoc = null) => {
    const useHocKy = semester_hoc_ky || hocKy;
    const useNamHoc = semester_nam_hoc || namHoc;
    
    if (!useHocKy || !useNamHoc) {
      console.log("No semester selected, skipping schedule fetch");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = {
        hoc_ky: useHocKy,
        nam_hoc: useNamHoc
      };
      
      console.log("Fetching schedule with params:", params);
      
      const response = await axios.get("/teacher/schedules", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Schedule loaded:", response.data);
      setScheduleItems(response.data);
      
      // Filter today's schedule
      const today = new Date();
      const todayDay = today.getDay() === 0 ? "7" : today.getDay().toString();
      const todayScheduleItems = response.data.filter(item => item.day === todayDay);
      setTodaySchedule(todayScheduleItems);
      
    } catch (error) {
      console.error("Error fetching schedule:", error);
      
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 404) {
        setError("Không tìm thấy lịch dạy cho học kỳ này.");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập thông tin này.");
      } else {
        setError("Không thể tải lịch dạy. Vui lòng thử lại.");
      }
      setScheduleItems([]);
      setTodaySchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomDetails = async (roomIds) => {
    try {
      const roomPromises = roomIds.map(id => 
        axios.get(`/api/rooms/${id}`).catch(() => null)
      );
      const roomResponses = await Promise.all(roomPromises);
      
      const roomData = {};
      roomResponses.forEach((response, index) => {
        if (response) {
          roomData[roomIds[index]] = response.data;
        }
      });
      setRoomDetails(roomData);
    } catch (error) {
      console.error("Error fetching room details:", error);
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

  const getPeriodLabel = (period) => {
    const periodNum = parseInt(period);
    switch (periodNum) {
      case 1: return "Sáng (7:00-11:00)";
      case 2: return "Chiều (13:00-17:00)";
      case 3: return "Tối (18:00-21:00)";
      default: return `Ca ${period}`;
    }
  };

  const getPeriodColor = (period) => {
    const periodNum = parseInt(period);
    switch (periodNum) {
      case 1: return "primary";
      case 2: return "success";
      case 3: return "warning";
      default: return "info";
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatDateShort = (dateStr) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const getWeekDates = (startDate) => {
    const base = new Date(startDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return formatDateShort(d);
    });
  };

  const renderScheduleCard = (item) => {
    const week = weekList.find(w => w.hoc_ky_week === item.week);
    const weekDates = week ? getWeekDates(week.start_date) : [];
    const dayIndex = parseInt(item.day) - 1;
    const dayDate = weekDates[dayIndex] || "";

    return (
      <Card key={`${item.week}-${item.day}-${item.period}`} className="schedule-card">
        <div className="schedule-header">
          <div className="schedule-time">
            <h4>
              {days[dayIndex]} - {dayDate}
            </h4>
            <Tag 
              value={getPeriodLabel(item.period)} 
              severity={getPeriodColor(item.period)}
              className="period-tag"
            />
          </div>
          <div className="schedule-week">
            <Badge value={`Tuần ${item.week}`} severity="info" />
          </div>
        </div>
        
        <div className="schedule-content">
          <div className="subject-info">
            <h3>{item.subject?.name || "Chưa có môn học"}</h3>
            <p className="subject-code">{item.subject?.code || ""}</p>
            <p className="subject-credits">{item.subject?.credits || 0} tín chỉ</p>
          </div>
          
          <div className="class-info">
            <Chip 
              label={item.class?.name || "Chưa có lớp"} 
              icon="pi pi-users"
              className="class-chip"
            />
          </div>
          
          {item.room && item.room.name && (
            <div className="room-info">
              <i className="pi pi-map-marker"></i>
              <span>{item.room.name}</span>
              {item.room.location && <span> - {item.room.location}</span>}
            </div>
          )}
          
          <div className="schedule-details">
            <span className="hinh-thuc">{item.hinh_thuc || "Lý thuyết"}</span>
            <span className="semester-info">{item.hoc_ky} - {item.nam_hoc}</span>
          </div>
        </div>
      </Card>
    );
  };

  const renderTodaySchedule = () => {
    if (todaySchedule.length === 0) {
      return (
        <Message 
          severity="info" 
          text="Hôm nay bạn không có lịch dạy" 
          className="no-schedule-message"
        />
      );
    }

    return (
      <div className="today-schedule">
        <h3>
          <i className="pi pi-calendar"></i>
          Lịch dạy hôm nay ({todaySchedule.length} tiết)
        </h3>
        <div className="today-items">
          {todaySchedule.map(item => renderScheduleCard(item))}
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-schedule-view">
      <TeacherHeader />
      
      <div className="schedule-container">
        <div className="schedule-header-section">
          <h1>
            <i className="pi pi-calendar"></i>
            Lịch dạy của tôi
          </h1>
          {teacherInfo && (
            <div className="teacher-info">
              <p>Giảng viên: <strong>{teacherInfo.name}</strong></p>
              <p>Mã GV: <strong>{teacherInfo.code}</strong></p>
              <p>Khoa: <strong>{teacherInfo.faculty}</strong></p>
            </div>
          )}
          <div className="debug-actions">
            <Button 
              label="Debug Info" 
              icon="pi pi-info-circle" 
              className="p-button-outlined"
              onClick={fetchDebugInfo}
              size="small"
            />
          </div>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label htmlFor="semester">Học kỳ:</label>
            <Dropdown
              id="semester"
              value={selectedSemester}
              options={semesters.map(sem => ({ label: sem.label, value: sem.label }))}
              onChange={(e) => setSelectedSemester(e.value)}
              placeholder="Chọn học kỳ"
              className="filter-dropdown"
              disabled={semesters.length === 0}
            />
          </div>
          
          <div className="filter-group">
            <Button 
              label="Tải lại" 
              icon="pi pi-refresh" 
              onClick={() => fetchSchedule()}
              className="p-button-outlined"
              disabled={loading || !selectedSemester}
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
            <span>Đang tải lịch dạy...</span>
          </div>
        )}

        {!loading && hocKy && namHoc && (
          <>
            {renderTodaySchedule()}
            
            <div className="schedule-list">
              <h3>
                <i className="pi pi-list"></i>
                Toàn bộ lịch dạy ({scheduleItems.length} tiết)
              </h3>
              
              {scheduleItems.length === 0 ? (
                <Message 
                  severity="info" 
                  text="Không có lịch dạy trong học kỳ này" 
                  className="no-schedule-message"
                />
              ) : (
                <>
                  <div className="schedule-cards">
                    {paginatedItems.map(item => renderScheduleCard(item))}
                  </div>
                  
                  {scheduleItems.length > itemsPerPage && (
                    <Paginator
                      first={startIndex}
                      rows={itemsPerPage}
                      totalRecords={scheduleItems.length}
                      onPageChange={(e) => setCurrentPage(e.page)}
                      className="schedule-paginator"
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

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
            
            <h4>Schedule Stats:</h4>
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

export default TeacherScheduleView;
