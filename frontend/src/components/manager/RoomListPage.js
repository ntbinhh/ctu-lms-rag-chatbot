import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import ManagerHeader from "../manager/ManagerHeader";

const RoomListPage = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/manager/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(res.data);
    } catch (err) {
      setError("Không thể tải danh sách phòng học.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const typeTemplate = (rowData) => {
    const typeMap = {
      theory: "Lý thuyết",
      lab: "Thí nghiệm",
      computer: "Thực hành",
    };
    return typeMap[rowData.type] || rowData.type;
  };

  const buildingTemplate = (rowData) => (
    <Tag value={rowData.building || "Không có"} severity="info" />
  );

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa phòng học này?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/manager/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(rooms.filter((r) => r.id !== id));
      setSuccess("✅ Đã xóa phòng học thành công!");
    } catch (err) {
      setError("❌ Không thể xóa phòng học.");
    }
  };

  const actionBodyTemplate = (rowData) => (
    <Button
      label="Xóa"
      icon="pi pi-trash"
      className="p-button-danger p-button-sm"
      onClick={() => handleDelete(rowData.id)}
    />
  );

  return (
    <>
      <ManagerHeader />

      <main className="facilities-page-container">
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
            <h2 style={{ margin: 0 }}>Danh sách phòng học</h2>
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
              value={rooms}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              responsiveLayout="scroll"
              stripedRows
              filters={filters}
              globalFilterFields={["room_number", "type", "building"]}
            >
              <Column
                header="STT"
                body={(_, { rowIndex }) => rowIndex + 1}
                style={{ width: "80px" }}
              />
              <Column field="room_number" header="Số phòng" sortable />
              <Column field="capacity" header="Sức chứa" />
              <Column field="type" header="Loại phòng" body={typeTemplate} />
              <Column field="building" header="Nhà học" body={buildingTemplate} />
              <Column
                header="Hành động"
                body={actionBodyTemplate}
                style={{ width: "120px" }}
              />
            </DataTable>
          </div>
        </div>
      </main>
    </>
  );
};

export default RoomListPage;
