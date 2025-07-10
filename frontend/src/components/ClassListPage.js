import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import EditClassPopup from "./EditClassPopup";

const ClassListPage = () => {
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [error, setError] = useState("");
  const [editingClass, setEditingClass] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      setError("❌ Không thể tải danh sách lớp học.");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const heDaoTaoTemplate = (rowData) => {
    const map = {
      vhvl: "Vừa học vừa làm",
      tu_xa: "Từ xa",
    };
    return map[rowData.he_dao_tao] || rowData.he_dao_tao;
  };

  return (
    <>
      <AdminHeader />
      <div className="facilities-page-container">
        <div className="facilities-list-page">
          <h2 className="form-title">Danh sách lớp học</h2>
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
            <span></span>
            <FloatLabel>
              <InputText
                id="search"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
              />
              <label htmlFor="search">Tìm kiếm</label>
            </FloatLabel>
          </div>

          <DataTable
            value={classes}
            paginator
            rows={10}
            stripedRows
            responsiveLayout="scroll"
            filters={filters}
            globalFilterFields={["ma_lop", "khoa", "facility", "major", "he_dao_tao"]}
          >
            <Column
              header="STT"
              body={(_, { rowIndex }) => rowIndex + 1}
              style={{ width: "60px" }}
            />
            <Column field="ma_lop" header="Mã lớp" sortable />
            <Column field="khoa" header="Khoá" sortable />
            <Column field="facility" header="Đơn vị liên kết" sortable />
            <Column field="major" header="Ngành đào tạo" sortable />
            <Column field="he_dao_tao" header="Hệ đào tạo" body={heDaoTaoTemplate} />
            <Column
              header="Hành động"
              body={(rowData) => (
                <Button
                  icon="pi pi-pencil"
                  className="p-button-sm p-button-outlined"
                  onClick={() => {
                    setEditingClass(rowData);
                    setShowEditPopup(true);
                  }}
                />
              )}
            />
          </DataTable>
        </div>
      </div>
      <AdminFooter />

      <EditClassPopup
        visible={showEditPopup}
        onHide={() => setShowEditPopup(false)}
        classData={editingClass}
        onUpdated={fetchClasses}
      />
    </>
  );
};

export default ClassListPage;
