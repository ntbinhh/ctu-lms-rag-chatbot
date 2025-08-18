import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Chip } from "primereact/chip";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import "./AddSchedulePage_Modern.css";

const days = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "CN"];
const periods = ["Sáng", "Chiều", "Tối"];
const hocKyOptions = [
  { label: "Học kỳ 1", value: "HK1" },
  { label: "Học kỳ 2", value: "HK2" },
  { label: "Học kỳ 3", value: "HK3" }
];

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
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
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

  // Helper function để kiểm tra xung đột lịch học
  const checkScheduleConflicts = async (week, day, period, subjectForPlacement, hinhThuc, selectedRoom, currentScheduleItems) => {
    const conflicts = [];
    
    // Kiểm tra trùng lịch giảng viên
    const teacherConflict = currentScheduleItems.find(
      (item) => 
        item.week === week && 
        item.day === day && 
        item.period === period &&
        item.teacher_id === subjectForPlacement.teacher.user_id
    );

    if (teacherConflict) {
      conflicts.push(`Giảng viên ${subjectForPlacement.teacher.name} đã có lịch dạy môn "${teacherConflict.subject_name}" vào thời gian này`);
    }

    // Kiểm tra trùng phòng học (chỉ khi học trực tiếp)
    if (hinhThuc === "truc_tiep" && selectedRoom) {
      const roomConflict = currentScheduleItems.find(
        (item) => 
          item.week === week && 
          item.day === day && 
          item.period === period &&
          item.room_id === selectedRoom.id &&
          item.hinh_thuc === "truc_tiep"
      );

      if (roomConflict) {
        conflicts.push(`Phòng ${selectedRoom.room_number} đã được sử dụng cho môn "${roomConflict.subject_name}" vào thời gian này`);
      }
    }

    // Kiểm tra trùng lịch lớp học (một lớp không thể có 2 môn cùng lúc)
    const classConflict = currentScheduleItems.find(
      (item) => 
        item.week === week && 
        item.day === day && 
        item.period === period
    );

    if (classConflict) {
      conflicts.push(`Lớp đã có lịch học môn "${classConflict.subject_name}" vào thời gian này`);
    }

    return conflicts;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [classesRes, teachersRes] = await Promise.all([
          axios.get("http://localhost:8000/admin/classes", { headers }),
          axios.get("http://localhost:8000/admin/users/teachers/list", { headers })
        ]);
        
        setClasses(classesRes.data);
        setTeachers(teachersRes.data);
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải dữ liệu ban đầu',
          life: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
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
        .then((res) => setRooms(res.data))
        .catch(() => {
          toast.current?.show({
            severity: 'warn',
            summary: 'Cảnh báo',
            detail: 'Không thể tải danh sách phòng',
            life: 3000
          });
        });
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
      })
      .catch(() => {
        toast.current?.show({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Không thể tải danh sách môn học',
          life: 3000
        });
      });
  }, [selectedClass]);

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
      })
      .catch(() => {
        toast.current?.show({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Không thể tải danh sách tuần học',
          life: 3000
        });
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
        if (Array.isArray(res.data)) {
          const enriched = res.data.map((item) => ({
            ...item,
            subject_id: item.subject_id || item.subject?.code || "",
            teacher_id: item.teacher_id || item.teacher_profile?.user_id || null,
            teacher_name: item.teacher_profile?.name || "",
            subject_name: item.subject?.name || "",
          }));
          setScheduleItems(enriched);
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: 'Không thể tải thời khóa biểu hiện tại',
          life: 3000
        });
      });
  }, [selectedClass, hocKy, namHoc]);

  const handleAddSubject = () => {
    if (!selectedSubject || !selectedTeacher) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng chọn môn học và giảng viên',
        life: 3000
      });
      return;
    }
    
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
      toast.current?.show({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã thêm môn học vào danh sách',
        life: 3000
      });
    } else {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Môn học với giảng viên này đã tồn tại',
        life: 3000
      });
    }
    
    setSelectedSubject(null);
    setSelectedTeacher(null);
  };

  const handleToggleCell = async (day, period) => {
    const week = weekList[currentPage]?.week;
    
    // Kiểm tra tuần học có hợp lệ không
    if (!week) {
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể xác định tuần học hiện tại',
        life: 3000
      });
      return;
    }

    if (!selectedSubjectForPlacement) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng chọn môn học để đặt lịch từ danh sách "Môn học đã thêm"',
        life: 3000
      });
      return;
    }

    // Kiểm tra phòng học bắt buộc khi học trực tiếp
    if (hinhThuc === "truc_tiep" && !selectedRoom) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng chọn phòng học cho lịch học trực tiếp',
        life: 3000
      });
      return;
    }
    
    const index = scheduleItems.findIndex(
      (item) => item.week === week && item.day === day && item.period === period
    );

    if (index !== -1) {
      const itemToRemove = scheduleItems[index];
      
      // Nếu đang chọn cùng môn học và giảng viên, cho phép xóa
      if (itemToRemove.subject_id === selectedSubjectForPlacement.code && 
          itemToRemove.teacher_id === selectedSubjectForPlacement.teacher.user_id) {
        
        confirmDialog({
          message: `Bạn có muốn xóa lịch học này?\n${itemToRemove.subject_name} - ${itemToRemove.teacher_name}\nTuần ${week}, ${day}, ${period}`,
          header: 'Xác nhận xóa lịch',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Xóa',
          rejectLabel: 'Hủy',
          accept: async () => {
            if (itemToRemove.id) {
              try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.delete(`http://localhost:8000/admin/schedules/${itemToRemove.id}`, { headers });
                
                toast.current?.show({
                  severity: "success",
                  summary: "Đã xóa",
                  detail: `Xóa lịch: ${itemToRemove.subject_name} - Tuần ${itemToRemove.week}, ${itemToRemove.day}, ${itemToRemove.period}`,
                  life: 3000,
                });
              } catch (err) {
                toast.current?.show({
                  severity: "error",
                  summary: "Lỗi xóa lịch",
                  detail: err.response?.data?.detail || err.message,
                  life: 5000,
                });
                return;
              }
            }
            
            const updated = [...scheduleItems];
            updated.splice(index, 1);
            setScheduleItems(updated);
          }
        });
      } else {
        // Nếu khác môn học/giảng viên, cho phép thay thế
        confirmDialog({
          message: `Ô này đã có lịch học:\n${itemToRemove.subject_name} - ${itemToRemove.teacher_name}\n\nBạn có muốn thay thế bằng:\n${selectedSubjectForPlacement.name} - ${selectedSubjectForPlacement.teacher.name}?`,
          header: 'Thay thế lịch học',
          icon: 'pi pi-question-circle',
          acceptLabel: 'Thay thế',
          rejectLabel: 'Hủy',
          accept: async () => {
            // Xóa lịch cũ nếu có ID
            if (itemToRemove.id) {
              try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.delete(`http://localhost:8000/admin/schedules/${itemToRemove.id}`, { headers });
              } catch (err) {
                toast.current?.show({
                  severity: "error",
                  summary: "Lỗi xóa lịch cũ",
                  detail: err.response?.data?.detail || err.message,
                  life: 5000,
                });
                return;
              }
            }
            
            // Kiểm tra xung đột trước khi thay thế
            const conflicts = await checkScheduleConflicts(week, day, period, selectedSubjectForPlacement, hinhThuc, selectedRoom, scheduleItems.filter((_, i) => i !== index));
            
            if (conflicts.length > 0) {
              toast.current?.show({
                severity: 'error',
                summary: 'Không thể thay thế',
                detail: conflicts.join('\n'),
                life: 5000
              });
              return;
            }
            
            // Thay thế lịch
            const updated = [...scheduleItems];
            updated[index] = {
              week,
              day,
              period,
              subject_id: selectedSubjectForPlacement.code,
              subject_name: selectedSubjectForPlacement.name,
              teacher_id: selectedSubjectForPlacement.teacher.user_id,
              teacher_name: selectedSubjectForPlacement.teacher.name,
              hinh_thuc: hinhThuc,
              room_id: hinhThuc === "truc_tiep" ? selectedRoom?.id : null,
            };
            setScheduleItems(updated);
            
            toast.current?.show({
              severity: 'success',
              summary: 'Thành công',
              detail: `Đã thay thế lịch: ${selectedSubjectForPlacement.name}`,
              life: 3000
            });
          }
        });
      }
    } else {
      // Thêm lịch mới - kiểm tra xung đột chi tiết
      const conflicts = await checkScheduleConflicts(week, day, period, selectedSubjectForPlacement, hinhThuc, selectedRoom, scheduleItems);
      
      if (conflicts.length > 0) {
        // Hiển thị thông báo lỗi chi tiết
        const conflictMessage = conflicts.length === 1 
          ? conflicts[0]
          : `Có ${conflicts.length} xung đột:\n${conflicts.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
          
        toast.current?.show({
          severity: 'error',
          summary: 'Xung đột lịch học',
          detail: conflictMessage,
          life: 6000
        });
        return;
      }

      // Kiểm tra thêm: Không cho phép trùng môn học trong cùng tuần
      const duplicateSubject = scheduleItems.find(
        (item) => 
          item.week === week && 
          item.subject_id === selectedSubjectForPlacement.code &&
          item.teacher_id === selectedSubjectForPlacement.teacher.user_id
      );

      if (duplicateSubject) {
        confirmDialog({
          message: `Môn học "${selectedSubjectForPlacement.name}" với giảng viên "${selectedSubjectForPlacement.teacher.name}" đã có lịch trong tuần này:\n- ${duplicateSubject.day}, ${duplicateSubject.period}\n\nBạn có chắc chắn muốn thêm lịch học khác cho cùng môn này?`,
          header: 'Cảnh báo trùng môn học',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Tiếp tục thêm',
          rejectLabel: 'Hủy',
          accept: () => {
            addNewScheduleItem(week, day, period);
          }
        });
      } else {
        addNewScheduleItem(week, day, period);
      }
    }
  };

  // Helper function để thêm lịch học mới
  const addNewScheduleItem = (week, day, period) => {
    const newItem = {
      week,
      day,
      period,
      subject_id: selectedSubjectForPlacement.code,
      subject_name: selectedSubjectForPlacement.name,
      teacher_id: selectedSubjectForPlacement.teacher.user_id, // Lưu user_id vào teacher_id field
      teacher_name: selectedSubjectForPlacement.teacher.name,
      hinh_thuc: hinhThuc,
      room_id: hinhThuc === "truc_tiep" ? selectedRoom?.id : null,
    };

    setScheduleItems([...scheduleItems, newItem]);
    
    toast.current?.show({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã thêm lịch: ${selectedSubjectForPlacement.name} - ${day}, ${period}`,
      life: 3000
    });
  };

  // Helper function để xóa lịch học
  const handleDeleteSchedule = (itemToDelete, week, day, period) => {
    confirmDialog({
      message: `Bạn có chắc chắn muốn xóa lịch học này?\n${itemToDelete.subject_name} - ${itemToDelete.teacher_name}\nTuần ${week}, ${day}, ${period}`,
      header: 'Xác nhận xóa lịch',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        // Xóa lịch từ server nếu có ID
        if (itemToDelete.id) {
          try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`http://localhost:8000/admin/schedules/${itemToDelete.id}`, { headers });
            
            toast.current?.show({
              severity: "success",
              summary: "Đã xóa",
              detail: `Xóa lịch: ${itemToDelete.subject_name} - Tuần ${week}, ${day}, ${period}`,
              life: 3000,
            });
          } catch (err) {
            toast.current?.show({
              severity: "error",
              summary: "Lỗi xóa lịch",
              detail: err.response?.data?.detail || err.message,
              life: 5000,
            });
            return;
          }
        }
        
        // Xóa lịch khỏi state
        const updatedItems = scheduleItems.filter(item => 
          !(item.week === week && item.day === day && item.period === period)
        );
        setScheduleItems(updatedItems);
      }
    });
  };

  const handleSubmit = async () => {
    if (!selectedClass || !hocKy || !namHoc || scheduleItems.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng điền đầy đủ thông tin và thêm ít nhất một lịch học',
        life: 3000
      });
      return;
    }

    // Validation bổ sung: Kiểm tra phòng học bắt buộc
    const invalidItems = scheduleItems.filter(item => 
      item.hinh_thuc === "truc_tiep" && !item.room_id
    );

    if (invalidItems.length > 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi validation',
        detail: 'Có lịch học trực tiếp chưa chọn phòng học',
        life: 5000
      });
      return;
    }

    // Kiểm tra trùng lịch toàn bộ trước khi submit
    const conflicts = [];
    for (let i = 0; i < scheduleItems.length; i++) {
      for (let j = i + 1; j < scheduleItems.length; j++) {
        const item1 = scheduleItems[i];
        const item2 = scheduleItems[j];
        
        if (item1.week === item2.week && 
            item1.day === item2.day && 
            item1.period === item2.period) {
          
          // Trùng giảng viên
          if (item1.teacher_id === item2.teacher_id) {
            conflicts.push(`Giảng viên trùng lịch: Tuần ${item1.week}, ${item1.day}, ${item1.period}`);
          }
          
          // Trùng phòng học (chỉ khi cả hai đều trực tiếp)
          if (item1.hinh_thuc === "truc_tiep" && 
              item2.hinh_thuc === "truc_tiep" && 
              item1.room_id === item2.room_id) {
            conflicts.push(`Phòng học trùng lịch: Tuần ${item1.week}, ${item1.day}, ${item1.period}`);
          }
        }
      }
    }

    if (conflicts.length > 0) {
      toast.current?.show({
        severity: 'error',
        summary: 'Xung đột lịch học',
        detail: conflicts.slice(0, 3).join('\n') + (conflicts.length > 3 ? '\n...' : ''),
        life: 7000
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const data = {
      class_id: selectedClass.id,
      hoc_ky: hocKy,
      nam_hoc: namHoc,
      schedule_items: scheduleItems.map(
        ({ week, day, period, subject_id, teacher_id, hinh_thuc, room_id }) => ({
          week,
          day,
          period,
          subject_id,
          teacher_id,
          hinh_thuc,
          room_id,
        })
      )
    };

    try {
      const res = await axios.post("http://localhost:8000/admin/schedules", data, { headers });
      const { message, skipped } = res.data;
      
      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: message,
        life: 5000,
      });
      
      if (skipped && skipped.length > 0) {
        skipped.forEach((item) => {
          toast.current?.show({
            severity: "warn",
            summary: "Trùng lịch",
            detail: `Tuần ${item.week}, ${item.day}, ${item.period}`,
            life: 5000,
          });
        });
      }

      // Reset form sau khi submit thành công
      setScheduleItems([]);
      setSelectedSubjectForPlacement(null);
      setHinhThuc("truc_tiep");
      setSelectedRoom(null);
      
    } catch (error) {
      const detail = error.response?.data?.detail;
      const detailMessage = Array.isArray(detail)
        ? detail.map((e) => `${e.loc?.join('.')} → ${e.msg}`).join('\n')
        : typeof detail === 'object'
        ? JSON.stringify(detail)
        : detail || error.message;

      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: detailMessage,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const currentLabel = weekList[currentPage]
    ? `Tuần ${weekList[currentPage].hoc_ky_week} (${formatDate(weekList[currentPage].start_date)} – ${formatDate(weekList[currentPage].end_date)})`
    : "";

  const weekDates = weekList[currentPage]?.start_date
    ? getWeekDates(weekList[currentPage].start_date)
    : [];

  if (loading && classes.length === 0) {
    return (
      <>
        <AdminHeader />
        <div className="schedule-container">
          <div className="loading-overlay">
            <ProgressSpinner />
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
        <AdminFooter />
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="schedule-container">
        <div className="schedule-content">
          <Card className="main-card">
            <div className="schedule-card-header">
              <h1 className="schedule-page-title">
                <i className="pi pi-calendar-plus"></i>
                Thêm Thời Khóa Biểu
              </h1>
              <p className="schedule-page-subtitle">Tạo và quản lý lịch học cho các lớp</p>
            </div>

            <Divider />

            {/* Basic Information Section */}
            <Panel header="Thông tin cơ bản" className="info-panel" toggleable>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="class-select">Lớp học</label>
                  <Dropdown
                    id="class-select"
                    value={selectedClass}
                    options={classes}
                    optionLabel="ma_lop"
                    onChange={(e) => setSelectedClass(e.value)}
                    placeholder="Chọn lớp học"
                    filter
                    showClear
                    className="w-full"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="year-select">Năm học</label>
                  <Dropdown
                    id="year-select"
                    value={namHoc}
                    options={academicYears}
                    onChange={(e) => setNamHoc(e.value)}
                    placeholder="Chọn năm học"
                    className="w-full"
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="semester-select">Học kỳ</label>
                  <Dropdown
                    id="semester-select"
                    value={hocKy}
                    options={hocKyOptions}
                    onChange={(e) => setHocKy(e.value)}
                    placeholder="Chọn học kỳ"
                    className="w-full"
                  />
                </div>
              </div>
            </Panel>

            {/* Learning Format Section */}
            <Panel header="Hình thức học" className="format-panel" toggleable>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="format-select">Hình thức</label>
                  <Dropdown
                    id="format-select"
                    value={hinhThuc}
                    options={[
                      { label: "Trực tuyến", value: "truc_tuyen" },
                      { label: "Trực tiếp", value: "truc_tiep" },
                    ]}
                    onChange={(e) => setHinhThuc(e.value)}
                    placeholder="Chọn hình thức học"
                    className="w-full"
                  />
                </div>
                
                {hinhThuc === "truc_tiep" && (
                  <div className="form-field">
                    <label htmlFor="room-select">Phòng học</label>
                    <Dropdown
                      id="room-select"
                      value={selectedRoom}
                      options={rooms}
                      onChange={(e) => setSelectedRoom(e.value)}
                      placeholder="Chọn phòng học"
                      optionLabel="room_number"
                      filter
                      showClear
                      className="w-full"
                      itemTemplate={(room) => {
                        if (!room) return "";
                        return selectedClass?.facility_id === 47
                          ? `${room.room_number} / ${room.building}`
                          : room.room_number;
                      }}
                    />
                  </div>
                )}
              </div>
            </Panel>

            {/* Add Subjects Section */}
            <Panel header="Thêm môn học" className="subjects-panel" toggleable>
              <div className="add-subject-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="subject-select">Môn học</label>
                    <Dropdown
                      id="subject-select"
                      value={selectedSubject}
                      options={subjects}
                      optionLabel="name"
                      onChange={(e) => setSelectedSubject(e.value)}
                      placeholder="Chọn môn học"
                      filter
                      showClear
                      className="w-full"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="teacher-select">Giảng viên</label>
                    <Dropdown
                      id="teacher-select"
                      value={selectedTeacher}
                      options={teachers}
                      optionLabel="name"
                      onChange={(e) => setSelectedTeacher(e.value)}
                      placeholder="Chọn giảng viên"
                      filter
                      showClear
                      className="w-full"
                    />
                  </div>
                  
                  <div className="form-field add-button-field">
                    <Button
                      label="Thêm môn"
                      icon="pi pi-plus"
                      onClick={handleAddSubject}
                      className="p-button-success"
                      disabled={!selectedSubject || !selectedTeacher}
                    />
                  </div>
                </div>
                
                {/* Added Subjects List */}
                {addedSubjects.length > 0 && (
                  <>
                    <Divider />
                    <div className="added-subjects">
                      <h4>Môn học đã thêm</h4>
                      <div className="subject-chips">
                        {addedSubjects.map((s, index) => (
                          <div key={`${s.code}-${s.teacher.id}`} className="subject-item">
                            <Button
                              label={`${s.name} - ${s.teacher.name}`}
                              icon={selectedSubjectForPlacement?.code === s.code &&
                                    selectedSubjectForPlacement?.teacher.id === s.teacher.id 
                                    ? "pi pi-check" : "pi pi-calendar-plus"}
                              className={`subject-button ${
                                selectedSubjectForPlacement?.code === s.code &&
                                selectedSubjectForPlacement?.teacher.id === s.teacher.id
                                  ? "p-button-info"
                                  : "p-button-outlined"
                              }`}
                              onClick={() => setSelectedSubjectForPlacement(s)}
                              tooltip="Click để chọn môn này để đặt lịch"
                              tooltipOptions={{ position: 'top' }}
                            />
                            <Badge 
                              value={s.code} 
                              severity="secondary" 
                              className="subject-code-badge"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Panel>

            {/* Schedule Grid Section */}
            {weekList.length > 0 && (
              <Panel header="Lịch học" className="schedule-panel" toggleable collapsed={false}>
                <div className="week-navigation">
                  <div className="week-info">
                    <h3 className="current-week">
                      <i className="pi pi-calendar"></i>
                      {currentLabel}
                    </h3>
                  </div>
                  
                  <Dropdown
                    value={currentPage}
                    options={weekList.map((w, i) => ({ 
                      label: `Tuần ${w.hoc_ky_week}`, 
                      value: i 
                    }))}
                    onChange={(e) => setCurrentPage(e.value)}
                    placeholder="Chọn tuần"
                    className="week-selector"
                  />
                </div>

                <div className="schedule-grid">
                  <div className="timetable-container">
                    <table className="modern-timetable">
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
                              
                              // Kiểm tra xung đột potential khi hover
                              const hasConflict = selectedSubjectForPlacement && !entry && 
                                scheduleItems.some(item => 
                                  item.week === weekList[currentPage]?.week && 
                                  item.day === day && 
                                  item.period === period &&
                                  (item.teacher_id === selectedSubjectForPlacement.teacher.user_id ||
                                   (hinhThuc === "truc_tiep" && selectedRoom && 
                                    item.room_id === selectedRoom.id && item.hinh_thuc === "truc_tiep"))
                                );
                              
                              // Kiểm tra xem có phải cùng môn/giảng viên đang chọn không
                              const isSameSubject = entry && selectedSubjectForPlacement &&
                                entry.subject_id === selectedSubjectForPlacement.code &&
                                entry.teacher_id === selectedSubjectForPlacement.teacher.user_id;
                              
                              return (
                                <td
                                  key={day + period}
                                  onClick={() => handleToggleCell(day, period)}
                                  className={`schedule-cell ${
                                    entry ? "occupied" : "empty"
                                  } ${
                                    selectedSubjectForPlacement ? "clickable" : ""
                                  } ${
                                    hasConflict ? "has-conflict" : ""
                                  } ${
                                    isSameSubject ? "same-subject" : ""
                                  }`}
                                  data-tooltip-id={`cell-${day}-${period}`}
                                  title={
                                    hasConflict 
                                      ? "Có xung đột lịch học - Click để xem chi tiết"
                                      : entry && selectedSubjectForPlacement
                                      ? isSameSubject 
                                        ? "Click để xóa lịch này"
                                        : "Click để thay thế lịch học"
                                      : selectedSubjectForPlacement
                                      ? `Click để thêm: ${selectedSubjectForPlacement.name}`
                                      : ""
                                  }
                                >
                                  {entry && (
                                    <div className="cell-content">
                                      <button 
                                        className="delete-schedule-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSchedule(entry, weekList[currentPage]?.week, day, period);
                                        }}
                                        title="Xóa lịch học này"
                                      >
                                        <i className="pi pi-times"></i>
                                      </button>
                                      <Tag
                                        value={entry.subject_name || entry.subject?.name || entry.subject_id}
                                        severity={isSameSubject ? "warning" : "info"}
                                        className="subject-tag"
                                      />
                                      <Tag
                                        value={entry.teacher_profile?.name || entry.teacher_name}
                                        severity={isSameSubject ? "warning" : "success"}
                                        className="teacher-tag"
                                      />
                                      {entry.room_id && (
                                        <Chip 
                                          label={`Phòng ${entry.room_id}`} 
                                          className="room-chip"
                                        />
                                      )}
                                      {entry.hinh_thuc && (
                                        <small className="format-indicator">
                                          {entry.hinh_thuc === "truc_tiep" ? "🏫" : "💻"}
                                        </small>
                                      )}
                                    </div>
                                  )}
                                  
                                  {!entry && selectedSubjectForPlacement && (
                                    <div className={`add-hint ${hasConflict ? "conflict-warning" : ""}`}>
                                      <i className={hasConflict ? "pi pi-exclamation-triangle" : "pi pi-plus"}></i>
                                      <span>{hasConflict ? "Có xung đột" : "Thêm lịch"}</span>
                                      {hasConflict && (
                                        <small>Click để xem chi tiết</small>
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
                  </div>
                </div>

                <div className="schedule-pagination">
                  <Paginator
                    first={currentPage}
                    rows={1}
                    totalRecords={weekList.length}
                    onPageChange={(e) => setCurrentPage(e.first)}
                    template="PrevPageLink CurrentPageReport NextPageLink"
                    currentPageReportTemplate={currentLabel}
                  />
                </div>
              </Panel>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <Button
                label="Lưu thời khóa biểu"
                icon="pi pi-save"
                onClick={handleSubmit}
                className="p-button-success save-button"
                loading={loading}
                disabled={!selectedClass || !hocKy || !namHoc || scheduleItems.length === 0}
              />
              
              <Button
                label="Hủy bỏ"
                icon="pi pi-times"
                onClick={() => {
                  setScheduleItems([]);
                  setAddedSubjects([]);
                  setSelectedSubjectForPlacement(null);
                }}
                className="p-button-secondary cancel-button"
                outlined
              />
            </div>
          </Card>
        </div>
      </div>
      
      <AdminFooter />
    </>
  );
};

export default AddSchedulePage;
