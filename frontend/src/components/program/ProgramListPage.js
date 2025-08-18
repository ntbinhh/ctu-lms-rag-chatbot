import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";
import "./ProgramListPage.css";

const ProgramListPage = () => {
  const toast = useRef(null);
  const dt = useRef(null);
  
  const [khoaList, setKhoaList] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [program, setProgram] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCredit, setEditCredit] = useState(0);
  const [editUrl, setEditUrl] = useState("");

  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseCodes, setSelectedCourseCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Show toast notifications
  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Reset all selections
  const resetSelection = () => {
    setSelectedKhoa(null);
    setSelectedFaculty(null);
    setSelectedMajor(null);
    setFaculties([]);
    setMajors([]);
    setProgram(null);
    setSearchTerm("");
    setError("");
  };

  // Calculate program statistics
  const programStats = useMemo(() => {
    if (!program?.courses) return null;
    
    const filteredCourses = program.courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      courseCount: filteredCourses.length,
      totalCredits: filteredCourses.reduce((sum, course) => sum + (course.credit || 0), 0),
      totalCourses: program.courses.length,
      searchResults: searchTerm ? filteredCourses.length : program.courses.length
    };
  }, [program, searchTerm]);

  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    if (!program?.courses) return [];
    
    return program.courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [program?.courses, searchTerm]);

  const handleDeleteCourse = async (code) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa học phần này khỏi chương trình?")) return;

    try {
      setLoading(true);
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
      
      showToast("success", "Thành công", "Đã xóa học phần khỏi chương trình");
    } catch (err) {
      console.error("Delete course error:", err);
      showToast("error", "Lỗi", "Xóa học phần thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingCourses = async () => {
    try {
      setLoading(true);
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
      showToast("success", "Thành công", `Đã thêm ${selectedCourseCodes.length} học phần vào chương trình`);
    } catch (err) {
      console.error("Add courses error:", err);
      showToast("error", "Lỗi", "Thêm học phần thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadKhoaList = async () => {
      try {
        setInitialLoading(true);
        const response = await axios.get("http://localhost:8000/programs/years");
        const khoaOptions = response.data.map(k => ({ label: `Khóa ${k}`, value: k }));
        setKhoaList(khoaOptions);
        showToast("success", "Thành công", "Đã tải danh sách khóa học");
      } catch (error) {
        console.error("Error loading khoa list:", error);
        setError("Không thể tải danh sách khóa");
        showToast("error", "Lỗi", "Không thể tải danh sách khóa học");
      } finally {
        setInitialLoading(false);
      }
    };

    loadKhoaList();
  }, []);

  useEffect(() => {
    if (selectedKhoa) {
      const loadFaculties = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8000/programs/years/${selectedKhoa}/faculties`);
          setFaculties(response.data);
          showToast("success", "Thành công", "Đã tải danh sách khoa");
        } catch (error) {
          console.error("Error loading faculties:", error);
          setError("Không thể tải danh sách khoa");
          showToast("error", "Lỗi", "Không thể tải danh sách khoa");
        } finally {
          setLoading(false);
        }
      };

      loadFaculties();
      setSelectedFaculty(null);
      setMajors([]);
      setSelectedMajor(null);
      setProgram(null);
    }
  }, [selectedKhoa]);

  useEffect(() => {
    if (selectedFaculty) {
      const loadMajors = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8000/programs/years/${selectedKhoa}/faculties/${selectedFaculty}/majors`);
          setMajors(response.data);
          showToast("success", "Thành công", "Đã tải danh sách ngành");
        } catch (error) {
          console.error("Error loading majors:", error);
          setError("Không thể tải danh sách ngành");
          showToast("error", "Lỗi", "Không thể tải danh sách ngành");
        } finally {
          setLoading(false);
        }
      };

      loadMajors();
      setSelectedMajor(null);
      setProgram(null);
    }
  }, [selectedKhoa, selectedFaculty]); // Added selectedKhoa as dependency

  useEffect(() => {
    if (selectedMajor) {
      const loadProgram = async () => {
        try {
          setLoading(true);
          const [programResponse, coursesResponse] = await Promise.all([
            axios.get(`http://localhost:8000/programs/by_major?khoa=${selectedKhoa}&major_id=${selectedMajor}`),
            axios.get("http://localhost:8000/admin/courses", {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
          ]);

          setProgram(programResponse.data);
          setAllCourses(coursesResponse.data.map(c => ({
            label: `${c.code} - ${c.name}`,
            value: c.code,
            name: c.name,
            credit: c.credit,
            syllabus_url: c.syllabus_url
          })));
          
          showToast("success", "Thành công", "Đã tải chương trình đào tạo");
        } catch (error) {
          console.error("Error loading program:", error);
          setError("Không thể tải chương trình đào tạo");
          showToast("error", "Lỗi", "Không thể tải chương trình đào tạo");
        } finally {
          setLoading(false);
        }
      };

      loadProgram();
    }
  }, [selectedKhoa, selectedMajor]); // Added selectedKhoa as dependency

  const handleEditCourse = (course) => {
    setEditCourse(course);
    setEditName(course.name);
    setEditCredit(course.credit);
    setEditUrl(course.syllabus_url || "");
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
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
      showToast("success", "Thành công", "Đã cập nhật thông tin học phần");
    } catch (err) {
      console.error("Update course error:", err);
      showToast("error", "Lỗi", "Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Export CSV function
  const exportCSV = () => {
    if (dt.current) {
      dt.current.exportCSV();
    }
  };

  // Course templates for enhanced display
  const nameTemplate = (rowData) => {
    return (
      <div className="course-name">
        <i className="pi pi-book"></i>
        <span>{rowData.name}</span>
      </div>
    );
  };

  const codeTemplate = (rowData) => {
    return (
      <div className="course-code">
        <i className="pi pi-tag"></i>
        <span>{rowData.code}</span>
      </div>
    );
  };

  const creditTemplate = (rowData) => {
    return (
      <Tag value={`${rowData.credit || 0} TC`} severity="info" />
    );
  };

  const syllabusTemplate = (rowData) => {
    return rowData.syllabus_url ? (
      <Button
        label="Tải về"
        icon="pi pi-download"
        onClick={() => window.open(rowData.syllabus_url, '_blank')}
        className="p-button-link"
        size="small"
      />
    ) : (
      <span className="text-muted">Chưa có</span>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="action-buttons">
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-sm"
          onClick={() => handleEditCourse(rowData)}
          tooltip="Chỉnh sửa"
          disabled={loading}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => handleDeleteCourse(rowData.code)}
          tooltip="Xóa"
          disabled={loading}
        />
      </div>
    );
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />

      <div className="admin-program-list-page">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="page-title">
                <i className="pi pi-graduation-cap"></i>
                Quản lý chương trình đào tạo
                <small style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.8 }}>CTU Admin</small>
              </h1>
              <p className="page-subtitle">
                Hệ thống quản lý chương trình đào tạo Trường Đại học Cần Thơ
                <br />
                Thêm, sửa, xóa học phần và quản lý đề cương môn học
              </p>
              {programStats && (
                <div className="program-stats">
                  <div className="stat-item">
                    <span className="stat-number">{programStats.totalCourses}</span>
                    <span className="stat-label">Tổng học phần</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{programStats.totalCredits}</span>
                    <span className="stat-label">Tổng tín chỉ</span>
                  </div>
                  {searchTerm && (
                    <div className="stat-item">
                      <span className="stat-number">{programStats.searchResults}</span>
                      <span className="stat-label">Kết quả tìm kiếm</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <Card className="filter-card">
            <div className="filter-header">
              <h3>
                <i className="pi pi-search"></i>
                Tìm kiếm chương trình đào tạo
              </h3>
              <Button
                icon="pi pi-refresh"
                label="Làm mới"
                className="p-button-outlined"
                onClick={resetSelection}
                disabled={loading}
                style={{ color: 'white', borderColor: 'white' }}
              />
            </div>

            <div className="filter-content">
              {/* Step 1: Khóa */}
              <div className="filter-step">
                <label htmlFor="khoa-select" className="step-label">
                  <span className="step-number">1</span>
                  Chọn khóa đào tạo
                </label>
                {initialLoading ? (
                  <Skeleton width="100%" height="3rem" />
                ) : (
                  <Dropdown
                    id="khoa-select"
                    value={selectedKhoa}
                    options={khoaList}
                    onChange={(e) => setSelectedKhoa(e.value)}
                    placeholder="Chọn khóa đào tạo"
                    className="filter-dropdown"
                    disabled={loading}
                  />
                )}
              </div>

              {/* Step 2: Faculty Selection */}
              {selectedKhoa && (
                <div className="filter-step">
                  <label className="step-label">
                    <span className="step-number">2</span>
                    Chọn khoa
                  </label>
                  {loading ? (
                    <div className="skeleton-buttons">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} width="120px" height="2.5rem" />
                      ))}
                    </div>
                  ) : (
                    <div className="faculty-buttons">
                      {faculties.map((f) => (
                        <Button
                          key={f.id}
                          label={f.name}
                          onClick={() => setSelectedFaculty(f.id)}
                          className={`faculty-btn ${selectedFaculty === f.id ? "selected" : ""}`}
                          disabled={loading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Major Selection */}
              {selectedFaculty && majors.length > 0 && (
                <div className="filter-step">
                  <label className="step-label">
                    <span className="step-number">3</span>
                    Chọn ngành đào tạo
                  </label>
                  {loading ? (
                    <div className="skeleton-buttons">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} width="150px" height="2.5rem" />
                      ))}
                    </div>
                  ) : (
                    <div className="major-buttons">
                      {majors.map((m) => (
                        <Button
                          key={m.id}
                          label={m.name}
                          onClick={() => setSelectedMajor(m.id)}
                          className={`major-btn ${selectedMajor === m.id ? "selected" : ""}`}
                          disabled={loading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <i className="pi pi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Program Content */}
          {program && (
            <Card className="program-content">
              <div className="program-header">
                <div className="program-info">
                  <h3 className="program-title">
                    <i className="pi pi-list-check"></i>
                    Danh sách học phần - CTU Admin
                  </h3>
                  <div className="program-meta">
                    <Tag value={`${filteredCourses.length} học phần`} severity="info" />
                    <Tag value={`${programStats.totalCredits} tín chỉ`} severity="success" />
                    <Badge value="CTU" severity="warning" />
                  </div>
                </div>
                
                <div className="program-actions">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm học phần..."
                      className="search-input"
                      disabled={loading}
                    />
                  </span>
                  <Button
                    icon="pi pi-download"
                    label="CSV"
                    onClick={exportCSV}
                    className="p-button-outlined"
                    tooltip="Xuất file CSV"
                    disabled={loading}
                  />
                  <Button
                    icon="pi pi-plus"
                    label="Thêm học phần"
                    onClick={() => setAddDialogVisible(true)}
                    className="add-course-btn"
                    disabled={loading}
                  />
                  <Button
                    icon="pi pi-trash"
                    label="Xóa CT"
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ chương trình đào tạo này?")) {
                        try {
                          setLoading(true);
                          await axios.delete("http://localhost:8000/admin/programs/delete_program", {
                            data: { khoa: selectedKhoa, major_id: selectedMajor },
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                              "Content-Type": "application/json"
                            }
                          });
                          setProgram(null);
                          showToast("success", "Thành công", "Đã xóa chương trình đào tạo");
                        } catch (err) {
                          console.error("Delete program error:", err);
                          showToast("error", "Lỗi", "Xóa chương trình thất bại");
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="p-button-danger p-button-outlined"
                    tooltip="Xóa toàn bộ chương trình"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="loading-content">
                  <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                  <p>Đang xử lý...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                /* Empty State */
                <div className="empty-state">
                  <i className="pi pi-info-circle empty-icon"></i>
                  <h3>{searchTerm ? "Không tìm thấy học phần" : "Chưa có học phần nào"}</h3>
                  <p>
                    {searchTerm 
                      ? `Không có học phần nào phù hợp với từ khóa "${searchTerm}".`
                      : "Chương trình đào tạo này chưa có học phần nào. Hãy thêm học phần đầu tiên."
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      label="Thêm học phần"
                      icon="pi pi-plus"
                      onClick={() => setAddDialogVisible(true)}
                      className="add-course-btn"
                      style={{ marginTop: '1rem' }}
                    />
                  )}
                </div>
              ) : (
                /* DataTable */
                <DataTable
                  ref={dt}
                  value={filteredCourses}
                  responsiveLayout="scroll"
                  stripedRows
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} học phần"
                  emptyMessage="Không tìm thấy học phần nào"
                  loading={loading}
                  dataKey="code"
                  className="program-table"
                >
                  <Column
                    header="STT"
                    body={(_, { rowIndex }) => rowIndex + 1}
                    style={{ width: "80px", textAlign: "center" }}
                  />
                  <Column 
                    field="code" 
                    header="Mã học phần" 
                    body={codeTemplate}
                    sortable
                    style={{ minWidth: "120px" }}
                  />
                  <Column 
                    field="name" 
                    header="Tên học phần" 
                    body={nameTemplate}
                    sortable
                    style={{ minWidth: "250px" }}
                  />
                  <Column 
                    field="credit" 
                    header="Số tín chỉ" 
                    body={creditTemplate}
                    sortable
                    style={{ width: "120px", textAlign: "center" }}
                  />
                  <Column
                    header="Đề cương"
                    body={syllabusTemplate}
                    style={{ width: "120px", textAlign: "center" }}
                  />
                  <Column
                    header="Thao tác"
                    body={actionTemplate}
                    style={{ width: "140px", textAlign: "center" }}
                  />
                </DataTable>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog 
        header="Thêm học phần từ CSDL" 
        visible={addDialogVisible} 
        style={{ width: '50vw' }} 
        onHide={() => setAddDialogVisible(false)} 
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="course-select">Chọn học phần</label>
            <MultiSelect 
              id="course-select"
              value={selectedCourseCodes} 
              options={allCourses} 
              onChange={(e) => setSelectedCourseCodes(e.value)} 
              display="chip" 
              placeholder="Chọn học phần cần thêm" 
              style={{ width: '100%' }} 
              filter 
              disabled={loading}
            />
          </div>
          <div className="dialog-footer">
            <Button 
              label="Hủy" 
              icon="pi pi-times" 
              onClick={() => setAddDialogVisible(false)}
              className="p-button-text" 
              disabled={loading}
            />
            <Button 
              label="Thêm vào chương trình" 
              icon="pi pi-check"
              onClick={handleAddExistingCourses} 
              disabled={selectedCourseCodes.length === 0 || loading}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Chỉnh sửa học phần"
        visible={editVisible}
        style={{ width: '40vw' }}
        onHide={() => setEditVisible(false)}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="edit-name">Tên học phần</label>
            <InputText 
              id="edit-name"
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-credit">Số tín chỉ</label>
            <InputText
              id="edit-credit"
              type="number"
              value={editCredit}
              onChange={(e) => setEditCredit(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-url">Đề cương URL</label>
            <InputText 
              id="edit-url"
              value={editUrl} 
              onChange={(e) => setEditUrl(e.target.value)} 
              disabled={loading}
            />
          </div>
          <div className="dialog-footer">
            <Button 
              label="Hủy" 
              icon="pi pi-times" 
              onClick={() => setEditVisible(false)}
              className="p-button-text" 
              disabled={loading}
            />
            <Button 
              label="Lưu thay đổi" 
              icon="pi pi-check"
              onClick={handleSaveEdit}
              disabled={loading}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>

      <AdminFooter />
    </>
  );
};

export default ProgramListPage;
