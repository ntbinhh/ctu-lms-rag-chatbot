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
import "./AddManagerForm.css";

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
    <div className="add-manager-page">
      <AdminHeader />
      <main className="layout-main">
        <div className="manager-form-container">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">
              <i className="pi pi-user-plus"></i>
              Thêm người quản lý
            </h1>
            <p className="page-subtitle">
              Tạo tài khoản quản lý mới cho cơ sở liên kết đào tạo
            </p>
          </div>

          {/* Form Card */}
          <div className="manager-form-card">
            {success && <div className="alert success">{success}</div>}
            {error && <div className="alert error">{error}</div>}

            <form onSubmit={handleSubmit} className="manager-form">
              <div className="form-grid">
                <div className="form-group">
                  <FloatLabel>
                    <InputText 
                      id="fullname" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <label htmlFor="fullname">Họ và tên *</label>
                  </FloatLabel>
                </div>

                <div className="form-group">
                  <FloatLabel>
                    <InputText 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <label htmlFor="phone">Số điện thoại *</label>
                  </FloatLabel>
                </div>

                <div className="form-group full-width">
                  <FloatLabel>
                    <Dropdown
                      id="facility"
                      value={facilityId}
                      options={facilities}
                      onChange={(e) => setFacilityId(e.value)}
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Chọn cơ sở liên kết"
                      filter
                      filterBy="name"
                      emptyMessage="Không tìm thấy cơ sở nào"
                      required
                    />
                    <label htmlFor="facility">Cơ sở liên kết *</label>
                  </FloatLabel>
                </div>
              </div>

              <Button 
                type="submit"
                label="Tạo tài khoản quản lý" 
                icon="pi pi-save"
                className="submit-button"
                disabled={!fullName || !phone || !facilityId}
              />
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddManagerForm;
