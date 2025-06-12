import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import "./AddManagerPage.css";

const AddManagerPage = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const payload = { ...form, role: "quanly" };
      await axios.post("http://localhost:8000/admin/users", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("✅ Thêm quản lý thành công!");
      setForm({ username: "", password: "", full_name: "", email: "", phone: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  return (
    <div className="add-manager-page">
      <h2>Thêm Quản Lý</h2>

      {success && <Message severity="success" text={success} />}
      {error && <Message severity="error" text={error} />}

      <form className="manager-form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Tên đăng nhập</label>
          <InputText value={form.username} onChange={(e) => handleChange(e, "username")} required />
        </div>

        <div className="field">
          <label>Mật khẩu</label>
          <Password value={form.password} onChange={(e) => handleChange(e, "password")} toggleMask feedback={false} required />
        </div>

        <div className="field">
          <label>Họ và tên</label>
          <InputText value={form.full_name} onChange={(e) => handleChange(e, "full_name")} />
        </div>

        <div className="field">
          <label>Email</label>
          <InputText type="email" value={form.email} onChange={(e) => handleChange(e, "email")} />
        </div>

        <div className="field">
          <label>Số điện thoại</label>
          <InputText value={form.phone} onChange={(e) => handleChange(e, "phone")} />
        </div>

        <Button label="Lưu quản lý" icon="pi pi-save" type="submit" className="mt-3" />
      </form>
    </div>
  );
};

export default AddManagerPage;
