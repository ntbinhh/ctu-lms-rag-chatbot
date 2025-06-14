// ... (các import không đổi)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Tooltip } from "primereact/tooltip";
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

  const [editVisible, setEditVisible] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCredit, setEditCredit] = useState(0);
  const [editUrl, setEditUrl] = useState("");

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseCodes, setSelectedCourseCodes] = useState([]);

  const handleDeleteCourse = async (code) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa học phần này khỏi chương trình?")) return;

    try {
      await axios.delete("http://localhost:8000/admin/programs/delete_course", {
        data: {
          khoa: selectedKhoa,
          major_id: selectedMajor,
          course_code: code
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      setProgram(prev => ({
        ...prev,
        courses: prev.courses.filter(c => c.code !== code)
      }));
    } catch (err) {
      alert("❌ Xóa học phần thất bại.");
    }
  };

  const handleAddExistingCourses = async () => {
    try {
      await axios.post("http://localhost:8000/admin/programs/add_courses", {
        khoa: selectedKhoa,
        major_id: selectedMajor,
        course_codes: selectedCourseCodes
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      const addedCourses = allCourses.filter(c => selectedCourseCodes.includes(c.value));

      setProgram(prev => ({
        ...prev,
        courses: [...prev.courses, ...addedCourses.map(c => ({
          code: c.value,
          name: c.name,
          credit: c.credit,
          syllabus_url: c.syllabus_url
        }))]
      }));

      setAddDialogVisible(false);
      setSelectedCourseCodes([]);
    } catch (err) {
      alert("❌ Thêm học phần thất bại.");
    }
  };

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

      axios.get("http://localhost:8000/admin/courses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(res => {
        setAllCourses(res.data.map(c => ({
          label: `${c.code} - ${c.name}`,
          value: c.code,
          name: c.name,
          credit: c.credit,
          syllabus_url: c.syllabus_url
        })));
      });
    }
  }, [selectedMajor]);

  const handleEditCourse = (course) => {
    setEditCourse(course);
    setEditName(course.name);
    setEditCredit(course.credit);
    setEditUrl(course.syllabus_url || "");
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(
        "http://localhost:8000/admin/programs/update_course",
        {
          khoa: selectedKhoa,
          major_id: selectedMajor,
          course_code: editCourse.code,
          name: editName,
          credit: editCredit,
          syllabus_url: editUrl
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      setProgram(prev => ({
        ...prev,
        courses: prev.courses.map(c =>
          c.code === editCourse.code
            ? { ...c, name: editName, credit: editCredit, syllabus_url: editUrl }
            : c
        )
      }));

      setEditVisible(false);
    } catch (err) {
      alert("❌ Cập nhật thất bại.");
    }
  };

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
        style={{ fontFamily: "'Segoe UI', Roboto, Inter, sans-serif", fontWeight: 600 }}
      >
        <div className="facilities-list-page">
          <h2>Chương Trình Đào Tạo</h2>
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
              <div className="form-step" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>Chương Trình Đào Tạo - Khóa {program.khoa}</h3>
                <Button
                  icon="pi pi-plus"
                  className="p-button-rounded p-button-text"
                  onClick={() => setAddDialogVisible(true)}
                  tooltip="Thêm học phần từ CSDL"
                />
              </div>

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
                <Column header="Thao tác" body={(rowData) => (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-text p-button-sm"
                      onClick={() => handleEditCourse(rowData)}
                      tooltip="Sửa"
                    />
                    <Button
                      icon="pi pi-trash"
                      className="p-button-text p-button-sm p-button-danger"
                      onClick={() => handleDeleteCourse(rowData.code)}
                      tooltip="Xóa"
                    />
                  </div>
                )} />
              </DataTable>

              <Dialog header="Thêm học phần từ CSDL" visible={addDialogVisible} style={{ width: '40vw' }} onHide={() => setAddDialogVisible(false)} modal>
                <MultiSelect value={selectedCourseCodes} options={allCourses} onChange={(e) => setSelectedCourseCodes(e.value)} display="chip" placeholder="Chọn học phần" style={{ width: '100%' }} filter />
                <div style={{ marginTop: "1rem", textAlign: "right" }}>
                  <Button label="Thêm vào chương trình" className="p-button-sm" onClick={handleAddExistingCourses} disabled={selectedCourseCodes.length === 0} />
                </div>
              </Dialog>

              <Dialog
                header="Chỉnh sửa học phần"
                visible={editVisible}
                style={{ width: '30vw' }}
                onHide={() => setEditVisible(false)}
                modal
              >
                <div className="p-fluid">
                  <div className="field">
                    <label>Tên học phần</label>
                    <InputText value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Số tín chỉ</label>
                    <InputText
                      type="number"
                      value={editCredit}
                      onChange={(e) => setEditCredit(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Đề cương URL</label>
                    <InputText value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                  </div>
                  <div style={{ marginTop: "1rem", textAlign: "right" }}>
                    <Button label="Lưu thay đổi" className="p-button-sm" onClick={handleSaveEdit} />
                  </div>
                </div>
              </Dialog>
            </>
          )}
        </div>
      </main>
      <AdminFooter />
    </>
  );
};

export default ProgramListPage;
