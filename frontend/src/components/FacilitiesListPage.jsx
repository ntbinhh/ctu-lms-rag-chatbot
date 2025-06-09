import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./FacilitiesListPage.css";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const FacilitiesListPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

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

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const renderHeader = () => {
    return (
      <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}> Danh sách Cơ sở liên kết</h3>
        <input
          type="text"
          placeholder="Search"
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          className="search-box"
        />
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <button className="delete-btn" onClick={() => handleDelete(rowData.id)}>
        Xóa
      </button>
    );
  };

  return (
    <div className="facilities-list-page">
      <AdminHeader />

      {success && <div className="alert success">{success}</div>}
      {error && <div className="error">{error}</div>}

      <div className="data-table-wrapper">
        <DataTable
          removableSort 
          value={facilities}
          paginator
          rows={10}
          responsiveLayout="scroll"
          stripedRows
          filters={filters}
          globalFilterFields={["name", "address", "phone"]}
          header={renderHeader()}
        >
          <Column header="STT" body={(_, { rowIndex }) => rowIndex + 1} style={{ width: '80px' }}></Column>
          <Column field="name" header="Tên đơn vị" sortable></Column>
          <Column field="address" header="Địa chỉ"></Column>
          <Column field="phone" header="Điện thoại" style={{ width: '150px' }}></Column>
          <Column body={actionBodyTemplate} header="Hành động" style={{ width: '100px' }}></Column>
        </DataTable>
      </div>

      <AdminFooter />
    </div>
  );
};

export default FacilitiesListPage;
