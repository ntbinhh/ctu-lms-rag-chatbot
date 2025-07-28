import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

import "./AddSchedulePage.css";

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

  const yearNow = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const start = yearNow - i;
    return { label: `${start}-${start + 1}`, value: start };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("http://localhost:8000/admin/classes", { headers }).then((res) => setClasses(res.data));
  }, []);

  useEffect(() => {
    if (!hocKy || !namHoc) return;
    axios
      .get("http://localhost:8000/weeks/", {
        params: { hoc_ky: hocKy, nam_hoc: namHoc },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWeekList(res.data);
          setCurrentPage(0);
        }
      });
  }, [hocKy, namHoc]);

  useEffect(() => {
    if (!selectedClass || !hocKy || !namHoc) return;
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
        if (Array.isArray(res.data)) setScheduleItems(res.data);
      });
  }, [selectedClass, hocKy, namHoc]);

  const currentLabel = weekList[currentPage]
    ? `Tuần ${weekList[currentPage].hoc_ky_week} (${formatDate(weekList[currentPage].start_date)} – ${formatDate(weekList[currentPage].end_date)})`
    : "";

  const weekDates = weekList[currentPage]?.start_date
    ? getWeekDates(weekList[currentPage].start_date)
    : [];

  return (
    <>
      <AdminHeader />
      <div className="facilities-list-page">
        <h2 className="form-title">Xem thời khoá biểu</h2>

        <div className="form-row">
          <Dropdown value={selectedClass} options={classes} optionLabel="ma_lop" onChange={(e) => setSelectedClass(e.value)} placeholder="Chọn lớp" />
          <Dropdown value={namHoc} options={academicYears} onChange={(e) => setNamHoc(e.value)} placeholder="Chọn năm học" />
          <Dropdown value={hocKy} options={hocKyOptions} onChange={(e) => setHocKy(e.value)} placeholder="Chọn học kỳ" />
        </div>

        <div className="form-row">
          <h2 className="form-title">
            {currentLabel}
            <Dropdown
              value={currentPage}
              options={weekList.map((w, i) => ({ label: `Tuần ${w.hoc_ky_week}`, value: i }))}
              onChange={(e) => setCurrentPage(e.value)}
              placeholder="Chọn tuần"
              className="ml-3"
            />
          </h2>
        </div>

        <div className="timetable-grid">
          <table className="custom-timetable">
            <thead>
              <tr>
                <th></th>
                {days.map((day, i) => (
                  <th key={day}>
                    <div>{day}</div>
                    <small style={{ fontSize: "12px", color: "#888" }}>{weekDates[i] || ""}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period}>
                  <td><strong>{period}</strong></td>
                  {days.map((day) => {
                    const entry = scheduleItems.find(
                      (item) =>
                        item.week === weekList[currentPage]?.week &&
                        item.day === day &&
                        item.period === period
                    );
                    return (
                      <td key={day + period} className={entry ? "selected-cell" : ""}>
                        {entry && (
                          <>
                            <Tag value={entry.subject_name || entry.subject?.name || entry.subject_id} severity="info" className="mb-1" />
<Tag value={entry.teacher_profile?.name || entry.teacher_name} severity="success" />
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Paginator
          first={currentPage}
          rows={1}
          totalRecords={weekList.length}
          onPageChange={(e) => setCurrentPage(e.first)}
          template="PrevPageLink CurrentPageReport NextPageLink"
          currentPageReportTemplate={currentLabel}
        />
      </div>
      <AdminFooter />
    </>
  );
};

export default ScheduleViewPage;
