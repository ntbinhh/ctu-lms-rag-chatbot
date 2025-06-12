import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./FacilitiesListPage.css";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { Button } from "primereact/button";

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
      setFacilities(facilities.filter((f) => f.id !== id));
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

  const actionBodyTemplate = (rowData) => {
  return (
    <Button
      label="Xóa"
      icon="pi pi-trash"
      className="p-button-danger p-button-sm"
      onClick={() => handleDelete(rowData.id)}
    />
  );
};


  return (
    <>
      <AdminHeader />

      <main className="facilities-page-container">
        <div className="facilities-list-page">
          {success && <div className="alert success">{success}</div>}
          {error && <div className="error">{error}</div>}

          <div
            className="table-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h2 style={{ margin: 0 }}>Danh sách các Cơ sở liên kết Đào tạo</h2>
            <FloatLabel>
              <InputText
                id="search"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
              />
              <label htmlFor="search">Tìm kiếm</label>
            </FloatLabel>
          </div>

          <div className="data-table-wrapper">
            <DataTable
              value={facilities}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              responsiveLayout="scroll"
              stripedRows
              filters={filters}
              globalFilterFields={["name", "address", "phone"]}
            >
              <Column
                header="STT"
                body={(_, { rowIndex }) => rowIndex + 1}
                style={{ width: "80px" }}
              />
              <Column field="name" header="Tên đơn vị" sortable />
              <Column field="address" header="Địa chỉ" />
              <Column
                field="phone"
                header="Điện thoại"
                style={{ width: "150px" }}
              />
              <Column
                body={actionBodyTemplate}
                header="Hành động"
                style={{ width: "100px" }}
              />
            </DataTable>
          </div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
};

export default FacilitiesListPage;
