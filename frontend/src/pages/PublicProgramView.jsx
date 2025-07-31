import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Skeleton } from "primereact/skeleton";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import "./PublicProgramView.css";

const PublicProgramView = () => {
  // State management
  const [khoaList, setKhoaList] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const toast = useRef(null);
  const dt = useRef(null);

  // API endpoints
  const API_BASE = "http://localhost:8000";
  
  // Memoized values
  const filteredCourses = useMemo(() => {
    if (!program?.courses || !searchTerm) return program?.courses || [];
    
    return program.courses.filter(course => 
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [program?.courses, searchTerm]);

  const programStats = useMemo(() => {
    if (!program?.courses) return null;
    
    const totalCredits = program.courses.reduce((sum, course) => sum + (course.credit || 0), 0);
    const courseCount = program.courses.length;
    const coursesWithSyllabus = program.courses.filter(c => c.syllabus_url).length;
    
    return {
      totalCredits,
      courseCount,
      coursesWithSyllabus,
      syllabusPercentage: courseCount > 0 ? Math.round((coursesWithSyllabus / courseCount) * 100) : 0
    };
  }, [program?.courses]);

  // Utility functions
  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedKhoa(null);
    setSelectedFaculty(null);
    setSelectedMajor(null);
    setFaculties([]);
    setMajors([]);
    setProgram(null);
    setSearchTerm("");
    setSelectedCourse(null);
  }, []);

  // API calls with error handling
  useEffect(() => {
    const loadKhoaList = async () => {
      try {
        setInitialLoading(true);
        const response = await axios.get(`${API_BASE}/programs/years`);
        const khoaOptions = response.data.map(k => ({ label: `Khóa ${k}`, value: k }));
        setKhoaList(khoaOptions);
        showToast("success", "Thành công", "Đã tải danh sách khóa học");
      } catch (error) {
        console.error("Error loading khoa list:", error);
        showToast("error", "Lỗi", "Không thể tải danh sách khóa học");
      } finally {
        setInitialLoading(false);
      }
    };

    loadKhoaList();
  }, [showToast]);

  useEffect(() => {
    const loadFaculties = async () => {
      if (!selectedKhoa) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/programs/years/${selectedKhoa}/faculties`);
        setFaculties(response.data);
        
        // Reset dependent selections
        setSelectedFaculty(null);
        setMajors([]);
        setSelectedMajor(null);
        setProgram(null);
        
        showToast("success", "Thành công", `Đã tải ${response.data.length} khoa`);
      } catch (error) {
        console.error("Error loading faculties:", error);
        showToast("error", "Lỗi", "Không thể tải danh sách khoa");
        setFaculties([]);
      } finally {
        setLoading(false);
      }
    };

    loadFaculties();
  }, [selectedKhoa, showToast]);

  useEffect(() => {
    const loadMajors = async () => {
      if (!selectedFaculty) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/programs/years/${selectedKhoa}/faculties/${selectedFaculty}/majors`);
        setMajors(response.data);
        
        // Reset dependent selections
        setSelectedMajor(null);
        setProgram(null);
        
        showToast("info", "Thông báo", `Đã tải ${response.data.length} ngành học`);
      } catch (error) {
        console.error("Error loading majors:", error);
        showToast("error", "Lỗi", "Không thể tải danh sách ngành học");
        setMajors([]);
      } finally {
        setLoading(false);
      }
    };

    loadMajors();
  }, [selectedKhoa, selectedFaculty, showToast]);

  useEffect(() => {
    const loadProgram = async () => {
      if (!selectedMajor) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/programs/by_major?khoa=${selectedKhoa}&major_id=${selectedMajor}`);
        setProgram(response.data);
        
        const courseCount = response.data?.courses?.length || 0;
        showToast("success", "Thành công", `Đã tải chương trình với ${courseCount} học phần`);
      } catch (error) {
        console.error("Error loading program:", error);
        showToast("error", "Lỗi", "Không thể tải chương trình đào tạo");
        setProgram(null);
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [selectedKhoa, selectedMajor, showToast]);

  // Enhanced templates for DataTable
  const nameWithLinkTemplate = (rowData) => {
    const hasUrl = rowData.syllabus_url;
    return (
      <div className="course-name-cell">
        {hasUrl ? (
          <a
            href={rowData.syllabus_url}
            target="_blank"
            rel="noopener noreferrer"
            className="course-link"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="pi pi-external-link mr-2"></i>
            {rowData.name}
          </a>
        ) : (
          <span className="course-name">{rowData.name}</span>
        )}
        
      </div>
    );
  };

  const creditTemplate = (rowData) => (
    <div className="credit-cell">
      <Tag value={`${rowData.credit || 0} TC`} severity="info" />
    </div>
  );

  const codeTemplate = (rowData) => (
    <div className="code-cell">
      <strong>{rowData.code}</strong>
    </div>
  );

  const actionTemplate = (rowData) => (
    <div className="action-buttons">
      <Button
        icon="pi pi-info-circle"
        className="p-button-rounded p-button-text"
        onClick={() => setSelectedCourse(rowData)}
        tooltip="Xem chi tiết"
        tooltipOptions={{ position: 'top' }}
      />
      {rowData.syllabus_url && (
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-text"
          onClick={() => window.open(rowData.syllabus_url, '_blank')}
          tooltip="Tải đề cương"
          tooltipOptions={{ position: 'top' }}
        />
      )}
    </div>
  );

  // Export functions
  const exportCSV = useCallback(() => {
    if (dt.current) {
      dt.current.exportCSV();
      showToast("success", "Thành công", "Đã xuất dữ liệu CSV");
    }
  }, [showToast]);

  const exportPDF = useCallback(() => {
    // Placeholder for PDF export
    showToast("info", "Thông báo", "Tính năng xuất PDF đang được phát triển");
  }, [showToast]);

  return (
    <>
      <Header />
      <Toast ref={toast} />
      
      <div className="public-program-view">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="page-title">
                <i className="pi pi-graduation-cap"></i>
                Chương trình đào tạo
                <small style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.8 }}>CTU</small>
              </h1>
              <p className="page-subtitle">
                Hệ thống tra cứu chương trình đào tạo Trường Đại học Cần Thơ
                <br />
                Khám phá thông tin học phần, đề cương và kế hoạch học tập
              </p>
              {programStats && (
                <div className="program-stats">
                  <div className="stat-item">
                    <span className="stat-number">{programStats.courseCount}</span>
                    <span className="stat-label">Học phần</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{programStats.totalCredits}</span>
                    <span className="stat-label">Tín chỉ</span>
                  </div>
                  
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
                    placeholder="Chọn khóa đào tạo..."
                    className="w-full"
                    showClear
                    filter
                    disabled={loading}
                    emptyMessage="Không có dữ liệu khóa"
                  />
                )}
              </div>

              {/* Step 2: Khoa */}
              {selectedKhoa && (
                <div className="filter-step">
                  <label className="step-label">
                    <span className="step-number">2</span>
                    Chọn khoa/viện ({faculties.length} đơn vị)
                  </label>
                  {loading ? (
                    <div className="faculty-skeleton">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} width="150px" height="2.5rem" className="mr-2 mb-2" />
                      ))}
                    </div>
                  ) : (
                    <div className="faculty-buttons">
                      {faculties.map((faculty) => (
                        <Button
                          key={faculty.id}
                          label={faculty.name}
                          onClick={() => setSelectedFaculty(faculty.id)}
                          className={`faculty-btn ${selectedFaculty === faculty.id ? 'selected' : ''}`}
                          disabled={loading}
                          tooltip={`Xem các ngành của ${faculty.name}`}
                          tooltipOptions={{ position: 'top' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Ngành */}
              {selectedFaculty && majors.length > 0 && (
                <div className="filter-step">
                  <label className="step-label">
                    <span className="step-number">3</span>
                    Chọn ngành đào tạo ({majors.length} ngành)
                  </label>
                  {loading ? (
                    <div className="major-skeleton">
                      {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} width="200px" height="2.5rem" className="mr-2 mb-2" />
                      ))}
                    </div>
                  ) : (
                    <div className="major-buttons">
                      {majors.map((major) => (
                        <Button
                          key={major.id}
                          label={major.name}
                          onClick={() => setSelectedMajor(major.id)}
                          className={`major-btn ${selectedMajor === major.id ? 'selected' : ''}`}
                          disabled={loading}
                          tooltip={`Xem chương trình đào tạo ${major.name}`}
                          tooltipOptions={{ position: 'top' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card className="loading-card">
              <div className="loading-content">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                <p>Đang tải dữ liệu từ hệ thống ...</p>
              </div>
            </Card>
          )}

          {/* Program Data Table */}
          {program && (
            <Card className="program-card">
              <div className="program-header">
                <div className="program-info">
                  <h3 className="program-title">
                    <i className="pi pi-list-check"></i>
                    Danh sách học phần - CTU
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
                    />
                  </span>
                  <Button
                    icon="pi pi-download"
                    label="CSV"
                    onClick={exportCSV}
                    className="p-button-outlined"
                    tooltip="Xuất file CSV"
                  />
                  <Button
                    icon="pi pi-file-pdf"
                    label="PDF"
                    onClick={exportPDF}
                    className="p-button-outlined"
                    tooltip="Xuất file PDF"
                  />
                </div>
              </div>

              <Divider />

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
                selectionMode="single"
                selection={selectedCourse}
                onSelectionChange={(e) => setSelectedCourse(e.value)}
                dataKey="id"
                className="program-table"
              >
                <Column 
                  field="code" 
                  header="Mã học phần" 
                  body={codeTemplate}
                  sortable
                  style={{ minWidth: '120px' }}
                />
                <Column 
                  header="Tên học phần" 
                  body={nameWithLinkTemplate}
                  sortable
                  field="name"
                  style={{ minWidth: '300px' }}
                />
                <Column 
                  field="credit" 
                  header="Tín chỉ" 
                  body={creditTemplate}
                  sortable
                  style={{ minWidth: '100px', textAlign: 'center' }}
                />
                <Column 
                  header="Thao tác"
                  body={actionTemplate}
                  style={{ minWidth: '120px', textAlign: 'center' }}
                />
              </DataTable>
            </Card>
          )}

          {/* Course Detail Panel */}
          {selectedCourse && (
            <Panel header={`Chi tiết học phần: ${selectedCourse.name}`} toggleable collapsed>
              <div className="course-detail">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Mã học phần:</label>
                    <span>{selectedCourse.code}</span>
                  </div>
                  <div className="detail-item">
                    <label>Số tín chỉ:</label>
                    <Tag value={`${selectedCourse.credit || 0} TC`} severity="info" />
                  </div>
                  <div className="detail-item">
                    <label>Đề cương:</label>
                    {selectedCourse.syllabus_url ? (
                      <Button
                        label="Tải về"
                        icon="pi pi-download"
                        onClick={() => window.open(selectedCourse.syllabus_url, '_blank')}
                        className="p-button-link"
                      />
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </div>
                </div>
                {selectedCourse.description && (
                  <div className="course-description">
                    <label>Mô tả:</label>
                    <p>{selectedCourse.description}</p>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Empty State */}
          {!loading && !program && selectedMajor && (
            <Card className="empty-state">
              <div className="empty-content">
                <i className="pi pi-info-circle empty-icon"></i>
                <h3>Chưa có dữ liệu</h3>
                <p>Chương trình đào tạo cho ngành học này đang được cập nhật trong hệ thống CTU.</p>
                <Button
                  label="Thử lại"
                  icon="pi pi-refresh"
                  onClick={() => setSelectedMajor(null)}
                  className="p-button-outlined"
                />
              </div>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default PublicProgramView;