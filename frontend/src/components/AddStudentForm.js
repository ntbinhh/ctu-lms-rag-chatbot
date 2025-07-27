import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import AdminHeader from "../components/AdminHeader";
import { Calendar } from "primereact/calendar";

const AddStudentForm = () => {
  const [classId, setClassId] = useState(null);
  const [classCode, setClassCode] = useState("");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectMode, setSelectMode] = useState("paste");
  const [newStudent, setNewStudent] = useState({ name: "", dob: "", gender: "" });
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
          res.data.map((c) => ({ label: c.ma_lop, value: c.id, code: c.ma_lop }))
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

  const handleClassChange = (e) => {
    setClassId(e.value);
    const selectedClass = classes.find((c) => c.value === e.value);
    setClassCode(selectedClass?.code || "");
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData("Text");
    const rows = pastedData.split("\n").map((row) => row.trim());
    const parsedStudents = rows
      .filter((row) => row) // Loại bỏ các dòng trống
      .map((row) => {
        const [name, dob, gender] = row.split("\t"); // Tách dữ liệu bằng tab
        return {
          name: name?.trim() || "",
          dob: dob?.trim()
            ? new Date(dob.trim().split("/").reverse().join("-"))
            : null,
          gender: gender?.trim() || "",
        };
      });
    setStudents(parsedStudents);
  };

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.dob || !newStudent.gender) {
      toast.current?.show({
        severity: "warn",
        summary: "Thiếu thông tin",
        detail: "❌ Vui lòng nhập đầy đủ thông tin học viên.",
        life: 3000,
      });
      return;
    }

    const updatedStudents = [...students];
    updatedStudents.push({
      name: newStudent.name,
      dob: new Date(newStudent.dob.split("/").reverse().join("-")),
      gender: newStudent.gender,
    });
    setStudents(updatedStudents);
    setNewStudent({ name: "", dob: "", gender: "" });
  };

  const handleSubmit = async () => {
    if (!classId) {
      toast.current?.show({
        severity: "warn",
        summary: "Thiếu thông tin",
        detail: "❌ Vui lòng chọn lớp học.",
        life: 7000,
      });
      return;
    }

    const payload = {
      class_id: classId,
      students: students.map((student) => ({
        name: student.name,
        dob: student.dob?.toISOString().split("T")[0],
        gender: student.gender,
      })),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8000/admin/students", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.duplicates && res.data.duplicates.length > 0) {
        toast.current?.show({
          severity: "warn",
          summary: "Trùng học viên",
          detail: `❌ Các học viên sau đã tồn tại: ${res.data.duplicates.join(", ")}`,
          life: 7000,
        });
      } else {
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "✅ Thêm học viên thành công!",
          life: 7000,
        });
      }
    } catch (error) {
      console.error("Lỗi:", error.response?.data);
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "❌ Thêm học viên thất bại!",
        life: 7000,
      });
    }
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm Học Viên</h2>

        <form
          className="facility-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
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

          <div className="form-group">
            <label>Phương thức thêm học viên:</label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <div>
                <input
                  type="radio"
                  id="paste"
                  value="paste"
                  checked={selectMode === "paste"}
                  onChange={() => setSelectMode("paste")}
                />
                <label htmlFor="paste" style={{ marginLeft: "0.3rem" }}>
                  Dán danh sách
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="manual"
                  value="manual"
                  checked={selectMode === "manual"}
                  onChange={() => setSelectMode("manual")}
                />
                <label htmlFor="manual" style={{ marginLeft: "0.3rem" }}>
                  Nhập thủ công
                </label>
              </div>
            </div>
          </div>

          {selectMode === "paste" && (
            <div className="form-group">
              <label>Copy từ Excel và dán vào bảng bên dưới:</label>
              <div
                onPaste={handlePaste}
                style={{
                  border: "1px dashed #ccc",
                  padding: "1rem",
                  textAlign: "center",
                  cursor: "text",
                }}
              >
                Nhấn vào đây và dán dữ liệu từ Excel
              </div>
              <DataTable
                value={students}
                editable
                responsiveLayout="scroll"
                paginator
                rows={10}
              >
                <Column field="name" header="Họ tên" />
                <Column
                  field="dob"
                  header="Ngày sinh"
                  body={(rowData) =>
                    rowData.dob
                      ? rowData.dob.toISOString().split("T")[0]
                      : ""
                  }
                />
                <Column field="gender" header="Giới tính" />
              </DataTable>
            </div>
          )}

          {selectMode === "manual" && (
            <div className="form-group">
              <label>Nhập thông tin học viên:</label>
              <div style={{ marginBottom: "1rem" }}>
                <InputText
                  placeholder="Họ tên"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  style={{ marginBottom: "0.5rem", width: "100%" }}
                />
                <Calendar
                  placeholder="Ngày sinh"
                  value={newStudent.dob ? new Date(newStudent.dob) : null}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, dob: e.value.toISOString().split("T")[0] })
                  }
                  dateFormat="dd/mm/yy"
                  showIcon
                  style={{ marginBottom: "0.5rem", width: "100%" }}
                />
                <InputText
                  placeholder="Giới tính"
                  value={newStudent.gender}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, gender: e.target.value })
                  }
                  style={{ marginBottom: "0.5rem", width: "100%" }}
                />
                <Button
                  label="Thêm học viên"
                  className="p-button-sm p-button-outlined"
                  onClick={handleAddStudent}
                />
              </div>
              <DataTable
                value={students}
                editable
                responsiveLayout="scroll"
                paginator
                rows={10}
              >
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
              </DataTable>
            </div>
          )}

          <Button
            label="Lưu danh sách"
            className="submit-btn p-button-sm p-button-outlined"
            onClick={handleSubmit}
            disabled={!classId || students.length === 0}
          />
        </form>
      </div>
    </>
  );
};

export default AddStudentForm;