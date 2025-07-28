import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import StudentHeader from "../components/StudentHeader";
import "./StudentScheduleView.css";
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

const StudentScheduleView = () => {
  const [hocKy, setHocKy] = useState("");
  const [namHoc, setNamHoc] = useState(null);
  const [weekList, setWeekList] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);

  const yearNow = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const start = yearNow - i;
    return { label: `${start}-${start + 1}`, value: start };
  });

  // Lấy thông tin sinh viên
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get("http://localhost:8000/admin/student/profile", { headers })
      .then(res => {
        setStudentInfo({
          name: res.data.name,
          class_name: res.data.class_name,
          student_code: res.data.student_code
        });
      })
      .catch(err => {
        console.error("Không thể tải thông tin sinh viên:", err);
        setError("Không thể tải thông tin sinh viên");
      });
  }, []);

  // Lấy danh sách tuần học
  useEffect(() => {
    if (!hocKy || !namHoc) return;
    setLoading(true);
    axios
      .get("http://localhost:8000/weeks", {
        params: { hoc_ky: hocKy, nam_hoc: namHoc },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWeekList(res.data);
          setCurrentPage(0);
        }
      })
      .catch(() => setError("Không thể tải danh sách tuần học"))
      .finally(() => setLoading(false));
  }, [hocKy, namHoc]);

  // Lấy lịch học của sinh viên
  useEffect(() => {
    if (!hocKy || !namHoc) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:8000/student/schedules", {
        params: {
          hoc_ky: hocKy,
          nam_hoc: namHoc,
        },
        headers,
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setScheduleItems(res.data);
          setError("");
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải lịch học:", err);
        if (err.response?.status === 404) {
          setError("Bạn chưa được phân lớp hoặc chưa có lịch học cho học kỳ này");
        } else {
          setError("Không thể tải lịch học. Vui lòng thử lại sau.");
        }
        setScheduleItems([]);
      })
      .finally(() => setLoading(false));
  }, [hocKy, namHoc]);

  const currentLabel = weekList[currentPage]
    ? `Tuần ${weekList[currentPage].hoc_ky_week} (${formatDate(weekList[currentPage].start_date)} – ${formatDate(weekList[currentPage].end_date)})`
    : "";

  const weekDates = weekList[currentPage]?.start_date
    ? getWeekDates(weekList[currentPage].start_date)
    : [];

  return (
    <div className="student-schedule-container">
      <StudentHeader />
      <main className="student-schedule-main">
        <div className="student-schedule-content">
          <h2 className="student-schedule-title">
            Thời khóa biểu
          </h2>

          {studentInfo && (
            <Card className="student-info-card">
              <div className="student-info-content">
                <div className="student-info-avatar">
                  <i className="pi pi-user" style={{ fontSize: '2rem', color: '#0c4da2' }}></i>
                </div>
                <div className="student-info-details">
                  <h3>{studentInfo.name}</h3>
                  <p>Mã sinh viên: <strong>{studentInfo.student_code}</strong></p>
                  <p>Lớp: <strong>{studentInfo.class_name}</strong></p>
                </div>
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

          <Card className="student-schedule-form">
            <div className="student-form-row">
              <div className="student-form-field">
                <label>Năm học</label>
                <Dropdown 
                  value={namHoc} 
                  options={academicYears} 
                  onChange={(e) => setNamHoc(e.value)} 
                  placeholder="Chọn năm học"
                  className="student-dropdown"
                />
              </div>
              <div className="student-form-field">
                <label>Học kỳ</label>
                <Dropdown 
                  value={hocKy} 
                  options={hocKyOptions} 
                  onChange={(e) => setHocKy(e.value)} 
                  placeholder="Chọn học kỳ"
                  className="student-dropdown"
                />
              </div>
            </div>
          </Card>

          {hocKy && namHoc && weekList.length > 0 && (
            <>
              <Card className="student-week-selector">
                <div className="student-week-header">
                  <h3>{currentLabel}</h3>
                  <Dropdown
                    value={currentPage}
                    options={weekList.map((w, i) => ({ 
                      label: `Tuần ${w.hoc_ky_week} (${formatDateShort(w.start_date)} - ${formatDateShort(w.end_date)})`, 
                      value: i 
                    }))}
                    onChange={(e) => setCurrentPage(e.value)}
                    placeholder="Chọn tuần"
                    className="student-week-dropdown"
                  />
                </div>
              </Card>

              <Card className="student-timetable-card">
                <div className="student-timetable-container">
                  {loading ? (
                    <div className="student-loading">
                      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                      <p>Đang tải lịch học...</p>
                    </div>
                  ) : (
                    <table className="student-timetable">
                      <thead>
                        <tr>
                          <th className="period-header">Ca học</th>
                          {days.map((day, i) => (
                            <th key={day} className="day-header">
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
                                <td key={day + period} className={`schedule-cell ${entry ? "has-class" : "empty-cell"}`}>
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
                                      
                                      <div className="teacher-info">
                                        <div className="teacher-content">
                                          <i className="pi pi-graduation-cap"></i>
                                          <span className="teacher-text">{entry.teacher_profile?.name || entry.teacher_name}</span>
                                        </div>
                                      </div>
                                      
                                      {entry.room && (
                                        <div className="room-info">
                                          <i className="pi pi-home" style={{ fontSize: '0.6rem', marginRight: '0.2rem' }}></i>
                                          Phòng {entry.room.room_number || entry.room.id}
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
                <Card className="student-pagination-card">
                  <Paginator
                    first={currentPage}
                    rows={1}
                    totalRecords={weekList.length}
                    onPageChange={(e) => setCurrentPage(e.first)}
                    template="PrevPageLink CurrentPageReport NextPageLink"
                    currentPageReportTemplate={`Tuần {currentPage + 1} / {totalRecords}`}
                    className="student-paginator"
                  />
                </Card>
              )}
            </>
          )}

          {hocKy && namHoc && weekList.length === 0 && !loading && (
            <Card className="student-no-data">
              <div className="student-no-data-content">
                <i className="pi pi-calendar-times" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h3>Chưa có lịch học</h3>
                <p>Không có dữ liệu lịch học cho học kỳ và năm học đã chọn.</p>
              </div>
            </Card>
          )}

          {!hocKy || !namHoc ? (
            <Card className="student-welcome-card">
              <div className="student-welcome-content">
                <i className="pi pi-calendar" style={{ fontSize: '3rem', color: '#0c4da2' }}></i>
                <h3>Chào mừng đến với hệ thống xem lịch học</h3>
                <p>Vui lòng chọn năm học và học kỳ để xem lịch học của bạn.</p>
              </div>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default StudentScheduleView;
