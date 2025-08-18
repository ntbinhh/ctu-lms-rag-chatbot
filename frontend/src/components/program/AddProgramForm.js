import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { RadioButton } from "primereact/radiobutton";
import { Divider } from "primereact/divider";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";
import "./AddProgramForm.css";

const AddProgramForm = () => {
  const toast = useRef(null);
  const dt = useRef(null);
  
  const [khoa, setKhoa] = useState("");
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMajors, setLoadingMajors] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [selectMode, setSelectMode] = useState("paste"); // 'paste' | 'table'
  const [courseListText, setCourseListText] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Show toast notifications
  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Calculate statistics
  const getStatistics = () => {
    const courseCount = selectMode === "paste" 
      ? courseListText.split("\n").filter(line => line.trim()).length
      : selectedCourses.length;
    
    const totalCredits = selectMode === "table" 
      ? selectedCourses.reduce((sum, course) => sum + (course.credit || 0), 0)
      : 0;

    return { courseCount, totalCredits };
  };

  const stats = getStatistics();

  useEffect(() => {
    const loadMajors = async () => {
      try {
        setLoadingMajors(true);
        const response = await axios.get("http://localhost:8000/admin/majors");
        setMajors(response.data.map((m) => ({
          label: m.name,
          value: m.id
        })));
        showToast("success", "Thành công", "Đã tải danh sách ngành đào tạo");
      } catch (error) {
        console.error("Error loading majors:", error);
        showToast("error", "Lỗi", "Không thể tải danh sách ngành đào tạo");
      } finally {
        setLoadingMajors(false);
      }
    };

    loadMajors();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/admin/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
        showToast("success", "Thành công", "Đã tải danh sách học phần");
      } catch (error) {
        console.error("Error loading courses:", error);
        showToast("error", "Lỗi", "Không thể tải danh sách học phần");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    const course_codes =
      selectMode === "paste"
        ? courseListText.split("\n").map(c => c.trim()).filter(Boolean)
        : selectedCourses.map(c => c.code);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/admin/programs", {
        khoa,
        major_id: selectedMajor,
        course_codes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const successMsg = "Đã thêm chương trình đào tạo thành công!";
      setSuccess(successMsg);
      showToast("success", "Thành công", successMsg);
      
      // Reset form
      setKhoa("");
      setSelectedMajor(null);
      setSelectedCourses([]);
      setCourseListText("");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Thêm chương trình thất bại";
      setError(errorMsg);
      showToast("error", "Lỗi", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Clear form function
  const clearForm = () => {
    setKhoa("");
    setSelectedMajor(null);
    setSelectedCourses([]);
    setCourseListText("");
    setSuccess("");
    setError("");
    showToast("info", "Thông báo", "Đã xóa toàn bộ dữ liệu form");
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />

      <div className="add-program-page">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="page-title">
                <i className="pi pi-plus-circle"></i>
                Thêm chương trình đào tạo
                <small style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.8 }}>CTU Admin</small>
              </h1>
              <p className="page-subtitle">
                Hệ thống thêm chương trình đào tạo Trường Đại học Cần Thơ
                <br />
                Tạo mới chương trình đào tạo với danh sách học phần chi tiết
              </p>
              {stats.courseCount > 0 && (
                <div className="program-stats">
                  <div className="stat-item">
                    <span className="stat-number">{stats.courseCount}</span>
                    <span className="stat-label">Học phần</span>
                  </div>
                  {selectMode === "table" && (
                    <div className="stat-item">
                      <span className="stat-number">{stats.totalCredits}</span>
                      <span className="stat-label">Tín chỉ</span>
                    </div>
                  )}
                  <div className="stat-item">
                    <span className="stat-number">{selectMode === "paste" ? "Dán mã" : "Chọn bảng"}</span>
                    <span className="stat-label">Phương thức</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="success-message">
              <i className="pi pi-check-circle"></i>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <i className="pi pi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Main Form */}
          <Card className="form-card">
            <div className="form-header">
              <h3 className="form-title">
                <i className="pi pi-file-plus"></i>
                Thông tin chương trình đào tạo
              </h3>
              <div className="form-actions">
                <Button
                  icon="pi pi-refresh"
                  label="Xóa form"
                  className="p-button-outlined"
                  onClick={clearForm}
                  disabled={loading}
                />
              </div>
            </div>

            <Divider />

            <form onSubmit={handleSubmit} className="program-form">
              {/* Basic Information */}
              <div className="form-section">
                <h4 className="section-title">
                  <i className="pi pi-info-circle"></i>
                  Thông tin cơ bản
                </h4>
                
                <div className="form-grid">
                  <div className="form-field">
                    <FloatLabel>
                      <InputText 
                        id="khoa" 
                        value={khoa} 
                        onChange={(e) => setKhoa(e.target.value)}
                        className="modern-input"
                        disabled={loading}
                      />
                      <label htmlFor="khoa">Khóa đào tạo</label>
                    </FloatLabel>
                  </div>

                  <div className="form-field">
                    <label htmlFor="major-select" className="field-label">Ngành đào tạo</label>
                    <Dropdown
                      id="major-select"
                      value={selectedMajor}
                      options={majors}
                      onChange={(e) => setSelectedMajor(e.value)}
                      placeholder="Chọn ngành đào tạo"
                      className="modern-dropdown"
                      disabled={loading || loadingMajors}
                      loading={loadingMajors}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              {/* Course Selection Method */}
              <div className="form-section">
                <h4 className="section-title">
                  <i className="pi pi-cog"></i>
                  Phương thức chọn học phần
                </h4>
                
                <div className="radio-group">
                  <div className="radio-option">
                    <RadioButton
                      inputId="paste"
                      name="selectMode"
                      value="paste"
                      onChange={(e) => setSelectMode(e.value)}
                      checked={selectMode === "paste"}
                      disabled={loading}
                    />
                    <label htmlFor="paste" className="radio-label">
                      <i className="pi pi-clipboard"></i>
                      Dán danh sách mã học phần
                      <small>Nhập trực tiếp mã học phần, mỗi dòng một mã</small>
                    </label>
                  </div>
                  
                  <div className="radio-option">
                    <RadioButton
                      inputId="table"
                      name="selectMode"
                      value="table"
                      onChange={(e) => setSelectMode(e.value)}
                      checked={selectMode === "table"}
                      disabled={loading}
                    />
                    <label htmlFor="table" className="radio-label">
                      <i className="pi pi-table"></i>
                      Chọn từ bảng học phần
                      <small>Chọn học phần từ danh sách có sẵn trong hệ thống</small>
                    </label>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Course Input Section */}
              <div className="form-section">
                {selectMode === "paste" ? (
                  <>
                    <h4 className="section-title">
                      <i className="pi pi-list"></i>
                      Danh sách mã học phần
                    </h4>
                    <div className="form-field">
                      <label htmlFor="course-list" className="field-label">
                        Mã học phần (mỗi dòng một mã)
                      </label>
                      <InputTextarea
                        id="course-list"
                        value={courseListText}
                        onChange={(e) => setCourseListText(e.target.value)}
                        rows={12}
                        className="modern-textarea"
                        placeholder="Nhập mã học phần, mỗi dòng một mã. Ví dụ:&#10;QP010E&#10;TC005&#10;TV134E&#10;..."
                        disabled={loading}
                      />
                      {courseListText && (
                        <div className="input-info">
                          <Tag value={`${stats.courseCount} học phần`} severity="info" />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="section-title">
                      <i className="pi pi-table"></i>
                      Chọn học phần từ bảng
                    </h4>
                    <div className="table-container">
                      {loadingCourses ? (
                        <div className="loading-content">
                          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                          <p>Đang tải danh sách học phần...</p>
                        </div>
                      ) : (
                        <>
                          <div className="table-header">
                            <div className="table-info">
                              <h5>Danh sách học phần có sẵn</h5>
                              <div className="table-meta">
                                <Tag value={`${courses.length} học phần`} severity="info" />
                                <Tag value={`${selectedCourses.length} đã chọn`} severity="success" />
                              </div>
                            </div>
                          </div>
                          
                          <DataTable
                            ref={dt}
                            value={courses}
                            selection={selectedCourses}
                            onSelectionChange={(e) => setSelectedCourses(e.value)}
                            dataKey="code"
                            paginator 
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            filterDisplay="row"
                            responsiveLayout="scroll"
                            className="modern-table"
                            emptyMessage="Không tìm thấy học phần nào"
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} học phần"
                          >
                            <Column 
                              selectionMode="multiple" 
                              headerStyle={{ width: "3rem" }}
                              className="selection-column"
                            />
                            <Column 
                              field="code" 
                              header="Mã học phần" 
                              filter 
                              filterPlaceholder="Tìm theo mã"
                              style={{ minWidth: "120px" }}
                              sortable
                            />
                            <Column 
                              field="name" 
                              header="Tên học phần" 
                              filter 
                              filterPlaceholder="Tìm theo tên"
                              style={{ minWidth: "250px" }}
                              sortable
                            />
                            <Column 
                              field="credit" 
                              header="Số tín chỉ" 
                              style={{ width: "120px", textAlign: "center" }}
                              body={(rowData) => (
                                <Tag value={`${rowData.credit || 0} TC`} severity="info" />
                              )}
                              sortable
                            />
                          </DataTable>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Submit Section */}
              <Divider />
              
              <div className="submit-section">
                <div className="submit-info">
                  <h4>Xác nhận thông tin</h4>
                  <div className="summary-tags">
                    {khoa && <Tag value={`Khóa: ${khoa}`} severity="info" />}
                    {selectedMajor && majors.find(m => m.value === selectedMajor) && (
                      <Tag value={`Ngành: ${majors.find(m => m.value === selectedMajor).label}`} severity="success" />
                    )}
                    <Tag value={`${stats.courseCount} học phần`} severity="warning" />
                  </div>
                </div>
                
                <div className="submit-buttons">
                  <Button
                    type="button"
                    label="Xóa form"
                    icon="pi pi-times"
                    className="p-button-outlined p-button-secondary"
                    onClick={clearForm}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    label="Lưu chương trình"
                    icon="pi pi-save"
                    className="submit-btn"
                    disabled={
                      loading ||
                      !khoa ||
                      !selectedMajor ||
                      (selectMode === "paste"
                        ? courseListText.trim() === ""
                        : selectedCourses.length === 0)
                    }
                    loading={loading}
                  />
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <AdminFooter />
    </>
  );
};

export default AddProgramForm;
