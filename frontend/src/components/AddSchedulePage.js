import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";

import "./AddSchedulePage.css";

const days = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];
const periods = ["Sáng", "Chiều", "Tối"];
const hocKyOptions = ["HK1", "HK2", "HK3"];

const AddSchedulePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [hocKy, setHocKy] = useState("");
  const [namHoc, setNamHoc] = useState(null);
  const [weekList, setWeekList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [addedSubjects, setAddedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSubjectForPlacement, setSelectedSubjectForPlacement] = useState(null);

  const yearNow = new Date().getFullYear();
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const start = yearNow - i;
    return { label: `${start}-${start + 1}`, value: start };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    axios.get("http://localhost:8000/admin/classes", { headers }).then((res) => setClasses(res.data));
    axios.get("http://localhost:8000/admin/users/teachers/list", { headers }).then((res) => setTeachers(res.data));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get("http://localhost:8000/programs/by_major", {
        params: {
          khoa: selectedClass.khoa,
          major_id: selectedClass.major_id,
        },
        headers,
      })
      .then((res) => {
        if (res.data && Array.isArray(res.data.courses)) {
          setSubjects(res.data.courses);
        }
      });
  }, [selectedClass]);

  useEffect(() => {
    if (!hocKy || !namHoc) return;
    axios
      .get("http://localhost:8000/weeks", {
        params: { hoc_ky: hocKy, nam_hoc: namHoc },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setWeekList(res.data);
          setCurrentPage(0);
        }
      });
  }, [hocKy, namHoc]);

  const handleAddSubject = () => {
    if (!selectedSubject || !selectedTeacher) return;
    const exists = addedSubjects.find(
      (s) => s.code === selectedSubject.code && s.teacher.id === selectedTeacher.id
    );
    if (!exists) {
      setAddedSubjects([
        ...addedSubjects,
        {
          ...selectedSubject,
          teacher: selectedTeacher,
        },
      ]);
    }
    setSelectedSubject(null);
    setSelectedTeacher(null);
  };

  const handleToggleCell = (day, period) => {
    const week = weekList[currentPage]?.week;
    if (!selectedSubjectForPlacement) return;

    const exists = scheduleItems.findIndex(
      (item) =>
        item.week === week &&
        item.day === day &&
        item.period === period
    );

    if (exists !== -1) {
      const updated = [...scheduleItems];
      updated.splice(exists, 1);
      setScheduleItems(updated);
    } else {
      setScheduleItems([
        ...scheduleItems,
        {
          week,
          day,
          period,
          subject_code: selectedSubjectForPlacement.code,
          subject_name: selectedSubjectForPlacement.name,
          teacher_id: selectedSubjectForPlacement.teacher.id,
          teacher_name: selectedSubjectForPlacement.teacher.name,
        }
      ]);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const data = {
      class_id: selectedClass.id,
      hoc_ky: hocKy,
      nam_hoc: namHoc,
      schedule_items: scheduleItems.map(({ week, day, period, subject_code, teacher_id }) => ({
        week,
        day,
        period,
        subject_id: subject_code,
        teacher_id,
      })),
    };

    await axios.post("http://localhost:8000/admin/schedules", data, { headers });
    alert("✅ Đã lưu thời khóa biểu");
  };

  const currentLabel = weekList[currentPage]
    ? `Tuần ${weekList[currentPage].hoc_ky_week} (${weekList[currentPage].start_date} – ${weekList[currentPage].end_date})     `
    : "";

  return (
    <>
      <AdminHeader />
      <div className="facilities-list-page">
        <h2 className="form-title">Thêm Thời Khoá Biểu</h2>

        {/* Chọn lớp, năm học, học kỳ */}
        <div className="form-row">
          <Dropdown value={selectedClass} options={classes} optionLabel="ma_lop" onChange={(e) => setSelectedClass(e.value)} placeholder="Chọn lớp" />
          <Dropdown value={namHoc} options={academicYears} onChange={(e) => setNamHoc(e.value)} placeholder="Chọn năm học" />
          <Dropdown value={hocKy} options={hocKyOptions} onChange={(e) => setHocKy(e.value)} placeholder="Chọn học kỳ" />
        </div>

        {/* Form thêm môn */}
        <div className="form-row">
          <Dropdown value={selectedSubject} options={subjects} optionLabel="name" onChange={(e) => setSelectedSubject(e.value)} placeholder="Chọn môn" />
          <Dropdown value={selectedTeacher} options={teachers} optionLabel="name" onChange={(e) => setSelectedTeacher(e.value)} placeholder="Chọn giảng viên" />
          <Button label="Thêm môn" onClick={handleAddSubject} />
        </div>

        {/* Nút chọn môn */}
        <div className="subject-buttons-wrapper">
        {addedSubjects.map((s, i) => (
          <Button
            key={s.code + s.teacher.id}
            label={`${s.name} - ${s.teacher.name}`}
            className={`p-button-sm ${
              selectedSubjectForPlacement?.code === s.code &&
              selectedSubjectForPlacement?.teacher.id === s.teacher.id
                ? "p-button-info"
                : "p-button-outlined"
            } equal-width-button`}
            onClick={() => setSelectedSubjectForPlacement(s)}
          />
        ))}
      </div>
        <div className="form-row">
        <h3>{currentLabel}                 <Dropdown
          value={currentPage}
          options={weekList.map((w, i) => ({ label: `Tuần ${w.hoc_ky_week}`, value: i }))}
          onChange={(e) => setCurrentPage(e.value)}
          placeholder="Chọn tuần"
        /></h3>
        </div>

        {/* Bảng thời khoá biểu */}
        <div className="timetable-grid">
          <table className="custom-timetable">
            <thead>
              <tr>
                <th>Buổi / Thứ</th>
                {days.map((day) => <th key={day}>{day}</th>)}
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
                      <td
                        key={day + period}
                        onClick={() => handleToggleCell(day, period)}
                        className={entry ? "selected-cell" : ""}
                      >
                        {entry && (
                          <>
                            <Tag value={entry.subject_name} severity="info" className="mb-1" />
                            <Tag value={entry.teacher_name} severity="success" />
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

        {/* Tuần và phân trang */}


        <Paginator
          first={currentPage}
          rows={1}
          totalRecords={weekList.length}
          onPageChange={(e) => setCurrentPage(e.first)}
          template="PrevPageLink CurrentPageReport NextPageLink"
          currentPageReportTemplate={currentLabel}
        />

        <Button label="Lưu thời khóa biểu" onClick={handleSubmit} className="p-button-success" />
      </div>
      <AdminFooter />
    </>
  );
};

export default AddSchedulePage;
