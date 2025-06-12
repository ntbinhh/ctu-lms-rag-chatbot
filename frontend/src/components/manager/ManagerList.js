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
import "../FacilitiesListPage.css"; // Tái sử dụng CSS có sẵn
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";
import { Button } from "primereact/button";

const ManagerListPage = () => {
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/users/managers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setManagers(res.data);
    } catch (err) {
      console.error("❌ Không thể tải danh sách quản lý:", err);
      setError("Không thể tải danh sách quản lý.");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/admin/users/managers/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchManagers(); // Tải lại sau khi cập nhật
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
      alert("Không thể thay đổi trạng thái.");
    }
  };

  useEffect(() => {
    fetchManagers();
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

          <div
            className="table-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h2 style={{ margin: 0 }}>Danh sách người quản lý</h2>
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
              value={managers}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              responsiveLayout="scroll"
              stripedRows
              filters={filters}
              globalFilterFields={["full_name", "phone", "facility_name"]}
            >
              <Column
                header="STT"
                body={(_, { rowIndex }) => rowIndex + 1}
                style={{ width: "80px" }}
              />
              <Column field="full_name" header="Họ tên" sortable />
              <Column field="phone" header="Số điện thoại" />
              <Column field="facility_name" header="Cơ sở liên kết" sortable />
              <Column
                field="status"
                header="Trạng thái"
                body={(rowData) =>
                  rowData.status === "active" ? "Hoạt động" : "Bị khóa"
                }
              />
              <Column
                header="Hành động"
                body={(rowData) => (
                    <Button
                    label={rowData.status === "active" ? "Khóa" : "Mở"}
                    icon={rowData.status === "active" ? "pi pi-lock" : "pi pi-lock-open"}
                    className={
                        rowData.status === "active"
                        ? "p-button-warning p-button-sm"
                        : "p-button-success p-button-sm"
                    }
                    onClick={() => handleToggleStatus(rowData.id)}
                    />
                )}
                style={{ width: "140px" }}
                />

            </DataTable>
          </div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
};

export default ManagerListPage;
