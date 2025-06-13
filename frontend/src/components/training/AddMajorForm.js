import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../AdminFooter";
import "../FacilitiesListPage.css";

const AddMajorForm = () => {
  const [name, setName] = useState("");
  const [facultyId, setFacultyId] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Tải danh sách khoa
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/faculties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaculties(res.data);
      } catch (err) {
        setError("❌ Không thể tải danh sách khoa.");
      }
    };
    fetchFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/majors", {
        name,
        faculty_id: facultyId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("✅ Đã thêm ngành đào tạo thành công!");
      setName("");
      setFacultyId(null);
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm Ngành Đào Tạo</h2>
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-group">
            <FloatLabel>
              <InputText
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label htmlFor="name">Tên ngành</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <Dropdown
                id="faculty"
                value={facultyId}
                options={faculties}
                onChange={(e) => setFacultyId(e.value)}
                optionLabel="name"
                optionValue="id"
                placeholder="Chọn khoa"
                filter
                style={{ width: "100%" }}
              />
              <label htmlFor="faculty">Khoa</label>
            </FloatLabel>
          </div>

          <Button
            label="Lưu thông tin"
            className="submit-btn p-button-sm p-button-outlined"
          />
        </form>
      </div>
      <AdminFooter />
    </>
  );
};

export default AddMajorForm;
