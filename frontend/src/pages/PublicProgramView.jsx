import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const PublicProgramView = () => {
  const [khoaList, setKhoaList] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [program, setProgram] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/programs/years")
      .then(res => setKhoaList(res.data.map(k => ({ label: k, value: k }))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedKhoa) {
      axios.get(`http://localhost:8000/programs/years/${selectedKhoa}/faculties`)
        .then(res => setFaculties(res.data))
        .catch(() => {});

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
        .catch(() => {});

      setSelectedMajor(null);
      setProgram(null);
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (selectedMajor) {
      axios.get(`http://localhost:8000/programs/by_major?khoa=${selectedKhoa}&major_id=${selectedMajor}`)
        .then(res => setProgram(res.data))
        .catch(() => {});
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
      <Header />
      <div className="layout-wrapper" >
      <main style={{ maxWidth: "2000px", margin: "0 25rem auto", padding: "0 1rem" }}>
        <h2 style={{ color: "#0d47a1", marginBottom: "2rem", borderLeft: "5px solid #2196f3", paddingLeft: "0.75rem" }}>
          Chương Trình Đào Tạo
        </h2>

        <div style={{ marginBottom: "2rem" }}>
          <h4>1. Chọn khóa:</h4>
          <Dropdown
            value={selectedKhoa}
            options={khoaList}
            onChange={(e) => setSelectedKhoa(e.value)}
            placeholder="Chọn khóa"
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          {selectedKhoa && (
            <>
              <h4>2. Chọn khoa:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                {faculties.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFaculty(f.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      border: "1px solid #2196f3",
                      backgroundColor: selectedFaculty === f.id ? "#2196f3" : "#fff",
                      color: selectedFaculty === f.id ? "#fff" : "#2196f3",
                      cursor: "pointer"
                    }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedFaculty && majors.length > 0 && (
            <>
              <h4>3. Chọn ngành:</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                {majors.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMajor(m.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      border: "1px solid #4caf50",
                      backgroundColor: selectedMajor === m.id ? "#4caf50" : "#fff",
                      color: selectedMajor === m.id ? "#fff" : "#4caf50",
                      cursor: "pointer"
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {program && (
          <>
            <h3 style={{ marginBottom: "1rem" }}>Danh sách học phần:</h3>
            <DataTable value={program.courses} responsiveLayout="scroll" stripedRows>
              <Column field="code" header="Mã học phần" />
              <Column header="Tên học phần" body={nameWithLinkTemplate} />
              <Column field="credit" header="Số tín chỉ" />
            </DataTable>
          </>
        )}
      </main>
      </div>
      <Footer />
    </>
  );
};

export default PublicProgramView;