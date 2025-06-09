import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./AddTrainingFacilityForm.css";

const AddTrainingFacilityForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/admin/facilities",
        { name, address, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("✅ Đã thêm cơ sở liên kết thành công!");
      setName("");
      setAddress("");
      setPhone("");
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  return (
    <div className="facility-form-wrapper">
      <h2 className="form-title">Thêm cơ sở liên kết đào tạo</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="facility-form">
        <div className="form-group">
          <FloatLabel>
            <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor="name">Tên đơn vị</label>
          </FloatLabel>
        </div>

        <div className="form-group">
          <FloatLabel>
            <InputText id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <label htmlFor="address">Địa chỉ</label>
          </FloatLabel>
        </div>

        <div className="form-group">
          <FloatLabel>
            <InputText id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label htmlFor="phone">Số điện thoại</label>
          </FloatLabel>
        </div>

        <Button label="Lưu thông tin" className="submit-btn p-button-sm p-button-outlined" />
      </form>
    </div>
  );
};

export default AddTrainingFacilityForm;
