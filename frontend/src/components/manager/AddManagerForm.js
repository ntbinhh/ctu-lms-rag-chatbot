import React, { useState, useEffect } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import AdminHeader from "../AdminHeader";
import Footer from "../Footer";
// import "./AddTrainingFacilityForm.css"; // Tái sử dụng luôn style cũ

const AddManagerForm = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [facilityId, setFacilityId] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Lấy danh sách cơ sở liên kết
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/facilities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFacilities(res.data);
      } catch (err) {
        console.error("Lỗi tải cơ sở:", err);
      }
    };
    fetchFacilities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/admin/users/managers",
        {
          full_name: fullName,
          phone,
          facility_id: facilityId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("✅ Đã thêm quản lý thành công!");
      setFullName("");
      setPhone("");
      setFacilityId(null);
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm thất bại");
    }
  };

  return (
    <>    <AdminHeader />
    <div className="facility-form-wrapper">
      <h2 className="form-title">Thêm người quản lý</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="facility-form">
        <div className="form-group">
          <FloatLabel>
            <InputText id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <label htmlFor="fullname">Họ tên</label>
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
              id="facility"
              value={facilityId}
              options={facilities}
              onChange={(e) => setFacilityId(e.value)}
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn cơ sở liên kết"
              style={{ width: "100%" }}
              filter  //  Cho phép lọc
              filterBy="name"  //  Cho phép lọc theo tên
            />
            <label htmlFor="facility">Cơ sở liên kết</label>
          </FloatLabel>
        </div>

        <Button label="Lưu thông tin" className="submit-btn p-button-sm p-button-outlined" />
      </form>
    </div>
    <Footer />
  </>
  );
};

export default AddManagerForm;
