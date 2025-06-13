import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../AdminFooter";
import "../FacilitiesListPage.css";

const MajorListPage = () => {
  const [majors, setMajors] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/admin/majors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMajors(res.data);
      } catch (err) {
        setError("Không thể tải danh sách ngành đào tạo.");
      }
    };
    fetchMajors();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  return (
    <>
      <AdminHeader />

      <main className="facilities-page-container">
        <div className="facilities-list-page">
          {error && <div className="error">{error}</div>}

          <div className="table-header" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px"
          }}>
            <h2 style={{ margin: 0 }}>Danh sách Ngành Đào Tạo</h2>
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
              value={majors}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              responsiveLayout="scroll"
              stripedRows
              filters={filters}
              globalFilterFields={["name", "faculty_name"]}
            >
              <Column
                header="STT"
                body={(_, { rowIndex }) => rowIndex + 1}
                style={{ width: "80px" }}
              />
              <Column field="name" header="Tên ngành" sortable />
              <Column field="faculty_name" header="Khoa trực thuộc" sortable />
            </DataTable>
          </div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
};

export default MajorListPage;
