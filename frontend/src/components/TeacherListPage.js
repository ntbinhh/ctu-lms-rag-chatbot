import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import AdminHeader from "../components/AdminHeader";

const TeacherListPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/users/teachers/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách:", err);
      setError("❌ Không thể tải danh sách giảng viên.");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá giảng viên này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/admin/users/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(teachers.filter((t) => t.id !== id));
      setSuccess("✅ Xoá thành công");
    } catch (err) {
      setError("❌ Xoá thất bại");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/admin/users/teachers/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeachers();
      setSuccess("✅ Đã thay đổi trạng thái tài khoản");
    } catch (err) {
      setError("❌ Không thể thay đổi trạng thái");
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const statusTemplate = (rowData) => {
    const isActive = rowData.status === "active";
    const label = isActive ? "active" : "locked";
    const icon = isActive ? "pi pi-lock" : "pi pi-unlock";
    const severity = isActive ? "success" : "danger";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span className={`p-tag p-tag-${severity}`}>{label}</span>
        <Button
          icon={icon}
          className="p-button-text p-button-sm"
          onClick={() => toggleStatus(rowData.id)}
          tooltip={isActive ? "Khoá tài khoản" : "Mở khoá"}
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    );
  };

  return (
    <div>
      <AdminHeader />
      <div className="facilities-page-container">
        <div className="facilities-list-page">
          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}

          <div
            className="table-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h2 style={{ margin: 0 }}>Danh sách giảng viên</h2>
            <div style={{ display: "flex", gap: "1rem" }}>
              <FloatLabel>
                <InputText
                  id="search"
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                />
                <label htmlFor="search">Tìm kiếm</label>
              </FloatLabel>
              <Button
                label="Tải lại danh sách"
                icon="pi pi-refresh"
                className="p-button-sm p-button-secondary"
                onClick={fetchTeachers}
              />
            </div>
          </div>

          <DataTable
            value={teachers}
            paginator
            rows={10}
            filters={filters}
            globalFilterFields={["name", "email", "phone", "faculty"]}
            stripedRows
            responsiveLayout="scroll"
          >
            <Column
              header="STT"
              body={(_, { rowIndex }) => rowIndex + 1}
              style={{ width: "60px" }}
            />
            <Column field="name" header="Họ tên" sortable />
            <Column field="code" header="Mã CB" sortable />
            <Column field="email" header="Email" />
            <Column field="phone" header="Điện thoại" />
            <Column field="faculty" header="Khoa" sortable />
            <Column field="status" header="Trạng thái" body={statusTemplate} />
            <Column body={actionTemplate} header="Hành động" style={{ width: "100px" }} />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default TeacherListPage;
