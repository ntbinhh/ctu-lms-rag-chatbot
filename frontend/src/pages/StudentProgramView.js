import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import StudentHeader from "../components/StudentHeader";
import "./StudentProgramView.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const StudentProgramView = () => {
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [khoaList, setKhoaList] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [program, setProgram] = useState(null);
  const [error, setError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Template hiển thị tên học phần với link đề cương
  const nameWithLinkTemplate = (rowData) => {
    if (rowData.syllabus_url) {
      return (
        <a 
          href={rowData.syllabus_url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: "#1976d2", textDecoration: "underline" }}
        >
          {rowData.name}
        </a>
      );
    }
    return rowData.name;
  };

  // Lấy danh sách khóa
  useEffect(() => {
    axios.get("http://localhost:8000/programs/years")
      .then(res => setKhoaList(res.data.map(k => ({ label: k, value: k }))))
      .catch(() => setError("Không thể tải danh sách khóa"));
  }, []);

  // Lấy danh sách khoa theo khóa
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

  // Lấy danh sách ngành theo khoa
  useEffect(() => {
    if (selectedFaculty) {
      axios.get(`http://localhost:8000/programs/years/${selectedKhoa}/faculties/${selectedFaculty}/majors`)
        .then(res => setMajors(res.data))
        .catch(() => setError("Không thể tải danh sách ngành"));

      setSelectedMajor(null);
      setProgram(null);
    }
  }, [selectedFaculty]);

  // Lấy chương trình đào tạo
  useEffect(() => {
    if (selectedMajor) {
      axios.get(`http://localhost:8000/programs/by_major?khoa=${selectedKhoa}&major_id=${selectedMajor}`)
        .then(res => setProgram(res.data))
        .catch(() => setError("Không thể tải chương trình đào tạo"));
    }
  }, [selectedMajor]);

  return (
    <div className="student-program-container">
      <StudentHeader />
      <main className="student-program-main">
        <div>
          <h2 className="student-program-title">
            Chương trình đào tạo
          </h2>
          
          {error && (
            <div className="student-error">
              ⚠️ {error}
            </div>
          )}

          <div className="student-form-container">
            <div className="student-form-step">
              <h3>
                Bước 1: Chọn khóa học
              </h3>
              <Dropdown
                value={selectedKhoa}
                options={khoaList}
                onChange={(e) => setSelectedKhoa(e.value)}
                placeholder="Chọn khóa học"
                style={{ width: "100%" }}
                className="p-dropdown-lg"
              />
            </div>

            {selectedKhoa && faculties.length > 0 && (
              <div className="student-form-step">
                <h3>
                  Bước 2: Chọn khoa
                </h3>
                <div className="student-faculty-buttons">
                  {faculties.map((f) => (
                    <Button
                      key={f.id}
                      label={f.name}
                      onClick={() => setSelectedFaculty(f.id)}
                      className={`student-faculty-btn ${selectedFaculty === f.id ? "p-button-info" : "p-button-outlined"}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedFaculty && majors.length > 0 && (
              <div className="student-form-step">
                <h3>
                  Bước 3: Chọn ngành đào tạo
                </h3>
                <div className="student-major-buttons">
                  {majors.map((m) => (
                    <Button
                      key={m.id}
                      label={m.name}
                      onClick={() => setSelectedMajor(m.id)}
                      className={`student-major-btn ${selectedMajor === m.id ? "p-button-success" : "p-button-outlined"}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {program && (
            <>
              <div className="student-program-header">
                <div className="student-program-header-left">
                  <h3>
                    Chương Trình Đào Tạo - Khóa {program.khoa}
                  </h3>
                  <p>
                    Thông tin chi tiết về các học phần trong chương trình
                  </p>
                </div>
                <div className="student-program-header-right">
                  <div className="student-program-count">
                    {program.courses?.length || 0}
                  </div>
                  <div className="student-program-count-label">
                    Học phần
                  </div>
                </div>
              </div>

              <div className="student-datatable-container">
                <DataTable
                  value={program.courses}
                  paginator
                  rows={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  stripedRows
                  responsiveLayout="scroll"
                  className="p-datatable-lg"
                  header={
                    <div className="student-datatable-header">
                      Danh sách học phần
                    </div>
                  }
                  footer={
                    <div className="student-datatable-footer">
                     Tổng số tín chỉ: {program.courses?.reduce((total, course) => total + (course.credit || 0), 0) || 0} tín chỉ
                    </div>
                  }
                >
                  <Column 
                    header="STT" 
                    body={(_, { rowIndex }) => (
                      <div style={{ 
                        textAlign: "center", 
                        fontWeight: "bold",
                        color: "#0c4da2"
                      }}>
                        {rowIndex + 1}
                      </div>
                    )}
                    style={{ width: "80px" }} 
                  />
                  <Column 
                    field="code" 
                    header="Mã học phần" 
                    style={{ 
                      width: "140px", 
                      fontWeight: "bold",
                      color: "#1976d2"
                    }} 
                  />
                  <Column 
                    header="Tên học phần" 
                    body={nameWithLinkTemplate}
                    style={{ minWidth: "300px" }}
                  />
                  <Column 
                    field="credit" 
                    header="Số tín chỉ" 
                    body={(rowData) => (
                      <div style={{ 
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#28a745"
                      }}>
                        {rowData.credit}
                      </div>
                    )}
                    style={{ width: "120px" }}
                  />
                </DataTable>
              </div>
            </>
          )}

          {!selectedKhoa && (
            <div className="student-welcome-container">
              <i className="pi pi-info-circle student-welcome-icon"></i>
              <h3 className="student-welcome-title">
                Chào mừng bạn đến với hệ thống xem chương trình đào tạo
              </h3>
              <p className="student-welcome-text">
                Vui lòng chọn khóa học để bắt đầu tra cứu chương trình đào tạo. 
                Bạn có thể xem thông tin chi tiết về các học phần và tải về đề cương môn học.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentProgramView;
