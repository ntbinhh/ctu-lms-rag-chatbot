// src/pages/CourseListPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../AdminFooter";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

const CourseListPage = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (err) {
      setError("Không thể tải danh sách học phần.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const syllabusTemplate = (rowData) => {
    return rowData.syllabus_url ? (
      <a href={rowData.syllabus_url} target="_blank" rel="noopener noreferrer">
        Xem đề cương
      </a>
    ) : (
      "-"
    );
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
            <h2 style={{ margin: 0 }}>Danh sách học phần</h2>
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
              value={courses}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              responsiveLayout="scroll"
              stripedRows
              filters={filters}
              globalFilterFields={["code", "name"]}
            >
              <Column
                header="STT"
                body={(_, { rowIndex }) => rowIndex + 1}
                style={{ width: "80px" }}
              />
              <Column field="code" header="Mã học phần" sortable />
              <Column field="name" header="Tên học phần" sortable />
              <Column field="credit" header="Số tín chỉ" sortable />
              <Column
                field="syllabus_url"
                header="Đề cương"
                body={syllabusTemplate}
              />
            </DataTable>
          </div>
        </div>
      </main>

      <AdminFooter />
    </>
  );
};

export default CourseListPage;
