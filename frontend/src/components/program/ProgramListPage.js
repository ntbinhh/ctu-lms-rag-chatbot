import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

const ProgramListPage = () => {
  const [khoaList, setKhoaList] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [program, setProgram] = useState(null);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    axios.get("http://localhost:8000/programs/years")
      .then(res => setKhoaList(res.data.map(k => ({ label: k, value: k }))))
      .catch(() => setError("Không thể tải danh sách khóa"));
  }, []);

  useEffect(() => {
    if (selectedKhoa) {
      axios.get(`http://localhost:8000/programs/years/${selectedKhoa}/faculties`)
        .then(res => setFaculties(res.data))
        .catch(() => setError("Không thể tải danh sách khoa"));

      setSelectedFaculty(null);
      setMajors([]);
      setSelectedMajor(null);
      setProgram(null);
    }
  }, [selectedKhoa]);

  useEffect(() => {
    if (selectedFaculty) {
      axios.get(`http://localhost:8000/programs/years/${selectedKhoa}/faculties/${selectedFaculty}/majors`)
        .then(res => setMajors(res.data))
        .catch(() => setError("Không thể tải danh sách ngành"));

      setSelectedMajor(null);
      setProgram(null);
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (selectedMajor) {
      axios.get(`http://localhost:8000/programs/by_major?khoa=${selectedKhoa}&major_id=${selectedMajor}`)
        .then(res => setProgram(res.data))
        .catch(() => setError("Không thể tải chương trình đào tạo"));
    }
  }, [selectedMajor]);

  const nameWithLinkTemplate = (rowData) => {
    return rowData.syllabus_url ? (
      <a
        href={rowData.syllabus_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "#1a73e8", fontWeight: 500 }}
      >
        {rowData.name}
      </a>
    ) : (
      rowData.name
    );
  };

  return (
    <>
      <AdminHeader />
      <main
        className="facilities-page-container"
        style={{
          fontFamily: "'Segoe UI', Roboto, Inter, sans-serif",
          fontWeight: 600
        }}
      >
        <div className="facilities-list-page">
          <h2>📚 Chương Trình Đào Tạo</h2>
          {error && <div className="alert error">{error}</div>}

          <div className="form-step">
            <h3>Bước 1: Chọn khóa</h3>
            <Dropdown
              value={selectedKhoa}
              options={khoaList}
              onChange={(e) => setSelectedKhoa(e.value)}
              placeholder="Chọn khóa"
              style={{ width: "100%" }}
            />
          </div>

          {selectedKhoa && (
            <div className="form-step">
              <h3>Bước 2: Chọn khoa</h3>
              {faculties.map((f) => (
                <Button
                  key={f.id}
                  label={f.name}
                  onClick={() => setSelectedFaculty(f.id)}
                  className={`p-button-sm p-button-text ${selectedFaculty === f.id ? "p-button-info" : ""}`}
                  style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
                />
              ))}
            </div>
          )}

          {selectedFaculty && majors.length > 0 && (
            <div className="form-step">
              <h3>Bước 3: Chọn ngành đào tạo</h3>
              {majors.map((m) => (
                <Button
                  key={m.id}
                  label={m.name}
                  onClick={() => setSelectedMajor(m.id)}
                  className={`p-button-sm p-button-outlined ${selectedMajor === m.id ? "p-button-info" : ""}`}
                  style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
                />
              ))}
            </div>
          )}

          {program && (
            <>
              <h3>Chương Trình Đào Tạo - Khóa {program.khoa}</h3>

              <DataTable
                value={program.courses}
                paginator
                rows={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                stripedRows
                responsiveLayout="scroll"
              >
                <Column field="code" header="Mã học phần" />
                <Column header="Tên học phần" body={nameWithLinkTemplate} />
                <Column field="credit" header="Số tín chỉ" />
              </DataTable>
            </>
          )}
        </div>
      </main>
      <AdminFooter />
    </>
  );
};

export default ProgramListPage;
