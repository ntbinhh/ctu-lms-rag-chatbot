import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

const AddProgramForm = () => {
  const [khoa, setKhoa] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [selectMode, setSelectMode] = useState("paste"); // 'paste' | 'table'
  const [courseListText, setCourseListText] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/admin/majors").then((res) => {
      setMajors(res.data.map((m) => ({
        label: m.name,
        value: m.id
      })));
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8000/admin/courses", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setCourses(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const course_codes =
      selectMode === "paste"
        ? courseListText.split("\n").map(c => c.trim()).filter(Boolean)
        : selectedCourses.map(c => c.code);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/programs", {
        khoa,
        major_id: selectedMajor,
        course_codes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("✅ Đã thêm chương trình đào tạo thành công!");
      setKhoa("");
      setSelectedMajor(null);
      setSelectedCourses([]);
      setCourseListText("");
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm Chương Trình Đào Tạo</h2>
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-group">
            <FloatLabel>
              <InputText id="khoa" value={khoa} onChange={(e) => setKhoa(e.target.value)} />
              <label htmlFor="khoa">Khóa</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <label>Ngành đào tạo</label>
            <Dropdown
              value={selectedMajor}
              options={majors}
              onChange={(e) => setSelectedMajor(e.value)}
              placeholder="Chọn ngành"
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group">
            <label>Phương thức chọn học phần:</label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <div>
                <input
                  type="radio"
                  id="paste"
                  value="paste"
                  checked={selectMode === "paste"}
                  onChange={() => setSelectMode("paste")}
                />
                <label htmlFor="paste" style={{ marginLeft: "0.3rem" }}>Dán mã</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="table"
                  value="table"
                  checked={selectMode === "table"}
                  onChange={() => setSelectMode("table")}
                />
                <label htmlFor="table" style={{ marginLeft: "0.3rem" }}>Chọn từ bảng</label>
              </div>
            </div>
          </div>

          {selectMode === "paste" && (
            <div className="form-group">
              <label>Danh sách mã học phần (mỗi dòng 1 mã)</label>
              <InputTextarea
                value={courseListText}
                onChange={(e) => setCourseListText(e.target.value)}
                rows={10}
                style={{ width: "100%" }}
                placeholder="VD:\nQP010E\nTC005\nTV134E"
              />
            </div>
          )}

          {selectMode === "table" && (
            <div className="form-group">
              <label>Danh sách học phần</label>
              <DataTable
                value={courses}
                selection={selectedCourses}
                onSelectionChange={(e) => setSelectedCourses(e.value)}
                dataKey="code"
                paginator rows={10}
                filterDisplay="row"
                responsiveLayout="scroll"
              >
                <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
                <Column field="code" header="Mã học phần" filter />
                <Column field="name" header="Tên học phần" filter />
                <Column field="credit" header="Số TC" />
              </DataTable>
            </div>
          )}

          <Button
            label="Lưu thông tin"
            className="submit-btn p-button-sm p-button-outlined"
            disabled={
              !khoa ||
              !selectedMajor ||
              (selectMode === "paste"
                ? courseListText.trim() === ""
                : selectedCourses.length === 0)
            }
          />
        </form>
      </div>
      <AdminFooter />
    </>
  );
};

export default AddProgramForm;
