import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FacilitiesListPage.css";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const FacilitiesListPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/facilities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFacilities(res.data);
    } catch (err) {
      setError("Không thể tải danh sách CSLK.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/facilities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFacilities(facilities.filter(f => f.id !== id));
      setSuccess("✅ Đã xóa cơ sở thành công!");
    } catch (err) {
      alert("Xóa thất bại.");
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return (
    <div className="facilities-list-page">
      <AdminHeader />

      <h2>📋 Danh sách Cơ sở liên kết</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="error">{error}</div>}

      <table className="facility-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên đơn vị</th>
            <th>Địa chỉ</th>
            <th>Điện thoại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((f, idx) => (
            <tr key={f.id}>
              <td>{idx + 1}</td>
              <td>{f.name}</td>
              <td>{f.address}</td>
              <td>{f.phone}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(f.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {facilities.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>

      <AdminFooter />
    </div>
  );
};

export default FacilitiesListPage;
