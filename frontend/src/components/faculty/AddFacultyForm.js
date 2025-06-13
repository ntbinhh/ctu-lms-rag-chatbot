import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

const AddFacultyForm = () => {
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/faculties", { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("✅ Đã thêm khoa thành công!");
      setName("");
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm Khoa Đào Tạo</h2>
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-group">
            <FloatLabel>
              <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} />
              <label htmlFor="name">Tên khoa</label>
            </FloatLabel>
          </div>

          <Button label="Lưu thông tin" className="submit-btn p-button-sm p-button-outlined" />
        </form>
      </div>
      <AdminFooter />
    </>
  );
};

export default AddFacultyForm;
