import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import * as XLSX from 'xlsx';
import TeacherHeader from '../components/TeacherHeader';
import './TeacherClassesView.css';

const TeacherClassesView = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedNamHoc, setSelectedNamHoc] = useState(null);
  const [selectedHocKy, setSelectedHocKy] = useState(null);
  const [availableHocKy, setAvailableHocKy] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Tự động thiết lập năm học và học kỳ hiện tại
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() trả về 0-11
    const currentYear = currentDate.getFullYear();
    
    // Xác định học kỳ dựa trên tháng hiện tại
    let currentSemester = "";
    let academicYear = currentYear;
    
    if (currentMonth >= 9 || currentMonth <= 1) {
      // Tháng 9-12 và tháng 1: HK1
      currentSemester = "1";
      if (currentMonth >= 9) {
        academicYear = currentYear; // Năm học bắt đầu từ tháng 9
      } else {
        academicYear = currentYear - 1; // Tháng 1 thuộc năm học trước
      }
    } else if (currentMonth >= 2 && currentMonth <= 6) {
      // Tháng 2-6: HK2
      currentSemester = "2";
      academicYear = currentYear - 1;
    } else {
      // Tháng 7-8: HK3 (học hè)
      currentSemester = "3";
      academicYear = currentYear - 1;
    }
    
    // Fix: Hiện tại là tháng 8/2025, nên sẽ set thành HK1-2025
    if (currentMonth === 8 && currentYear === 2025) {
      currentSemester = "1";
      academicYear = 2025;
    }
    
    console.log(`Auto-detect: Month=${currentMonth}, Year=${currentYear} => Semester=${currentSemester}, Academic Year=${academicYear}`);
    
    setSelectedNamHoc(academicYear);
    setSelectedHocKy(currentSemester);
  }, []);

  // Lấy danh sách năm học và học kỳ
  useEffect(() => {
    fetchSemesters();
  }, []);

  // Cập nhật danh sách học kỳ khi chọn năm học
  useEffect(() => {
    if (selectedNamHoc) {
      const semesterData = semesters.find(s => s.nam_hoc === selectedNamHoc);
      if (semesterData) {
        const hocKyOptions = semesterData.hoc_ky_list.map(hk => ({
          label: hk === '1' ? 'Học kỳ 1' : hk === '2' ? 'Học kỳ 2' : 'Học kỳ 3',
          value: hk
        }));
        setAvailableHocKy(hocKyOptions);
        
        // Không tự động chọn học kỳ nữa vì đã có logic auto-detect
      } else {
        // Fallback khi không có dữ liệu từ backend
        const defaultHocKy = [
          { label: 'Học kỳ 1', value: '1' },
          { label: 'Học kỳ 2', value: '2' },
          { label: 'Học kỳ 3', value: '3' }
        ];
        setAvailableHocKy(defaultHocKy);
      }
    }
  }, [selectedNamHoc, semesters]);

  // Lấy danh sách lớp khi chọn học kỳ
  useEffect(() => {
    if (selectedNamHoc && selectedHocKy) {
      fetchClasses();
    }
  }, [selectedNamHoc, selectedHocKy]);

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher/semesters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSemesters(response.data);
      
      // Không tự động chọn năm học ở đây nữa vì đã có logic auto-detect
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học kỳ:', error);
    }
  };

  const fetchClasses = async () => {
    if (!selectedNamHoc || !selectedHocKy) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          nam_hoc: selectedNamHoc,
          hoc_ky: selectedHocKy
        }
      });
      
      setClasses(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lớp:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classData) => {
    setStudentLoading(true);
    setSelectedClass(classData);
    setShowStudentDialog(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/teacher/classes/${classData.class_id}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            nam_hoc: selectedNamHoc,
            hoc_ky: selectedHocKy
          }
        }
      );
      
      setStudents(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sinh viên:', error);
    } finally {
      setStudentLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!students.students || students.students.length === 0) {
      return;
    }

    const exportData = students.students.map((student, index) => ({
      'STT': index + 1,
      'Mã sinh viên': student.student_code,
      'Họ và tên': student.name,
      'Ngày sinh': student.dob || '',
      'Giới tính': student.gender || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách sinh viên");

    // Tạo tên file
    const fileName = `DanhSach_${students.class_info.ma_lop}_${selectedNamHoc}_HK${selectedHocKy}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const namHocOptions = semesters.map(s => ({
    label: `${s.nam_hoc}-${s.nam_hoc + 1}`,
    value: s.nam_hoc
  }));

  // Tạo danh sách năm học từ dữ liệu backend hoặc fallback
  const yearNow = new Date().getFullYear();
  const fallbackYears = Array.from({ length: 5 }, (_, i) => {
    const start = yearNow - i;
    return { label: `${start}-${start + 1}`, value: start };
  });

  // Sử dụng dữ liệu từ backend nếu có, otherwise dùng fallback
  const finalNamHocOptions = namHocOptions.length > 0 ? namHocOptions : fallbackYears;

  const subjectsTemplate = (rowData) => {
    return (
      <div className="subjects-list">
        {rowData.subjects.map((subject, index) => (
          <Badge 
            key={index} 
            value={subject.name} 
            className="subject-badge"
          />
        ))}
      </div>
    );
  };

  const studentCountTemplate = (rowData) => {
    return (
      <Badge 
        value={rowData.student_count} 
        severity="info"
      />
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-users"
        label="Xem sinh viên"
        className="p-button-sm p-button-outlined"
        onClick={() => fetchStudents(rowData)}
      />
    );
  };

  return (
    <div className="teacher-classes-view">
      <TeacherHeader />
      
      <div className="classes-content">
        <Card className="filter-card">
          <div className="filter-header">
            <h2>
              <i className="pi pi-book"></i>
              Danh sách lớp giảng dạy
            </h2>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label>Năm học:</label>
              <Dropdown
                value={selectedNamHoc}
                options={finalNamHocOptions}
                onChange={(e) => setSelectedNamHoc(e.value)}
                placeholder="Chọn năm học"
                className="filter-dropdown"
              />
            </div>
            
            <div className="filter-group">
              <label>Học kỳ:</label>
              <Dropdown
                value={selectedHocKy}
                options={availableHocKy}
                onChange={(e) => setSelectedHocKy(e.value)}
                placeholder="Chọn học kỳ"
                className="filter-dropdown"
                disabled={!selectedNamHoc}
              />
            </div>
          </div>
        </Card>

        {selectedNamHoc && selectedHocKy && (
          <Card className="classes-table-card">
            <div className="table-header">
              <h3>
                Danh sách lớp - Năm học {selectedNamHoc}-{selectedNamHoc + 1} - 
                Học kỳ {selectedHocKy}
              </h3>
              {classes.length > 0 && (
                <Badge 
                  value={`${classes.length} lớp`} 
                  severity="success"
                  className="class-count-badge"
                />
              )}
            </div>

            {loading ? (
              <div className="loading-container">
                <ProgressSpinner />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : classes.length > 0 ? (
              <DataTable
                value={classes}
                paginator
                rows={10}
                className="classes-table"
                emptyMessage="Không có dữ liệu"
              >
                <Column 
                  field="ma_lop" 
                  header="Mã lớp" 
                  sortable
                  className="class-code-column"
                />
                <Column 
                  field="khoa" 
                  header="Khóa" 
                  sortable
                />
                <Column 
                  header="Môn học giảng dạy" 
                  body={subjectsTemplate}
                  className="subjects-column"
                />
                <Column 
                  header="Số sinh viên" 
                  body={studentCountTemplate}
                  className="student-count-column"
                />
                <Column 
                  header="Thao tác" 
                  body={actionTemplate}
                  className="action-column"
                />
              </DataTable>
            ) : (
              <Message 
                severity="info" 
                text="Không có lớp nào trong học kỳ này" 
              />
            )}
          </Card>
        )}
      </div>

      {/* Dialog hiển thị danh sách sinh viên */}
      <Dialog
        header={`Danh sách sinh viên lớp ${selectedClass?.ma_lop || ''}`}
        visible={showStudentDialog}
        style={{ width: '80vw' }}
        onHide={() => {
          setShowStudentDialog(false);
          setStudents([]);
          setSelectedClass(null);
        }}
      >
        {studentLoading ? (
          <div className="loading-container">
            <ProgressSpinner />
            <p>Đang tải danh sách sinh viên...</p>
          </div>
        ) : students.students ? (
          <div>
            <div className="student-dialog-header">
              <div className="class-info">
                <h4>Thông tin lớp:</h4>
                <p><strong>Mã lớp:</strong> {students.class_info.ma_lop}</p>
                <p><strong>Khóa:</strong> {students.class_info.khoa}</p>
                <p><strong>Hệ đào tạo:</strong> {students.class_info.he_dao_tao}</p>
              </div>
              
              <div className="subjects-info">
                <h4>Môn học giảng dạy:</h4>
                <div className="subjects-badges">
                  {students.subjects.map((subject, index) => (
                    <Badge 
                      key={index} 
                      value={`${subject.code} - ${subject.name}`}
                      className="subject-badge-large"
                    />
                  ))}
                </div>
              </div>

              <div className="export-section">
                <Button
                  icon="pi pi-download"
                  label="Xuất Excel"
                  className="p-button-success"
                  onClick={exportToExcel}
                />
                <span className="total-students">
                  Tổng: {students.total_students} sinh viên
                </span>
              </div>
            </div>

            <DataTable
              value={students.students}
              paginator
              rows={10}
              className="students-table"
              emptyMessage="Không có sinh viên nào"
            >
              <Column 
                header="STT" 
                body={(data, options) => options.rowIndex + 1}
                style={{ width: '60px' }}
              />
              <Column 
                field="student_code" 
                header="Mã sinh viên" 
                sortable
              />
              <Column 
                field="name" 
                header="Họ và tên" 
                sortable
              />
              <Column 
                field="dob" 
                header="Ngày sinh" 
              />
              <Column 
                field="gender" 
                header="Giới tính" 
              />
            </DataTable>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
};

export default TeacherClassesView;
