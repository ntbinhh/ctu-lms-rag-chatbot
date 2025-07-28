import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { FilterMatchMode } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { OverlayPanel } from "primereact/overlaypanel";
import * as XLSX from "xlsx";
import AdminHeader from "../components/AdminHeader";
import React, { useState, useEffect, useRef, useMemo } from "react";
import "./StudentList.css";

const StudentList = () => {
  const [classId, setClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    student_code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    gender: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    student_code: "",
    name: "",
    dob: null,
    gender: "",
    email: "",
    phone: ""
  });
  const [exportOptions, setExportOptions] = useState([]);
  const toast = useRef(null);
  const op = useRef(null);

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

  // Lấy danh sách học viên của lớp
  const fetchStudents = async (classId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/admin/classes/${classId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const studentData = Array.isArray(res.data.students) ? res.data.students : [];
      setStudents(studentData.map(student => ({
        ...student,
        displayName: student.name || 'Chưa có tên',
        age: student.dob ? new Date().getFullYear() - new Date(student.dob).getFullYear() : null
      })));
      showToast("success", "Thành công", ` Đã tải ${studentData.length} học viên`);
    } catch (err) {
      console.error("Không thể tải danh sách học viên.");
      showToast("error", "Lỗi", "Không thể tải danh sách học viên.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    setClassId(e.value);
    setSelectedStudents([]);
    setGlobalFilterValue("");
    onGlobalFilterChange("");
    fetchStudents(e.value);
  };

  // Search and filter functions
  const onGlobalFilterChange = (value) => {
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    setGlobalFilterValue("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      student_code: { value: null, matchMode: FilterMatchMode.CONTAINS },
      gender: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
  };

  // Add new student
  const handleAddStudent = async () => {
    // Validation như trong AddStudentForm
    if (!newStudent.name?.trim()) {
      showToast("warn", "Thiếu thông tin", "Vui lòng nhập họ tên học viên");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Sử dụng cùng endpoint và format như AddStudentForm
      const payload = {
        class_id: classId,
        students: [{
          name: newStudent.name.trim(),
          dob: newStudent.dob?.toISOString().split("T")[0] || null,
          gender: newStudent.gender || null,
          email: newStudent.email?.trim() || null,
          phone: newStudent.phone?.trim() || null
        }]
      };

      const response = await axios.post(
        "http://localhost:8000/admin/students", // Sử dụng cùng endpoint như AddStudentForm
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Xử lý response như AddStudentForm
      if (response.data.duplicates && response.data.duplicates.length > 0) {
        showToast("warn", "Trùng học viên", 
          `Học viên "${response.data.duplicates[0]}" đã tồn tại trong lớp`);
      } else {
        showToast("success", "Thành công", "Thêm học viên thành công");
      }
      
      setShowAddDialog(false);
      setNewStudent({
        student_code: "",
        name: "",
        dob: null,
        gender: "",
        email: "",
        phone: ""
      });
      fetchStudents(classId);
    } catch (err) {
      console.error("Không thể thêm học viên:", err);
      const errorMessage = err.response?.data?.detail || "Thêm học viên thất bại";
      showToast("error", "Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Edit student
  const handleEditStudent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/admin/students/${editingStudent.id}`,
        editingStudent,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast("success", "Thành công", "Cập nhật học viên thành công");
      setShowEditDialog(false);
      setEditingStudent(null);
      fetchStudents(classId);
    } catch (err) {
      console.error("Không thể cập nhật học viên:", err);
      showToast("error", "Lỗi", "Không thể cập nhật học viên");
    } finally {
      setLoading(false);
    }
  };
  // Xóa học viên
  const deleteStudent = async (studentId) => {
    try {
      setLoading(true);
      console.log("Gửi yêu cầu xóa học viên với ID:", studentId);
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8000/admin/students/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast("success", "Thành công", "Xóa học viên thành công");
      fetchStudents(classId);
    } catch (err) {
      console.error("Không thể xóa học viên:", err.response?.data || err.message);
      showToast("error", "Lỗi", "Không thể xóa học viên");
    } finally {
      setLoading(false);
    }
  };

  // Xóa nhiều học viên
  const deleteSelectedStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const deletePromises = selectedStudents.map(student =>
        axios.delete(`http://localhost:8000/admin/students/${student.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(deletePromises);
      showToast("success", "Thành công", `Đã xóa ${selectedStudents.length} học viên`);
      setSelectedStudents([]);
      fetchStudents(classId);
    } catch (err) {
      console.error("Không thể xóa học viên:", err);
      showToast("error", "Lỗi", "Không thể xóa học viên đã chọn");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị hộp thoại xác nhận xóa
  const confirmDelete = (studentId) => {
    console.log("Xóa học viên với ID:", studentId);
    confirmDialog({
      message: "Bạn có chắc chắn muốn xóa học viên này? Hành động này không thể hoàn tác.",
      header: "Xác nhận xóa",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      rejectClassName: "p-button-secondary",
      acceptLabel: "Xóa",
      rejectLabel: "Hủy",
      accept: () => deleteStudent(studentId),
    });
  };

  const confirmDeleteSelected = () => {
    confirmDialog({
      message: `Bạn có chắc chắn muốn xóa ${selectedStudents.length} học viên đã chọn? Hành động này không thể hoàn tác.`,
      header: "Xác nhận xóa nhiều",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      rejectClassName: "p-button-secondary",
      acceptLabel: "Xóa tất cả",
      rejectLabel: "Hủy",
      accept: deleteSelectedStudents,
    });
  };

  // Export functions
  const exportToExcel = () => {
    const selectedClass = classes.find((c) => c.value === classId);
    const classCode = selectedClass ? selectedClass.code : "Unknown";

    const formattedStudents = students.map((student, index) => ({
      "STT": index + 1,
      "Mã học viên": student.student_code,
      "Họ tên": student.name,
      "Ngày sinh": student.dob
        ? new Date(student.dob).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "",
      "Tuổi": student.age || "",
      "Giới tính": student.gender,
      "Email": student.email || "",
      "Số điện thoại": student.phone || "",
      "Ngày tạo": student.created_at 
        ? new Date(student.created_at).toLocaleDateString("vi-VN")
        : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedStudents);
    const workbook = XLSX.utils.book_new();
    
    // Set column widths
    const colWidths = [
      { wch: 5 },  // STT
      { wch: 15 }, // Mã học viên
      { wch: 25 }, // Họ tên
      { wch: 12 }, // Ngày sinh
      { wch: 8 },  // Tuổi
      { wch: 10 }, // Giới tính
      { wch: 30 }, // Email
      { wch: 15 }, // Số điện thoại
      { wch: 12 }  // Ngày tạo
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách học viên");
    XLSX.writeFile(workbook, `DanhSachHocVien_${classCode}_${new Date().toLocaleDateString('vi-VN')}.xlsx`);

    showToast("success", "Thành công", "Xuất file Excel thành công");
  };

  const exportSelectedToExcel = () => {
    if (selectedStudents.length === 0) {
      showToast("warn", "Cảnh báo", "Vui lòng chọn ít nhất một học viên");
      return;
    }

    const selectedClass = classes.find((c) => c.value === classId);
    const classCode = selectedClass ? selectedClass.code : "Unknown";

    const formattedStudents = selectedStudents.map((student, index) => ({
      "STT": index + 1,
      "Mã học viên": student.student_code,
      "Họ tên": student.name,
      "Ngày sinh": student.dob
        ? new Date(student.dob).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "",
      "Tuổi": student.age || "",
      "Giới tính": student.gender,
      "Email": student.email || "",
      "Số điện thoại": student.phone || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedStudents);
    const workbook = XLSX.utils.book_new();
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, 
      { wch: 8 }, { wch: 10 }, { wch: 30 }, { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Học viên đã chọn");
    XLSX.writeFile(workbook, `HocVienDaChon_${classCode}_${new Date().toLocaleDateString('vi-VN')}.xlsx`);

    showToast("success", "Thành công", `Xuất ${selectedStudents.length} học viên thành công`);
  };

  // Computed values
  const selectedClass = useMemo(() => 
    classes.find((c) => c.value === classId), [classes, classId]
  );

  const filteredStudentsCount = useMemo(() => 
    students.filter(student => 
      !globalFilterValue || 
      student.name?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      student.student_code?.toLowerCase().includes(globalFilterValue.toLowerCase())
    ).length, [students, globalFilterValue]
  );

  // Template functions for DataTable
  const headerTemplate = () => {
    return (
      <div className="student-list-header">
        <div className="header-info">
          <h3>
            Danh sách học viên 
            {selectedClass && (
              <Chip 
                label={`${selectedClass.code} (${students.length} học viên)`}
                className="ml-2"
                style={{ backgroundColor: '#0c4da2', color: 'white' }}
              />
            )}
          </h3>
        </div>
        <div className="header-actions">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              placeholder="Tìm kiếm học viên..."
              className="search-input"
            />
          </span>
          {globalFilterValue && (
            <Button
              icon="pi pi-times"
              className="p-button-text"
              onClick={clearFilter}
              tooltip="Xóa bộ lọc"
            />
          )}
        </div>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <Button
          icon="pi pi-eye"
          className="p-button-text p-button-info"
          onClick={() => {
            setEditingStudent({ ...rowData });
            setShowEditDialog(true);
          }}
          tooltip="Xem/Chỉnh sửa"
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger"
          onClick={() => confirmDelete(rowData.id)}
          tooltip="Xóa học viên"
        />
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
          <div className="student-code">{rowData.student_code}</div>
        </div>
      </div>
    );
  };

  const dobBodyTemplate = (rowData) => {
    if (!rowData.dob) return <span className="text-muted">Chưa có</span>;
    
    const birthDate = new Date(rowData.dob);
    const age = rowData.age;
    
    return (
      <div className="dob-cell">
        <div>{birthDate.toLocaleDateString("vi-VN")}</div>
        {age && <small className="text-muted">({age} tuổi)</small>}
      </div>
    );
  };
  return (
    <div className="student-list-container">
      <AdminHeader />
      <Toast ref={toast} />
      <ConfirmDialog />

      <Card className="student-list-card">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="pi pi-users"></i>
              Quản lý học viên
            </h1>
            <p className="page-subtitle">Quản lý thông tin học viên theo từng lớp học</p>
          </div>
          
          <div className="header-actions">
            <Button
              label="Thêm học viên"
              icon="pi pi-plus"
              className="p-button-success"
              onClick={() => setShowAddDialog(true)}
              disabled={!classId}
            />
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
              placeholder="Chọn lớp để xem danh sách học viên"
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
                <span className="info-label">Số học viên:</span>
                <Badge value={students.length} severity="info" className="info-badge" />
              </div>
            </div>
          )}
        </div>

        {loading && !students.length ? (
          <div className="loading-skeleton">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-row">
                <Skeleton width="100%" height="60px" className="mb-2" />
              </div>
            ))}
          </div>
        ) : classId ? (
          <>
            <Toolbar
              className="student-toolbar"
              start={
                <div className="toolbar-start">
                  <Button
                    label={`Đã chọn (${selectedStudents.length})`}
                    icon="pi pi-check-square"
                    className="p-button-text"
                    disabled={selectedStudents.length === 0}
                  />
                  {selectedStudents.length > 0 && (
                    <>
                      <Button
                        label="Xóa đã chọn"
                        icon="pi pi-trash"
                        className="p-button-danger p-button-outlined"
                        onClick={confirmDeleteSelected}
                      />
                      <Button
                        label="Xuất Excel"
                        icon="pi pi-file-excel"
                        className="p-button-success p-button-outlined"
                        onClick={exportSelectedToExcel}
                      />
                    </>
                  )}
                </div>
              }
              end={
                <div className="toolbar-end">
                  <Button
                    label="Xuất tất cả"
                    icon="pi pi-download"
                    className="p-button-help"
                    onClick={(e) => op.current.toggle(e)}
                    disabled={students.length === 0}
                  />
                  <OverlayPanel ref={op} className="export-panel">
                    <div className="export-options">
                      <h4>Tùy chọn xuất dữ liệu</h4>
                      <Button
                        label="Xuất Excel (Tất cả)"
                        icon="pi pi-file-excel"
                        className="p-button-success export-option"
                        onClick={() => {
                          exportToExcel();
                          op.current.hide();
                        }}
                      />
                      <Button
                        label="Xuất Excel (Đã chọn)"
                        icon="pi pi-file-excel"
                        className="p-button-info export-option"
                        onClick={() => {
                          exportSelectedToExcel();
                          op.current.hide();
                        }}
                        disabled={selectedStudents.length === 0}
                      />
                    </div>
                  </OverlayPanel>
                </div>
              }
            />

            <DataTable
              value={students}
              selection={selectedStudents}
              onSelectionChange={(e) => setSelectedStudents(e.value)}
              dataKey="id"
              paginator
              rows={15}
              rowsPerPageOptions={[10, 15, 25, 50]}
              className="student-datatable"
              header={headerTemplate}
              globalFilterFields={['name', 'student_code', 'gender']}
              filters={filters}
              emptyMessage={
                <div className="empty-state">
                  <i className="pi pi-users" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <h4>Không có học viên nào</h4>
                  <p>Lớp này chưa có học viên. Hãy thêm học viên mới.</p>
                  <Button
                    label="Thêm học viên đầu tiên"
                    icon="pi pi-plus"
                    className="p-button-text"
                    onClick={() => setShowAddDialog(true)}
                  />
                </div>
              }
              loading={loading}
              stripedRows
              responsiveLayout="scroll"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} học viên"
              paginatorPosition="both"
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column 
                field="name" 
                header="Thông tin" 
                body={nameBodyTemplate}
                sortable
                style={{ minWidth: '250px' }}
              />
              <Column 
                field="dob" 
                header="Ngày sinh" 
                body={dobBodyTemplate}
                sortable
                style={{ minWidth: '120px' }}
              />
              <Column 
                field="gender" 
                header="Giới tính" 
                body={genderBodyTemplate}
                sortable
                style={{ minWidth: '100px' }}
              />
              <Column 
                field="email" 
                header="Email" 
                sortable
                style={{ minWidth: '200px' }}
              />
              <Column 
                field="phone" 
                header="Điện thoại" 
                sortable
                style={{ minWidth: '120px' }}
              />
              <Column
                header="Hành động"
                body={actionBodyTemplate}
                style={{ minWidth: '120px', textAlign: 'center' }}
              />
            </DataTable>
          </>
        ) : (
          <div className="no-class-selected">
            <i className="pi pi-graduation-cap" style={{ fontSize: '4rem', color: '#ccc' }}></i>
            <h3>Chọn lớp để bắt đầu</h3>
            <p>Vui lòng chọn một lớp học để xem danh sách học viên</p>
          </div>
        )}
      </Card>

      {/* Add Student Dialog */}
      <Dialog
        visible={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        header="Thêm học viên mới"
        className="student-dialog"
        modal
        style={{ width: '500px' }}
        footer={
          <div className="dialog-footer">
            <Button
              label="Hủy"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={() => setShowAddDialog(false)}
            />
            <Button
              label="Thêm"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleAddStudent}
              loading={loading}
              disabled={!newStudent.name?.trim()}
            />
          </div>
        }
      >
        <div className="student-form">
          <div className="form-row">
            <div className="form-field">
              <label>Họ và tên *</label>
              <InputText
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div className="form-field">
              <label>Giới tính</label>
              <Dropdown
                value={newStudent.gender}
                options={genderOptions}
                onChange={(e) => setNewStudent({...newStudent, gender: e.value})}
                placeholder="Chọn giới tính"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field">
              <label>Ngày sinh</label>
              <Calendar
                value={newStudent.dob}
                onChange={(e) => setNewStudent({...newStudent, dob: e.value})}
                placeholder="Chọn ngày sinh"
                dateFormat="dd/mm/yy"
                showIcon
                maxDate={new Date()}
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <InputText
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                placeholder="Nhập email"
                type="email"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-field">
              <label>Số điện thoại</label>
              <InputText
                value={newStudent.phone}
                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header="Chỉnh sửa thông tin học viên"
        className="student-dialog"
        modal
        style={{ width: '500px' }}
        footer={
          <div className="dialog-footer">
            <Button
              label="Hủy"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={() => setShowEditDialog(false)}
            />
            <Button
              label="Cập nhật"
              icon="pi pi-check"
              className="p-button-primary"
              onClick={handleEditStudent}
              loading={loading}
            />
          </div>
        }
      >
        {editingStudent && (
          <div className="student-form">
            <div className="form-row">
              <div className="form-field">
                <label>Họ và tên *</label>
                <InputText
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div className="form-field">
                <label>Mã học viên</label>
                <InputText
                  value={editingStudent.student_code}
                  disabled
                  placeholder="Mã tự động"
                  style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>Ngày sinh</label>
                <Calendar
                  value={editingStudent.dob ? new Date(editingStudent.dob) : null}
                  onChange={(e) => setEditingStudent({...editingStudent, dob: e.value})}
                  placeholder="Chọn ngày sinh"
                  dateFormat="dd/mm/yy"
                  showIcon
                  maxDate={new Date()}
                />
              </div>
              <div className="form-field">
                <label>Giới tính</label>
                <Dropdown
                  value={editingStudent.gender}
                  options={genderOptions}
                  onChange={(e) => setEditingStudent({...editingStudent, gender: e.value})}
                  placeholder="Chọn giới tính"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label>Email</label>
                <InputText
                  value={editingStudent.email || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  placeholder="Nhập email"
                  type="email"
                />
              </div>
              <div className="form-field">
                <label>Số điện thoại</label>
                <InputText
                  value={editingStudent.phone || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default StudentList;