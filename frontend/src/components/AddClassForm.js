import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const AddClassForm = () => {
  const [facilities, setFacilities] = useState([]);
  const [majors, setMajors] = useState([]);
  const [years, setYears] = useState([]);

  const [formData, setFormData] = useState({
    ma_lop: "",
    facility_id: "",
    khoa: "",
    major_id: "",
    he_dao_tao: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const heDaoTaoOptions = [
    { label: "Vừa học vừa làm", value: "vhvl" },
    { label: "Từ xa", value: "tu_xa" },
  ];

  useEffect(() => {
    fetchFacilities();
    fetchMajors();
    fetchYears();
  }, []);

  const fetchFacilities = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/admin/facilities", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFacilities(res.data.map((f) => ({ label: f.name, value: f.id })));
  };

  const fetchMajors = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/admin/majors", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMajors(res.data.map((m) => ({ label: m.name, value: m.id })));
  };

  const fetchYears = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:8000/programs/years", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setYears(res.data.map((y) => ({ label: y, value: y })));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/classes", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("✅ Đã thêm lớp học thành công!");
      setFormData({ facility_id: "", khoa: "", major_id: "", he_dao_tao: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "❌ Thêm lớp học thất bại");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="facility-form-wrapper">
        <h2 className="form-title">Thêm Lớp Học</h2>
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="facility-form">
          <div className="form-group">
            <FloatLabel>
              <Dropdown
                id="facility"
                value={formData.facility_id}
                options={facilities}
                onChange={(e) => handleChange("facility_id", e.value)}
                placeholder="Chọn đơn vị"
                style={{ width: "100%" }}
              />
              <label htmlFor="facility">Đơn vị liên kết</label>
            </FloatLabel>
          </div>
            <div className="form-group">
            <FloatLabel>
                <InputText
                id="ma_lop"
                value={formData.ma_lop}
                onChange={(e) => handleChange("ma_lop", e.target.value)}
                />
                <label htmlFor="ma_lop">Mã lớp</label>
            </FloatLabel>
            </div>
          <div className="form-group">
            <FloatLabel>
              <Dropdown
                id="khoa"
                value={formData.khoa}
                options={years}
                onChange={(e) => handleChange("khoa", e.value)}
                placeholder="Chọn khoá"
                style={{ width: "100%" }}
              />
              <label htmlFor="khoa">Khoá</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <Dropdown
                id="major"
                value={formData.major_id}
                options={majors}
                onChange={(e) => handleChange("major_id", e.value)}
                placeholder="Chọn ngành"
                style={{ width: "100%" }}
              />
              <label htmlFor="major">Ngành đào tạo</label>
            </FloatLabel>
          </div>

          <div className="form-group">
            <FloatLabel>
              <Dropdown
                id="he_dao_tao"
                value={formData.he_dao_tao}
                options={heDaoTaoOptions}
                onChange={(e) => handleChange("he_dao_tao", e.value)}
                placeholder="Chọn hệ"
                style={{ width: "100%" }}
              />
              <label htmlFor="he_dao_tao">Hệ đào tạo</label>
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

export default AddClassForm;
