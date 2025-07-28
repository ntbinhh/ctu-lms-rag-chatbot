import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { Toolbar } from "primereact/toolbar";
import { RadioButton } from "primereact/radiobutton";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import AdminHeader from "../components/AdminHeader";
import { Calendar } from "primereact/calendar";
import "./AddStudentForm.css";

const AddStudentForm = () => {
  const [classId, setClassId] = useState(null);
  const [classCode, setClassCode] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectMode, setSelectMode] = useState("paste");
  const [newStudent, setNewStudent] = useState({ 
    name: "", 
    dob: null, 
    gender: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const genderOptions = [
    { label: "Nam", value: "Nam" },
    { label: "Nữ", value: "Nữ" },
    { label: "Khác", value: "Khác" }
  ];

  // Lấy danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const classOptions = res.data.map((c) => ({ 
          label: `${c.ma_lop} - ${c.ten_lop || 'Không có tên'}`, 
          value: c.id, 
          code: c.ma_lop,
          name: c.ten_lop,
          studentCount: c.student_count || 0
        }));
        setClasses(classOptions);
      } catch (err) {
        console.error("Không thể tải danh sách lớp.");
        showToast("error", "Lỗi", "Không thể tải danh sách lớp.");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Utility function for showing toast messages
  const showToast = (severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 4000,
    });
  };

  const handleClassChange = (e) => {
    setClassId(e.value);
    const selectedClass = classes.find((c) => c.value === e.value);
    setClassCode(selectedClass?.code || "");
    // Clear students when changing class
    setStudents([]);
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text");
    const rows = pastedData.split("\n").map((row) => row.trim());
    const parsedStudents = rows
      .filter((row) => row) // Loại bỏ các dòng trống
      .map((row, index) => {
        const [name, dob, gender, email, phone] = row.split("\t"); // Tách dữ liệu bằng tab
        return {
          id: `temp_${index}`, // Temporary ID for DataTable
          name: name?.trim() || "",
          dob: dob?.trim()
            ? new Date(dob.trim().split("/").reverse().join("-"))
            : null,
          gender: gender?.trim() || "",
          email: email?.trim() || "",
          phone: phone?.trim() || "",
        };
      });
    setStudents(parsedStudents);
    showToast("info", "Đã dán dữ liệu", `Đã thêm ${parsedStudents.length} học viên từ clipboard`);
  };

  const handleAddStudent = () => {
    if (!newStudent.name?.trim()) {
      showToast("warn", "Thiếu thông tin", "Vui lòng nhập họ tên học viên");
      return;
    }

    const updatedStudents = [...students];
    updatedStudents.push({
      id: `temp_${Date.now()}`, // Temporary ID
      name: newStudent.name.trim(),
      dob: newStudent.dob,
      gender: newStudent.gender,
      email: newStudent.email?.trim() || "",
      phone: newStudent.phone?.trim() || "",
    });
    setStudents(updatedStudents);
    setNewStudent({ 
      name: "", 
      dob: null, 
      gender: "",
      email: "",
      phone: ""
    });
    showToast("success", "Đã thêm", "Thêm học viên vào danh sách thành công");
  };

  const removeStudent = (index) => {
    const updatedStudents = [...students];
    updatedStudents.splice(index, 1);
    setStudents(updatedStudents);
    showToast("info", "Đã xóa", "Xóa học viên khỏi danh sách");
  };

  const handleSubmit = async () => {
    if (!classId) {
      showToast("warn", "Thiếu thông tin", "Vui lòng chọn lớp học");
      return;
    }

    if (students.length === 0) {
      showToast("warn", "Thiếu thông tin", "Vui lòng thêm ít nhất một học viên");
      return;
    }

    const payload = {
      class_id: classId,
      students: students.map((student) => ({
        name: student.name,
        dob: student.dob?.toISOString().split("T")[0] || null,
        gender: student.gender || null,
        email: student.email || null,
        phone: student.phone || null,
      })),
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8000/admin/students", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.duplicates && res.data.duplicates.length > 0) {
        showToast("warn", "Trùng học viên", 
          `Các học viên sau đã tồn tại: ${res.data.duplicates.join(", ")}`);
      } else {
        showToast("success", "Thành công", 
          `Đã thêm ${students.length} học viên thành công!`);
        // Clear form after successful submission
        setStudents([]);
        setClassId(null);
        setClassCode("");
      }
    } catch (error) {
      console.error("Lỗi:", error.response?.data);
      const errorMessage = error.response?.data?.detail || "Thêm học viên thất bại";
      showToast("error", "Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Template functions for DataTable
  const nameBodyTemplate = (rowData) => {
    return (
      <div className="student-name-cell">
        <Avatar
          label={rowData.name?.charAt(0) || '?'}
          className="student-avatar"
          style={{ backgroundColor: '#0c4da2', color: 'white' }}
        />
        <div className="student-info">
          <div className="student-name">{rowData.name || 'Chưa có tên'}</div>
          {rowData.email && <div className="student-email">{rowData.email}</div>}
        </div>
      </div>
    );
  };

  const dobBodyTemplate = (rowData) => {
    if (!rowData.dob) return <span className="text-muted">Chưa có</span>;
    
    const birthDate = new Date(rowData.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    return (
      <div className="dob-cell">
        <div>{birthDate.toLocaleDateString("vi-VN")}</div>
        <small className="text-muted">({age} tuổi)</small>
      </div>
    );
  };

  const genderBodyTemplate = (rowData) => {
    const getSeverity = (gender) => {
      switch (gender) {
        case 'Nam': return 'info';
        case 'Nữ': return 'warning';
        default: return 'secondary';
      }
    };

    return (
      <Tag
        value={rowData.gender || 'Chưa xác định'}
        severity={getSeverity(rowData.gender)}
        icon={rowData.gender === 'Nam' ? 'pi pi-mars' : rowData.gender === 'Nữ' ? 'pi pi-venus' : 'pi pi-question'}
      />
    );
  };

  const actionBodyTemplate = (rowData, { rowIndex }) => {
    return (
      <div className="action-buttons">
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger"
          onClick={() => removeStudent(rowIndex)}
          tooltip="Xóa khỏi danh sách"
        />
      </div>
    );
  };

  const selectedClass = classes.find((c) => c.value === classId);

  return (
    <div className="add-student-container">
      <AdminHeader />
      <Toast ref={toast} />
      
      <Card className="add-student-card">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="pi pi-user-plus"></i>
              Thêm học viên
            </h1>
            <p className="page-subtitle">Thêm học viên mới vào lớp học</p>
          </div>
        </div>

        <div className="class-selector-section">
          <div className="selector-wrapper">
            <label className="selector-label">
              <i className="pi pi-graduation-cap"></i>
              Chọn lớp học
            </label>
            <Dropdown
              value={classId}
              options={classes}
              onChange={handleClassChange}
              placeholder="Chọn lớp để thêm học viên"
              className="class-dropdown"
              filter
              filterPlaceholder="Tìm lớp..."
              emptyMessage="Không tìm thấy lớp nào"
              loading={loading}
            />
          </div>
          
          {selectedClass && (
            <div className="class-info">
              <div className="info-item">
                <span className="info-label">Mã lớp:</span>
                <Badge value={selectedClass.code} className="info-badge" />
              </div>
              <div className="info-item">
                <span className="info-label">Tên lớp:</span>
                <span className="info-value">{selectedClass.name || 'Chưa có tên'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Học viên hiện tại:</span>
                <Badge value={selectedClass.studentCount} severity="info" className="info-badge" />
              </div>
            </div>
          )}
        </div>

        {classId && (
          <>
            <Divider />
            
            <div className="input-method-section">
              <h3 className="section-title">
                <i className="pi pi-cog"></i>
                Phương thức nhập liệu
              </h3>
              
              <div className="method-selector">
                <div className="method-option">
                  <RadioButton
                    inputId="paste"
                    value="paste"
                    checked={selectMode === "paste"}
                    onChange={() => setSelectMode("paste")}
                  />
                  <label htmlFor="paste" className="method-label">
                    <i className="pi pi-file-excel"></i>
                    Dán từ Excel
                  </label>
                </div>
                <div className="method-option">
                  <RadioButton
                    inputId="manual"
                    value="manual"
                    checked={selectMode === "manual"}
                    onChange={() => setSelectMode("manual")}
                  />
                  <label htmlFor="manual" className="method-label">
                    <i className="pi pi-user-plus"></i>
                    Nhập thủ công
                  </label>
                </div>
              </div>
            </div>

            {selectMode === "paste" && (
              <Panel header="Dán dữ liệu từ Excel" className="input-panel">
                <div className="paste-instructions">
                  <p>
                    <i className="pi pi-info-circle"></i>
                    Copy dữ liệu từ Excel theo thứ tự: <strong>Họ tên | Ngày sinh | Giới tính | Email | Số điện thoại</strong>
                  </p>
                </div>
                <div
                  onPaste={handlePaste}
                  className="paste-area"
                  tabIndex={0}
                >
                  <i className="pi pi-file-excel" style={{ fontSize: '2rem', color: '#28a745' }}></i>
                  <p>Nhấn vào đây và dán dữ liệu từ Excel</p>
                  <small>Hỗ trợ định dạng: Tab-separated values</small>
                </div>
              </Panel>
            )}

            {selectMode === "manual" && (
              <Panel header="Nhập thông tin học viên" className="input-panel">
                <div className="manual-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label>Họ và tên *</label>
                      <InputText
                        placeholder="Nhập họ và tên"
                        value={newStudent.name}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Ngày sinh</label>
                      <Calendar
                        placeholder="Chọn ngày sinh"
                        value={newStudent.dob}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, dob: e.value })
                        }
                        dateFormat="dd/mm/yy"
                        showIcon
                        maxDate={new Date()}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Giới tính</label>
                      <Dropdown
                        value={newStudent.gender}
                        options={genderOptions}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, gender: e.target.value })
                        }
                        placeholder="Chọn giới tính"
                      />
                    </div>
                    <div className="form-field">
                      <label>Email</label>
                      <InputText
                        placeholder="Nhập email"
                        value={newStudent.email}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, email: e.target.value })
                        }
                        type="email"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label>Số điện thoại</label>
                      <InputText
                        placeholder="Nhập số điện thoại"
                        value={newStudent.phone}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>&nbsp;</label>
                      <Button
                        label="Thêm vào danh sách"
                        icon="pi pi-plus"
                        className="p-button-success"
                        onClick={handleAddStudent}
                        disabled={!newStudent.name?.trim()}
                      />
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {students.length > 0 && (
              <>
                <Toolbar
                  className="student-toolbar"
                  start={
                    <div className="toolbar-start">
                      <h4>
                        <i className="pi pi-list"></i>
                        Danh sách học viên ({students.length})
                      </h4>
                    </div>
                  }
                  end={
                    <div className="toolbar-end">
                      <Button
                        label="Xóa tất cả"
                        icon="pi pi-trash"
                        className="p-button-danger p-button-outlined"
                        onClick={() => setStudents([])}
                      />
                    </div>
                  }
                />

                <DataTable
                  value={students}
                  className="student-datatable"
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  responsiveLayout="scroll"
                  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} học viên"
                >
                  <Column 
                    header="STT" 
                    body={(_, { rowIndex }) => rowIndex + 1}
                    style={{ width: '60px', textAlign: 'center' }}
                  />
                  <Column 
                    field="name" 
                    header="Thông tin" 
                    body={nameBodyTemplate}
                    style={{ minWidth: '250px' }}
                  />
                  <Column 
                    field="dob" 
                    header="Ngày sinh" 
                    body={dobBodyTemplate}
                    style={{ minWidth: '120px' }}
                  />
                  <Column 
                    field="gender" 
                    header="Giới tính" 
                    body={genderBodyTemplate}
                    style={{ minWidth: '100px' }}
                  />
                  <Column 
                    field="phone" 
                    header="Điện thoại" 
                    style={{ minWidth: '120px' }}
                  />
                  <Column
                    header="Hành động"
                    body={actionBodyTemplate}
                    style={{ width: '100px', textAlign: 'center' }}
                  />
                </DataTable>

                <div className="submit-section">
                  <Button
                    label={`Lưu ${students.length} học viên`}
                    icon="pi pi-save"
                    className="p-button-lg p-button-success submit-btn"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={students.length === 0}
                  />
                </div>
              </>
            )}
          </>
        )}

        {!classId && (
          <div className="no-class-selected">
            <i className="pi pi-graduation-cap" style={{ fontSize: '4rem', color: '#ccc' }}></i>
            <h3>Chọn lớp để bắt đầu</h3>
            <p>Vui lòng chọn một lớp học để thêm học viên</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AddStudentForm;