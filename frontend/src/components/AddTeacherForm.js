import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import AdminHeader from "../components/AdminHeader";

const AddTeacherForm = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facultyId, setFacultyId] = useState(null);
  const [faculties, setFaculties] = useState([]);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Gọi API lấy danh sách khoa
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/faculties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFaculties(
          res.data.map((f) => ({ label: f.name, value: f.id }))
        );
      } catch (err) {
        console.error("Không thể tải danh sách khoa.");
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
      const res = await axios.post(
        "http://localhost:8000/admin/users/teachers",
        { name, code, email, phone, faculty_id: facultyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(`✅ Tạo thành công! Tài khoản: ${res.data.username}, mật khẩu: ${res.data.default_password}`);
      setName("");
      setCode("");
      setEmail("");
      setPhone("");
      setFacultyId(null);
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm giảng viên thất bại");
    }
  };

  return (
    <div>
      <AdminHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm giảng viên mới</h2>
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-group">
            <FloatLabel>
              <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} />
              <label htmlFor="name">Họ tên</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText id="code" value={code} onChange={(e) => setCode(e.target.value)} />
              <label htmlFor="code">Mã cán bộ (MACB)</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="email">Email</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <InputText id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <label htmlFor="phone">Số điện thoại</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <Dropdown
                id="faculty"
                value={facultyId}
                options={faculties}
                onChange={(e) => setFacultyId(e.value)}
                placeholder="Chọn đơn vị công tác"
                style={{ width: "100%" }}
              />
              <label htmlFor="faculty">Đơn vị công tác</label>
            </FloatLabel>
          </div>

          <Button label="Lưu giảng viên" className="p-button-sm p-button-outlined" type="submit" />
        </form>
      </div>
    </div>
  );
};

export default AddTeacherForm;
