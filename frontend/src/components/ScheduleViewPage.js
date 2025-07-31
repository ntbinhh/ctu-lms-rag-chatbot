import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

import "./ScheduleViewPage.css";

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

const ScheduleViewPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [hocKy, setHocKy] = useState("");
  const [namHoc, setNamHoc] = useState(null);
  const [weekList, setWeekList] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const toast = React.useRef(null);

  const yearNow = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const start = yearNow - i;
    return { label: `${start}-${start + 1}`, value: start };
  });

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    axios.get("http://localhost:8000/admin/classes", { headers })
      .then((res) => {
        setClasses(res.data);
        setError("");
      })
      .catch((err) => {
        setError("Không thể tải danh sách lớp");
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể tải danh sách lớp"
        });
      })
      .finally(() => setLoading(false));
  }, []);

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
          setCurrentPage(0);
          setError("");
        }
      })
      .catch((err) => {
        setError("Không thể tải danh sách tuần học");
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể tải danh sách tuần học"
        });
      })
      .finally(() => setLoading(false));
  }, [hocKy, namHoc]);

  useEffect(() => {
    if (!selectedClass || !hocKy || !namHoc) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("http://localhost:8000/admin/schedules", {
        params: {
          class_id: selectedClass.id,
          hoc_ky: hocKy,
          nam_hoc: namHoc,
        },
        headers,
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setScheduleItems(res.data);
          setError("");
          toast.current?.show({
            severity: "success",
            summary: "Thành công",
            detail: `Đã tải thời khoá biểu lớp ${selectedClass.ma_lop}`
          });
        }
      })
      .catch((err) => {
        setError("Không thể tải thời khoá biểu");
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể tải thời khoá biểu"
        });
      })
      .finally(() => setLoading(false));
  }, [selectedClass, hocKy, namHoc]);

  const resetForm = () => {
    setSelectedClass(null);
    setHocKy("");
    setNamHoc(null);
    setWeekList([]);
    setScheduleItems([]);
    setCurrentPage(0);
    setError("");
  };

  const exportSchedule = () => {
    if (!selectedClass || !scheduleItems.length) {
      toast.current?.show({
        severity: "warn",
        summary: "Cảnh báo",
        detail: "Vui lòng chọn lớp và có dữ liệu thời khoá biểu"
      });
      return;
    }
    // Placeholder for export functionality
    toast.current?.show({
      severity: "info",
      summary: "Thông báo",
      detail: "Tính năng xuất file đang được phát triển"
    });
  };

  const jumpToWeek = (date) => {
    if (!weekList.length) return;
    
    const selectedWeek = weekList.findIndex(week => {
      const startDate = new Date(week.start_date);
      const endDate = new Date(week.end_date);
      return date >= startDate && date <= endDate;
    });
    
    if (selectedWeek !== -1) {
      setCurrentPage(selectedWeek);
      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: `Đã chuyển đến tuần ${weekList[selectedWeek].hoc_ky_week}`
      });
    } else {
      toast.current?.show({
        severity: "warn",
        summary: "Cảnh báo",
        detail: "Không tìm thấy tuần học cho ngày đã chọn"
      });
    }
  };

  const currentLabel = weekList[currentPage]
    ? `Tuần ${weekList[currentPage].hoc_ky_week} (${formatDate(weekList[currentPage].start_date)} – ${formatDate(weekList[currentPage].end_date)})`
    : "";

  const weekDates = weekList[currentPage]?.start_date
    ? getWeekDates(weekList[currentPage].start_date)
    : [];

  const hasScheduleData = selectedClass && hocKy && namHoc && scheduleItems.length > 0;

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      
      <div className="schedule-view-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <i className="pi pi-calendar"></i>
                Xem Thời Khoá Biểu
              </h1>
              <p className="page-subtitle">
                Tra cứu và xem thời khoá biểu theo lớp, học kỳ và tuần học
              </p>
            </div>
            <div className="header-actions">
              <Button
                icon="pi pi-refresh"
                label="Làm mới"
                className="p-button-outlined"
                onClick={resetForm}
                disabled={loading}
              />
              <Button
                icon="pi pi-download"
                label="Xuất file"
                className="p-button-primary"
                onClick={exportSchedule}
                disabled={!hasScheduleData || loading}
              />
            </div>
          </div>
        </div>

        <Card className="filter-card">
          <div className="filter-section">
            <h3 className="filter-title">
              <i className="pi pi-filter"></i>
              Bộ lọc thời khoá biểu
            </h3>
            
            <div className="filter-grid">
              <div className="filter-group">
                <label htmlFor="class-select">Lớp học</label>
                <Dropdown
                  id="class-select"
                  value={selectedClass}
                  options={classes}
                  optionLabel="ma_lop"
                  onChange={(e) => setSelectedClass(e.value)}
                  placeholder="Chọn lớp học"
                  className="w-full"
                  disabled={loading}
                  filter
                  showClear
                />
              </div>

              <div className="filter-group">
                <label htmlFor="year-select">Năm học</label>
                <Dropdown
                  id="year-select"
                  value={namHoc}
                  options={academicYears}
                  onChange={(e) => setNamHoc(e.value)}
                  placeholder="Chọn năm học"
                  className="w-full"
                  disabled={loading}
                  showClear
                />
              </div>

              <div className="filter-group">
                <label htmlFor="semester-select">Học kỳ</label>
                <Dropdown
                  id="semester-select"
                  value={hocKy}
                  options={hocKyOptions}
                  onChange={(e) => setHocKy(e.value)}
                  placeholder="Chọn học kỳ"
                  className="w-full"
                  disabled={loading}
                  showClear
                />
              </div>

              <div className="filter-group">
                <label htmlFor="date-select">Chuyển đến ngày</label>
                <Calendar
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.value);
                    if (e.value) jumpToWeek(e.value);
                  }}
                  placeholder="Chọn ngày"
                  className="w-full"
                  disabled={loading || !weekList.length}
                  showIcon
                  dateFormat="dd/mm/yy"
                />
              </div>
            </div>
          </div>
        </Card>

        {loading && (
          <Card className="loading-card">
            <div className="loading-content">
              <ProgressSpinner style={{ width: '50px', height: '50px' }} />
              <p>Đang tải dữ liệu...</p>
            </div>
          </Card>
        )}

        {error && (
          <Card className="error-card">
            <div className="error-content">
              <i className="pi pi-exclamation-triangle"></i>
              <p>{error}</p>
            </div>
          </Card>
        )}

        {!loading && selectedClass && hocKy && namHoc && weekList.length > 0 && (
          <Card className="schedule-card">
            <div className="schedule-header">
              <div className="schedule-info">
                <h3 className="schedule-title">
                  <i className="pi pi-calendar-plus"></i>
                  Thời khoá biểu lớp {selectedClass.ma_lop}
                </h3>
                <div className="schedule-meta">
                  <Tag value={`${hocKy} - Năm học ${namHoc}-${namHoc + 1}`} severity="info" />
                  <Tag value={currentLabel} severity="success" />
                </div>
              </div>
              
              <div className="week-navigation">
                <Dropdown
                  value={currentPage}
                  options={weekList.map((w, i) => ({ 
                    label: `Tuần ${w.hoc_ky_week} (${formatDateShort(w.start_date)} - ${formatDateShort(w.end_date)})`, 
                    value: i 
                  }))}
                  onChange={(e) => setCurrentPage(e.value)}
                  placeholder="Chọn tuần"
                  className="week-dropdown"
                />
              </div>
            </div>

            <div className="timetable-container">
              <div className="timetable-wrapper">
                <table className="modern-timetable">
                  <thead>
                    <tr>
                      <th className="period-header">Ca học</th>
                      {days.map((day, i) => (
                        <th key={day} className="day-header">
                          <div className="day-info">
                            <span className="day-name">{day}</span>
                            <span className="day-date">{weekDates[i] || ""}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((period) => (
                      <tr key={period} className="period-row">
                        <td className="period-cell">
                          <div className="period-info">
                            <strong>{period}</strong>
                            <small>
                              {period === "Sáng" && "7:00 - 11:30"}
                              {period === "Chiều" && "13:30 - 17:00"}
                              {period === "Tối" && "18:00 - 21:30"}
                            </small>
                          </div>
                        </td>
                        {days.map((day) => {
                          const entry = scheduleItems.find(
                            (item) =>
                              item.week === weekList[currentPage]?.week &&
                              item.day === day &&
                              item.period === period
                          );
                          return (
                            <td 
                              key={day + period} 
                              className={`schedule-cell ${entry ? "has-subject" : "empty-cell"}`}
                            >
                              {entry && (
                                <div className="subject-info">
                                  <div className="subject-header">
                                    <Tag 
                                      value={entry.subject_name || entry.subject?.name || entry.subject_id} 
                                      severity="info" 
                                      className="subject-tag"
                                    />
                                  </div>
                                  <div className="subject-details">
                                    <div className="teacher-info">
                                      <i className="pi pi-user"></i>
                                      <span>{entry.teacher_profile?.name || entry.teacher_name || "Chưa phân công"}</span>
                                    </div>
                                    {entry.room && (
                                      <div className="room-info">
                                        <i className="pi pi-home"></i>
                                        <span>{entry.room}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="schedule-pagination">
              <Paginator
                first={currentPage}
                rows={1}
                totalRecords={weekList.length}
                onPageChange={(e) => setCurrentPage(e.first)}
                template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate={`Tuần {currentPage} / {totalPages}`}
                className="custom-paginator"
              />
            </div>
          </Card>
        )}

        {!loading && selectedClass && hocKy && namHoc && scheduleItems.length === 0 && weekList.length > 0 && (
          <Card className="empty-schedule-card">
            <div className="empty-content">
              <i className="pi pi-calendar-times"></i>
              <h3>Không có dữ liệu thời khoá biểu</h3>
              <p>Lớp {selectedClass.ma_lop} chưa có thời khoá biểu cho {hocKy} năm học {namHoc}-{namHoc + 1}</p>
            </div>
          </Card>
        )}
      </div>
      
      <AdminFooter />
    </>
  );
};

export default ScheduleViewPage;
