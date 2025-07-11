import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import "./AddSchedulePage.css";
import { useRef } from "react";
import { Messages } from "primereact/messages";

const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"];
const periods = ["Sáng", "Chiều", "Tối"];
const hocKyOptions = ["HK1", "HK2", "HK3"];

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatDateShort = (date) => {
  const d = new Date(date);
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

const AddSchedulePage = () => {
  const msgs = useRef(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hocKy, setHocKy] = useState("");
  const [namHoc, setNamHoc] = useState(null);
  const [hinhThuc, setHinhThuc] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

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
    if (hinhThuc === "truc_tiep" && selectedClass?.facility_id) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      axios
        .get("http://localhost:8000/manager/rooms", {
          headers,
          params: { facility_id: selectedClass.facility_id },
        })
        .then((res) => setRooms(res.data));
    }
  }, [hinhThuc, selectedClass]);

  useEffect(() => {
    if (!selectedClass) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get("http://localhost:8000/programs/by_major", {
        params: { khoa: selectedClass.khoa, major_id: selectedClass.major_id },
        headers,
      })
      .then((res) => {
        if (Array.isArray(res.data.courses)) {
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
    console.log(" Giảng viên chọn:", selectedTeacher);
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
      (item) => item.week === week && item.day === day && item.period === period
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
          teacher_id: selectedSubjectForPlacement.teacher.user_id,
          teacher_name: selectedSubjectForPlacement.teacher.name,
          hinh_thuc: hinhThuc,
          room_id: hinhThuc === "truc_tiep" ? selectedRoom?.id : null,
        },
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
    schedule_items: scheduleItems.map(
      ({ week, day, period, subject_code, teacher_id, hinh_thuc, room_id }) => ({
        week,
        day,
        period,
        subject_id: subject_code,
        teacher_id,
        hinh_thuc,
        room_id,
      })
    ),
  };

  try {
    console.log("🔍 Data gửi lên:", JSON.stringify(data, null, 2));
    const res = await axios.post("http://localhost:8000/admin/schedules", data, { headers });

    const { message, skipped } = res.data;

    msgs.current.clear();  // clear cũ
    msgs.current.show([
      {
        severity: "success",
        summary: "Thành công",
        detail: message,
        life: 10000,
      },
      ...(skipped || []).map((item) => ({
        severity: "warn",
        summary: "Trùng lịch",
        detail: `Tuần ${item.week}, ${item.day}, ${item.period}`,
        life: 10000,
      })),
    ]);
  } catch (error) {
    msgs.current.clear();
    msgs.current.show([
      {
        severity: "error",
        summary: "Lỗi",
        detail: error.response?.data?.detail || error.message,
        sticky: true,
      },
    ]);
  }
};

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
        <h2 className="form-title">Thêm thời khoá biểu</h2>
        <Messages ref={msgs} />
        <div className="form-row">
          <Dropdown value={selectedClass} options={classes} optionLabel="ma_lop" onChange={(e) => setSelectedClass(e.value)} placeholder="Chọn lớp" />
          <Dropdown value={namHoc} options={academicYears} onChange={(e) => setNamHoc(e.value)} placeholder="Chọn năm học" />
          <Dropdown value={hocKy} options={hocKyOptions} onChange={(e) => setHocKy(e.value)} placeholder="Chọn học kỳ" />
        </div>
        <div className="form-row">
        <Dropdown
            value={hinhThuc}
            options={[
              { label: "Trực tuyến", value: "truc_tuyen" },
              { label: "Trực tiếp", value: "truc_tiep" },
            ]}
            onChange={(e) => setHinhThuc(e.value)}
            placeholder="Hình thức học"
          />
          {hinhThuc === "truc_tiep" && (
            <Dropdown
              value={selectedRoom}
              options={rooms}
              onChange={(e) => setSelectedRoom(e.value)}
              placeholder="Chọn phòng học"
              optionLabel="room_number"
              itemTemplate={(room) => {
                if (!room) return "";
                return selectedClass?.facility_id === 47
                  ? `${room.room_number} / ${room.building}`
                  : room.room_number;
              }}
            />
          )}
        </div>

        <div className="form-row">
          <Dropdown value={selectedSubject} options={subjects} optionLabel="name" onChange={(e) => setSelectedSubject(e.value)} placeholder="Chọn môn" filter  showClear/>
          <Dropdown value={selectedTeacher} options={teachers} optionLabel="name" onChange={(e) => setSelectedTeacher(e.value)} placeholder="Chọn giảng viên" filter showClear />
          
          <Button label="Thêm môn" onClick={handleAddSubject} />
        </div>

        <div className="subject-buttons-wrapper">
          {addedSubjects.map((s) => (
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

        <Paginator
          first={currentPage}
          rows={1}
          totalRecords={weekList.length}
          onPageChange={(e) => setCurrentPage(e.first)}
          template="PrevPageLink CurrentPageReport NextPageLink"
          currentPageReportTemplate={currentLabel}
        />

        <Button label="Lưu thời khóa biểu" onClick={handleSubmit} className="p-button-success mt-3" />
      </div>
      <AdminFooter />
    </>
  );
};

export default AddSchedulePage;
