import React, { useState } from "react";
import axios from "axios";
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
      const res = await axios.post("http://localhost:8000/admin/facilities", {
        name,
        address,
        phone,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      <h2 className="form-title">➕ Thêm cơ sở liên kết đào tạo</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="facility-form">
        <div className="form-group">
          <label>Tên đơn vị</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nhập tên đơn vị"
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Nhập địa chỉ cơ sở"
          />
        </div>

        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Nhập số điện thoại"
          />
        </div>

        <button type="submit" className="submit-btn">Lưu thông tin</button>
      </form>
    </div>
  );
};

export default AddTrainingFacilityForm;
