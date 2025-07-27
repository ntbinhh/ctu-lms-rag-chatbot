import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import * as XLSX from "xlsx"; // Thư viện xuất file Excel
import AdminHeader from "../components/AdminHeader";
import React, { useState, useEffect, useRef } from "react";

const StudentList = () => {
  const [classId, setClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const toast = useRef(null);

  // Lấy danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(
          res.data.map((c) => ({ label: c.ma_lop, value: c.id }))
        );
      } catch (err) {
        console.error("Không thể tải danh sách lớp.");
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "❌ Không thể tải danh sách lớp.",
          life: 3000,
        });
      }
    };
    fetchClasses();
  }, []);

  // Lấy danh sách học viên của lớp
  const fetchStudents = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8000/admin/classes/${classId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudents(Array.isArray(res.data.students) ? res.data.students : []);
    } catch (err) {
      console.error("Không thể tải danh sách học viên.");
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "❌ Không thể tải danh sách học viên.",
        life: 3000,
      });
      setStudents([]);
    }
  };

  const handleClassChange = (e) => {
    setClassId(e.value);
    fetchStudents(e.value);
  };

  // Xóa học viên
  const deleteStudent = async (studentId) => {
    try {
      console.log("Gửi yêu cầu xóa học viên với ID:", studentId); // Kiểm tra giá trị studentId
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8000/admin/students/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "✅ Xóa học viên thành công.",
        life: 3000,
      });
      fetchStudents(classId); // Cập nhật danh sách sau khi xóa
    } catch (err) {
      console.error("Không thể xóa học viên:", err.response?.data || err.message);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "❌ Không thể xóa học viên.",
        life: 3000,
      });
    }
  };

  // Hiển thị hộp thoại xác nhận xóa
  const confirmDelete = (studentId) => {
    console.log("Xóa học viên với ID:", studentId); // Kiểm tra giá trị studentId
    confirmDialog({
      message: "Bạn có chắc chắn muốn xóa học viên này?",
      header: "Xác nhận xóa",
      icon: "pi pi-exclamation-triangle",
      accept: () => deleteStudent(studentId),
    });
  };

  // Xuất danh sách lớp ra file Excel
  const exportToExcel = () => {
    // Lấy mã lớp từ danh sách `classes`
    const selectedClass = classes.find((c) => c.value === classId);
    const classCode = selectedClass ? selectedClass.label : "Unknown";

    // Đổi tên cột trong file Excel
    const formattedStudents = students.map((student) => ({
      "Mã học viên": student.student_code,
      "Họ tên": student.name,
      "Ngày sinh": student.dob
        ? new Date(student.dob).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
        : "",
      "Giới tính": student.gender,
    }));

    // Tạo file Excel
    const worksheet = XLSX.utils.json_to_sheet(formattedStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách học viên");
    XLSX.writeFile(workbook, `DanhSachHocVien_${classCode}.xlsx`);

    // Hiển thị thông báo thành công
    toast.current?.show({
      severity: "success",
      summary: "Thành công",
      detail: "✅ Xuất file Excel thành công.",
      life: 3000,
    });
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      <ConfirmDialog /> {/* Thêm ConfirmDialog */}
      <div className="facility-form-wrapper">
        <h2 className="form-title">Danh Sách Học Viên</h2>

        <div className="form-group">
          <label>Chọn lớp</label>
          <Dropdown
            value={classId}
            options={classes}
            onChange={handleClassChange}
            placeholder="Chọn lớp"
            style={{ width: "100%" }}
          />
        </div>

        

        <DataTable
          value={students || []}
          responsiveLayout="scroll"
          paginator
          rows={10}
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          footer={
            <div style={{ textAlign: "right" }}>
              <Button
                label="Xuất Excel"
                icon="pi pi-file-excel"
                className="p-button-success"
                onClick={exportToExcel}
                disabled={students.length === 0}
              />
            </div>
          }
        >
          <Column field="student_code" header="Mã học viên" />
          <Column field="name" header="Họ tên" />
          <Column
            field="dob"
            header="Ngày sinh"
            body={(rowData) =>
              rowData.dob
                ? new Date(rowData.dob).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : ""
            }
          />
          <Column field="gender" header="Giới tính" />
          <Column
            header="Hành động"
            body={(rowData) => (
              <Button
                label="Xóa"
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => confirmDelete(rowData.id)}
              />
            )}
          />
        </DataTable>
      </div>
    </>
  );
};

export default StudentList;