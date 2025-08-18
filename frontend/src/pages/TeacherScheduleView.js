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
import TeacherHeader from "../components/TeacherHeader.jsx";
import ChatbotWidget from "../components/ChatbotWidget";
import "./TeacherScheduleView.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"];
const periods = ["Sáng", "Chiều", "Tối"];
const hocKyOptions = ["HK1", "HK2", "HK3"];

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

const TeacherScheduleView = () => {
  const [hocKy, setHocKy] = useState("");
  const [namHoc, setNamHoc] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classList, setClassList] = useState([]);
  const [weekList, setWeekList] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [roomCache, setRoomCache] = useState({}); // Cache để lưu thông tin phòng

  const yearNow = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const start = yearNow - i;
    return { label: `${start}-${start + 1}`, value: start };
  });

  // Tự động thiết lập năm học và học kỳ hiện tại
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() trả về 0-11
    const currentYear = currentDate.getFullYear();
    
    // Xác định học kỳ dựa trên tháng hiện tại
    let currentSemester = "";
    let academicYear = currentYear;
    
    if (currentMonth >= 9 || currentMonth <= 1) {
      // Tháng 9-12 và tháng 1: HK1
      currentSemester = "HK1";
      if (currentMonth >= 9) {
        academicYear = currentYear; // Năm học bắt đầu từ tháng 9
      } else {
        academicYear = currentYear - 1; // Tháng 1 thuộc năm học trước
      }
    } else if (currentMonth >= 2 && currentMonth <= 6) {
      // Tháng 2-6: HK2
      currentSemester = "HK2";
      academicYear = currentYear - 1;
    } else {
      // Tháng 7-8: HK3 (học hè)
      currentSemester = "HK3";
      academicYear = currentYear - 1;
    }
    
    // Fix: Hiện tại là tháng 8/2025, nên sẽ set thành HK1-2025
    if (currentMonth === 8 && currentYear === 2025) {
      currentSemester = "HK1";
      academicYear = 2025;
    }
    
    console.log(`Auto-detect: Month=${currentMonth}, Year=${currentYear} => Semester=${currentSemester}, Academic Year=${academicYear}`);
    
    setNamHoc(academicYear);
    setHocKy(currentSemester);
  }, []);

  // Get today's day in Vietnamese
  const getTodayVietnamese = () => {
    const today = new Date();
    const dayIndex = today.getDay();
    const dayNames = ["CN", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return dayNames[dayIndex];
  };

  // Check if it's current day
  const isToday = (day) => {
    return day === getTodayVietnamese();
  };

  // Get current week number
  const getCurrentWeek = () => {
    if (weekList.length === 0) return null;
    const today = new Date();
    const currentWeek = weekList.find(week => {
      const startDate = new Date(week.start_date);
      const endDate = new Date(week.end_date);
      return today >= startDate && today <= endDate;
    });
    return currentWeek?.week || null;
  };

  // Get room display name
  const getRoomDisplayName = (item) => {
    // Nếu có thông tin phòng trong cache
    if (item.room_id && roomCache[item.room_id]) {
      const room = roomCache[item.room_id];
      if (room.building && room.room_number) {
        return `${room.building}/${room.room_number}`;
      }
      if (room.room_number) {
        return `P.${room.room_number}`;
      }
    }
    
    // Fallback: hiển thị room_id nếu chưa có thông tin chi tiết
    if (item.room_id) {
      return `P.${item.room_id}`;
    }
    
    return null;
  };

  // Fetch room details by room_id
  const fetchRoomDetails = async (roomId) => {
    if (!roomId || roomCache[roomId]) return;
    
    try {
      // Thử endpoint public trước (không cần authentication)
      const response = await axios.get(`http://localhost:8000/manager/rooms/public/${roomId}`);
      const roomData = response.data;
      
      console.log(`Fetched room ${roomId}:`, roomData);
      
      // Cập nhật cache
      setRoomCache(prev => ({
        ...prev,
        [roomId]: roomData
      }));
    } catch (error) {
      console.error(`Không thể tải thông tin phòng ${roomId}:`, error);
      
      // Fallback: thử endpoint có authentication
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get(`http://localhost:8000/manager/rooms/${roomId}`, { headers });
        const roomData = response.data;
        
        console.log(`Fetched room ${roomId} (authenticated):`, roomData);
        
        setRoomCache(prev => ({
          ...prev,
          [roomId]: roomData
        }));
      } catch (authError) {
        console.error(`Không thể tải thông tin phòng ${roomId} (cả 2 endpoint):`, authError);
        // Cache với thông tin cơ bản
        setRoomCache(prev => ({
          ...prev,
          [roomId]: { room_number: roomId.toString(), building: null }
        }));
      }
    }
  };

  // Lấy thông tin giáo viên
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get("http://localhost:8000/teacher/profile", { headers })
      .then(res => {
        setTeacherInfo({
          name: res.data.name,
          code: res.data.code,
          faculty: res.data.faculty_name,
          id: res.data.user_id
        });
      })
      .catch(err => {
        console.error("Không thể tải thông tin giáo viên:", err);
        if (err.response?.status === 403) {
          setError("Bạn không có quyền truy cập trang này. Chỉ dành cho giáo viên.");
        } else {
          setError("Không thể tải thông tin giáo viên");
        }
      });
  }, []);

  // Lấy danh sách tuần học
  useEffect(() => {
    if (!hocKy || !namHoc) return;
    setLoading(true);
    axios
      .get("http://localhost:8000/weeks/", {
        params: { hoc_ky: hocKy, nam_hoc: namHoc },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWeekList(res.data);
          
          // Tự động chuyển đến tuần hiện tại
          const today = new Date();
          const currentWeekIndex = res.data.findIndex(week => {
            const startDate = new Date(week.start_date);
            const endDate = new Date(week.end_date);
            return today >= startDate && today <= endDate;
          });
          
          if (currentWeekIndex >= 0) {
            setCurrentPage(currentWeekIndex);
          } else {
            setCurrentPage(0);
          }
        }
      })
      .catch(() => setError("Không thể tải danh sách tuần học"))
      .finally(() => setLoading(false));
  }, [hocKy, namHoc]);

  // Lấy danh sách lớp mà giáo viên đang dạy
  useEffect(() => {
    if (!hocKy || !namHoc) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:8000/teacher/classes", {
        params: {
          hoc_ky: hocKy,
          nam_hoc: namHoc,
        },
        headers,
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setClassList(res.data);
          // Nếu chỉ có 1 lớp thì tự động chọn
          if (res.data.length === 1) {
            setSelectedClass(res.data[0].id);
          } else if (res.data.length === 0) {
            setError("Bạn chưa được phân công dạy lớp nào trong học kỳ này");
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách lớp:", err);
        if (err.response?.status === 404) {
          setError("Bạn chưa được phân công dạy lớp nào trong học kỳ này");
        } else {
          setError("Không thể tải danh sách lớp. Vui lòng thử lại sau.");
        }
        setClassList([]);
      });
  }, [hocKy, namHoc]);

  // Lấy lịch giảng dạy của giáo viên
  useEffect(() => {
    if (!hocKy || !namHoc || !selectedClass) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:8000/teacher/schedules", {
        params: {
          hoc_ky: hocKy,
          nam_hoc: namHoc,
          class_id: selectedClass,
        },
        headers,
      })
      .then(async (res) => {
        if (Array.isArray(res.data)) {
          setScheduleItems(res.data);
          
          // Debug: Log dữ liệu để xem cấu trúc
          console.log("Teacher schedule data:", res.data);
          
          // Fetch thông tin phòng cho tất cả các lịch học
          const roomIds = [...new Set(res.data.map(item => item.room_id).filter(Boolean))];
          console.log("Room IDs to fetch:", roomIds);
          
          // Fetch thông tin chi tiết cho từng phòng
          await Promise.all(roomIds.map(roomId => fetchRoomDetails(roomId)));
          
          // Lọc lịch học hôm nay
          const today = getTodayVietnamese();
          const currentWeek = getCurrentWeek();
          const todayClasses = res.data.filter(item => 
            item.day === today && item.week === currentWeek
          );
          
          // Debug: Log today's classes
          console.log("Today's classes:", todayClasses);
          
          setTodaySchedule(todayClasses);
          
          setError("");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải lịch giảng dạy:", err);
        if (err.response?.status === 404) {
          setError("Không có lịch giảng dạy cho lớp này trong học kỳ đã chọn");
        } else {
          setError("Không thể tải lịch giảng dạy. Vui lòng thử lại sau.");
        }
        setScheduleItems([]);
      })
      .finally(() => setLoading(false));
  }, [hocKy, namHoc, selectedClass]);

  // Cập nhật lịch giảng dạy hôm nay khi dữ liệu thay đổi
  useEffect(() => {
    if (scheduleItems.length > 0 && weekList.length > 0) {
      const today = getTodayVietnamese();
      const currentWeek = getCurrentWeek();
      const todayClasses = scheduleItems.filter(item => 
        item.day === today && item.week === currentWeek
      );
      setTodaySchedule(todayClasses);
    }
  }, [scheduleItems, weekList, roomCache]); // Thêm roomCache vào dependencies để cập nhật khi có thông tin phòng mới

  // Hàm chuyển về tuần hiện tại
  const goToCurrentWeek = () => {
    if (weekList.length === 0) return;
    
    const today = new Date();
    const currentWeekIndex = weekList.findIndex(week => {
      const startDate = new Date(week.start_date);
      const endDate = new Date(week.end_date);
      return today >= startDate && today <= endDate;
    });
    
    if (currentWeekIndex >= 0) {
      setCurrentPage(currentWeekIndex);
    }
  };

  // Kiểm tra xem có đang hiển thị tuần hiện tại không
  const isCurrentWeek = () => {
    if (weekList.length === 0 || !weekList[currentPage]) return false;
    const today = new Date();
    const displayedWeek = weekList[currentPage];
    const startDate = new Date(displayedWeek.start_date);
    const endDate = new Date(displayedWeek.end_date);
    return today >= startDate && today <= endDate;
  };

  const currentLabel = weekList[currentPage]
    ? `Tuần ${weekList[currentPage].hoc_ky_week} (${formatDate(weekList[currentPage].start_date)} – ${formatDate(weekList[currentPage].end_date)})`
    : "";

  const weekDates = weekList[currentPage]?.start_date
    ? getWeekDates(weekList[currentPage].start_date)
    : [];

  return (
    <div className="teacher-schedule-container">
      <TeacherHeader />
      <main className="teacher-schedule-main">
        <div className="teacher-schedule-content">
          <h2 className="teacher-schedule-title">
            Lịch giảng dạy
          </h2>

          {teacherInfo && (
            <Card className="teacher-info-card">
              <div className="teacher-info-content">
                <div className="teacher-info-avatar">
                  <i className="pi pi-graduation-cap" style={{ fontSize: '2rem', color: '#0c4da2' }}></i>
                </div>
                <div className="teacher-info-details">
                  <h3>{teacherInfo.name}</h3>
                  <p>Mã giáo viên: <strong>{teacherInfo.code}</strong></p>
                  {teacherInfo.faculty && (
                    <p>Khoa: <strong>{teacherInfo.faculty}</strong></p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Today's Schedule */}
          {hocKy && namHoc && selectedClass && todaySchedule.length > 0 && (
            <Card className="teacher-today-schedule-card">
              <div className="teacher-today-header">
                <h3>
                  <i className="pi pi-calendar-plus" style={{ marginRight: '0.5rem', color: '#0c4da2' }}></i>
                  Lịch dạy hôm nay ({getTodayVietnamese()})
                </h3>
                <Badge value={`${todaySchedule.length} tiết`} severity="info" />
              </div>
              
              <div className="teacher-today-classes">
                {todaySchedule
                  .sort((a, b) => {
                    const periodOrder = { "Sáng": 1, "Chiều": 2, "Tối": 3 };
                    return periodOrder[a.period] - periodOrder[b.period];
                  })
                  .map((item, index) => (
                    <div key={index} className="teacher-today-class-item">
                      <div className="teacher-class-time">
                        <Tag value={item.period} severity="info" />
                      </div>
                      <div className="teacher-class-details">
                        <div className="teacher-subject-name">
                          {item.subject_name || item.subject?.name || item.subject_id}
                        </div>
                        <div className="teacher-class-meta">
                          <span className="teacher-class-name">
                            <i className="pi pi-users" style={{ marginRight: '0.3rem' }}></i>
                            {item.class_obj?.name || `Lớp ${item.class_id}`}
                          </span>
                          {getRoomDisplayName(item) && (
                            <Chip 
                              label={getRoomDisplayName(item)} 
                              className="teacher-room-chip"
                            />
                          )}
                          <span className="teacher-format-info">
                            {item.hinh_thuc === "truc_tiep" ? "🏫 Trực tiếp" : "💻 Trực tuyến"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Show message when no classes today */}
          {hocKy && namHoc && selectedClass && todaySchedule.length === 0 && scheduleItems.length > 0 && (
            <Card className="teacher-no-today-schedule">
              <div className="teacher-no-today-content">
                <i className="pi pi-calendar-times" style={{ fontSize: '2rem', color: '#6b7280', marginBottom: '0.5rem' }}></i>
                <h4>Không có lịch dạy hôm nay</h4>
                <p>Hôm nay ({getTodayVietnamese()}) bạn không có lịch dạy nào.</p>
              </div>
            </Card>
          )}

          {error && (
            <Message 
              severity="warn" 
              text={error} 
              style={{ marginBottom: "1rem", width: "100%" }}
            />
          )}

          <Card className="teacher-schedule-form">
            <div className="teacher-form-row">
              <div className="teacher-form-field">
                <label>Năm học</label>
                <Dropdown 
                  value={namHoc} 
                  options={academicYears} 
                  onChange={(e) => setNamHoc(e.value)} 
                  placeholder="Chọn năm học"
                  className="teacher-dropdown"
                />
              </div>
              <div className="teacher-form-field">
                <label>Học kỳ</label>
                <Dropdown 
                  value={hocKy} 
                  options={hocKyOptions} 
                  onChange={(e) => setHocKy(e.value)} 
                  placeholder="Chọn học kỳ"
                  className="teacher-dropdown"
                />
              </div>
              <div className="teacher-form-field">
                <label>Lớp học</label>
                <Dropdown 
                  value={selectedClass} 
                  options={classList.map(cls => ({ label: cls.name, value: cls.id }))} 
                  onChange={(e) => setSelectedClass(e.value)} 
                  placeholder="Chọn lớp"
                  className="teacher-dropdown"
                  disabled={classList.length === 0}
                />
              </div>
            </div>
          </Card>

          {hocKy && namHoc && selectedClass && weekList.length > 0 && (
            <>
              <Card className="teacher-week-selector">
                <div className="teacher-week-header">
                  <h3>{currentLabel}</h3>
                  <div className="teacher-week-controls">
                    <Dropdown
                      value={currentPage}
                      options={weekList.map((w, i) => ({ 
                        label: `Tuần ${w.hoc_ky_week} (${formatDateShort(w.start_date)} - ${formatDateShort(w.end_date)})`, 
                        value: i 
                      }))}
                      onChange={(e) => setCurrentPage(e.value)}
                      placeholder="Chọn tuần"
                      className="teacher-week-dropdown"
                    />
                    {!isCurrentWeek() && (
                      <Button 
                        label="Tuần hiện tại" 
                        icon="pi pi-calendar" 
                        onClick={goToCurrentWeek}
                        className="p-button-sm p-button-success current-week-btn"
                        style={{ marginLeft: '0.5rem' }}
                      />
                    )}
                  </div>
                </div>
              </Card>

              <Card className="teacher-timetable-card">
                <div className="teacher-timetable-container">
                  {loading ? (
                    <div className="teacher-loading">
                      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                      <p>Đang tải lịch giảng dạy...</p>
                    </div>
                  ) : (
                    <table className="teacher-timetable">
                      <thead>
                        <tr>
                          <th className="period-header">Ca dạy</th>
                          {days.map((day, i) => (
                            <th key={day} className={`day-header ${isToday(day) ? 'today-column' : ''}`}>
                              <div className="day-name">{day}</div>
                              <small className="day-date">{weekDates[i] || ""}</small>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {periods.map((period) => (
                          <tr key={period}>
                            <td className="period-cell">
                              <strong>{period}</strong>
                            </td>
                            {days.map((day) => {
                              const entry = scheduleItems.find(
                                (item) =>
                                  item.week === weekList[currentPage]?.week &&
                                  item.day === day &&
                                  item.period === period
                              );
                              return (
                                <td key={day + period} className={`schedule-cell ${entry ? "has-class" : "empty-cell"} ${isToday(day) ? 'today-column' : ''}`}>
                                  {entry && (
                                    <div className="class-info">
                                      <div className="subject-info">
                                        <div className="subject-name">
                                          {entry.subject_name || entry.subject?.name || entry.subject_id}
                                        </div>
                                        {entry.subject?.code && (
                                          <div className="subject-code">
                                            ({entry.subject.code})
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="class-info-detail">
                                        <div className="class-content">
                                          <i className="pi pi-users"></i>
                                          <span className="class-text">{entry.class_obj?.name || `Lớp ${entry.class_id}`}</span>
                                        </div>
                                      </div>
                                      
                                      {getRoomDisplayName(entry) && (
                                        <div className="room-info">
                                          <i className="pi pi-home" style={{ fontSize: '0.6rem', marginRight: '0.2rem' }}></i>
                                          {getRoomDisplayName(entry)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

              {weekList.length > 1 && (
                <Card className="teacher-pagination-card">
                  <Paginator
                    first={currentPage}
                    rows={1}
                    totalRecords={weekList.length}
                    onPageChange={(e) => setCurrentPage(e.first)}
                    template="PrevPageLink CurrentPageReport NextPageLink"
                    currentPageReportTemplate={`Tuần ${weekList[currentPage]?.hoc_ky_week || (currentPage + 1)} / ${weekList.length} tuần`}
                    className="teacher-paginator"
                  />
                </Card>
              )}
            </>
          )}

          {hocKy && namHoc && selectedClass && weekList.length === 0 && !loading && (
            <Card className="teacher-no-data">
              <div className="teacher-no-data-content">
                <i className="pi pi-calendar-times" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h3>Chưa có lịch giảng dạy</h3>
                <p>Không có dữ liệu lịch giảng dạy cho lớp và học kỳ đã chọn.</p>
              </div>
            </Card>
          )}

          {!hocKy || !namHoc ? (
            <Card className="teacher-welcome-card">
              <div className="teacher-welcome-content">
                <i className="pi pi-calendar" style={{ fontSize: '3rem', color: '#0c4da2' }}></i>
                <h3>Chào mừng đến với hệ thống xem lịch giảng dạy</h3>
                <p>Vui lòng chọn năm học, học kỳ và lớp để xem lịch giảng dạy của bạn.</p>
              </div>
            </Card>
          ) : classList.length === 0 && !loading ? (
            <Card className="teacher-no-classes">
              <div className="teacher-no-classes-content">
                <i className="pi pi-users" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h3>Chưa có lớp được phân công</h3>
                <p>Bạn chưa được phân công dạy lớp nào trong học kỳ này.</p>
              </div>
            </Card>
          ) : null}
        </div>
      </main>
      
      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default TeacherScheduleView;
