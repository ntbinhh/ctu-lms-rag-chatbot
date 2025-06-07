import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "student"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/register", form);
      alert("Đăng ký thành công");
    } catch (err) {
      alert("Đăng ký thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng ký</h2>
      <input placeholder="Username" onChange={(e) => setForm({...form, username: e.target.value})} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} />
      <select onChange={(e) => setForm({...form, role: e.target.value})}>
        <option value="student">Sinh viên</option>
        <option value="teacher">Giảng viên</option>
        <option value="admin">Admin</option>
      </select>
      <button>Đăng ký</button>
    </form>
  );
}
