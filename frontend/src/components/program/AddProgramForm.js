import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer"; // ✅ giữ giống như AddFacultyForm

const AddProgramForm = () => {
  const [khoa, setKhoa] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      setCourses(res.data.map((c) => ({
        label: `${c.code} - ${c.name}`,
        value: c.code
      })));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/programs", {
        khoa,
        major_id: selectedMajor,
        course_codes: selectedCourses,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("✅ Đã thêm chương trình đào tạo thành công!");
      setKhoa("");
      setSelectedMajor(null);
      setSelectedCourses([]);
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
            <label style={{ marginBottom: "0.5rem", display: "block" }}>Ngành đào tạo</label>
            <Dropdown
              value={selectedMajor}
              options={majors}
              onChange={(e) => setSelectedMajor(e.value)}
              placeholder="Chọn ngành"
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-group">
            <label style={{ marginBottom: "0.5rem", display: "block" }}>Danh sách học phần</label>
            <MultiSelect
              value={selectedCourses}
              options={courses}
              onChange={(e) => setSelectedCourses(e.value)}
              filter
              display="chip"
              placeholder="Chọn học phần"
              style={{ width: "100%" }}
            />
          </div>

          <Button
            label="Lưu thông tin"
            className="submit-btn p-button-sm p-button-outlined"
            disabled={!khoa || !selectedMajor || selectedCourses.length === 0}
          />
        </form>
      </div>
      <AdminFooter />
    </>
  );
};

export default AddProgramForm;
