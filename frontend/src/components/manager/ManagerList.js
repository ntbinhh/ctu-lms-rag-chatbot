import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./ManagerList.css";
import AdminHeader from "../AdminHeader";
import AdminFooter from "../Footer";

const ManagerListPage = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const toast = useRef(null);
  const navigate = useNavigate();
  const dt = useRef(null);

  // Memoized filtered managers
  const filteredManagers = useMemo(() => {
    if (!globalFilterValue) return managers;
    
    return managers.filter(manager => 
      manager.full_name?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      manager.phone?.toLowerCase().includes(globalFilterValue.toLowerCase()) ||
      manager.facility_name?.toLowerCase().includes(globalFilterValue.toLowerCase())
    );
  }, [managers, globalFilterValue]);

  // Memoized manager statistics
  const managerStats = useMemo(() => {
    const totalManagers = managers.length;
    const activeManagers = managers.filter(m => m.status === "active").length;
    const inactiveManagers = totalManagers - activeManagers;
    
    return {
      totalManagers,
      activeManagers,
      inactiveManagers,
      searchResults: filteredManagers.length
    };
  }, [managers, filteredManagers]);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 4000 });
  };

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/admin/users/managers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setManagers(res.data);
      showToast("success", "Thành công", `Đã tải ${res.data.length} người quản lý`);
    } catch (err) {
      console.error("❌ Không thể tải danh sách quản lý:", err);
      const errorMsg = "Không thể tải danh sách quản lý.";
      setError(errorMsg);
      showToast("error", "Lỗi", errorMsg);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus, managerName) => {
    const action = currentStatus === "active" ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${managerName}"?`)) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/admin/users/managers/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showToast("success", "Thành công", `Đã ${action} tài khoản "${managerName}"`);
      fetchManagers();
    } catch (err) {
      console.error("Lỗi đổi trạng thái:", err);
      if (err.response?.status === 401) {
        showToast("error", "Lỗi xác thực", "Phiên đăng nhập đã hết hạn");
      } else if (err.response?.status === 403) {
        showToast("error", "Không có quyền", "Bạn không có quyền thực hiện thao tác này");
      } else {
        showToast("error", "Lỗi", "Không thể thay đổi trạng thái");
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced templates for DataTable
  const nameTemplate = (rowData) => (
    <div className="manager-name-cell">
      <strong className="manager-name">{rowData.full_name}</strong>
    </div>
  );

  const phoneTemplate = (rowData) => (
    <div className="phone-cell">
      <i className="pi pi-phone mr-2"></i>
      {rowData.phone || "Chưa có"}
    </div>
  );

  const facilityTemplate = (rowData) => (
    <div className="facility-cell">
      <i className="pi pi-building mr-2"></i>
      {rowData.facility_name || "Chưa xác định"}
    </div>
  );

  const statusTemplate = (rowData) => (
    <Tag 
      value={rowData.status === "active" ? "Hoạt động" : "Bị khóa"}
      severity={rowData.status === "active" ? "success" : "danger"}
      className="status-badge"
    />
  );

  const actionTemplate = (rowData) => (
    <div className="action-buttons">
      <Button
        label={rowData.status === "active" ? "Khóa" : "Mở khóa"}
        icon={rowData.status === "active" ? "pi pi-lock" : "pi pi-lock-open"}
        className={`action-button ${
          rowData.status === "active" ? "lock-button" : "unlock-button"
        }`}
        onClick={() => handleToggleStatus(rowData.id, rowData.status, rowData.full_name)}
        disabled={loading}
        tooltip={`${rowData.status === "active" ? "Khóa" : "Mở khóa"} tài khoản ${rowData.full_name}`}
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  // Export function
  const exportCSV = () => {
    if (dt.current) {
      dt.current.exportCSV();
      showToast("success", "Thành công", "Đã xuất dữ liệu CSV");
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);  // fetchManagers is stable and doesn't change

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  return (
    <>
      <AdminHeader />
      <Toast ref={toast} />

      <div className="manager-list-page">
        <div className="container">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="page-title">
                <i className="pi pi-users"></i>
                Quản lý người dùng
                <small style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.8 }}>CTU</small>
              </h1>
              <p className="page-subtitle">
                Hệ thống quản lý tài khoản người quản lý Trường Đại học Cần Thơ
                <br />
                Theo dõi, kiểm soát và quản lý quyền truy cập của người quản lý
              </p>
              {managerStats && (
                <div className="manager-stats">
                  <div className="stat-item">
                    <span className="stat-number">{managerStats.totalManagers}</span>
                    <span className="stat-label">Tổng quản lý</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{managerStats.activeManagers}</span>
                    <span className="stat-label">Đang hoạt động</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{managerStats.inactiveManagers}</span>
                    <span className="stat-label">Bị khóa</span>
                  </div>
                  {globalFilterValue && (
                    <div className="stat-item">
                      <span className="stat-number">{managerStats.searchResults}</span>
                      <span className="stat-label">Kết quả tìm kiếm</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <div>
              <h3 className="section-title">
                <i className="pi pi-list"></i>
                Danh sách người quản lý
              </h3>
            </div>
            
            <div className="action-buttons">
              <Button
                icon="pi pi-refresh"
                label="Làm mới"
                className="refresh-button"
                onClick={fetchManagers}
                disabled={loading}
              />
              
              <Button
                icon="pi pi-plus"
                label="Thêm quản lý"
                className="add-button"
                onClick={() => navigate("/admin/users/managers/add")}
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading State */}
          {loading ? (
            <div className="manager-container">
              <div className="loading-content" style={{ textAlign: 'center', padding: '4rem' }}>
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                <p style={{ marginTop: '1rem', color: 'var(--ctu-dark)' }}>Đang tải danh sách người quản lý...</p>
              </div>
            </div>
          ) : (
            /* Manager Table */
            <div className="manager-container">
              <div className="table-header">
                <div className="table-info">
                  <h3 className="table-title">
                    <i className="pi pi-table"></i>
                    Bảng quản lý tài khoản - CTU
                  </h3>
                  <div className="table-meta">
                    <Tag value={`${filteredManagers.length} người quản lý`} severity="info" />
                    <Tag value={`${managerStats.activeManagers} hoạt động`} severity="success" />
                    <Tag value={`${managerStats.inactiveManagers} bị khóa`} severity="danger" />
                  </div>
                </div>
                
                <div className="table-actions">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      value={globalFilterValue}
                      onChange={onGlobalFilterChange}
                      placeholder="Tìm kiếm theo tên, SĐT hoặc cơ sở..."
                      className="search-input"
                      disabled={loading}
                    />
                  </span>
                  <Button
                    icon="pi pi-download"
                    label="CSV"
                    onClick={exportCSV}
                    className="refresh-button"
                    tooltip="Xuất file CSV"
                    disabled={loading}
                  />
                </div>
              </div>

              {filteredManagers.length === 0 ? (
                <div className="empty-state">
                  <i className="pi pi-info-circle empty-icon"></i>
                  <h3>{globalFilterValue ? "Không tìm thấy người quản lý" : "Chưa có người quản lý nào"}</h3>
                  <p>
                    {globalFilterValue 
                      ? `Không có người quản lý nào phù hợp với từ khóa "${globalFilterValue}".`
                      : "Hệ thống chưa có người quản lý nào. Hãy thêm người quản lý đầu tiên."
                    }
                  </p>
                  {!globalFilterValue && (
                    <Button
                      label="Thêm người quản lý"
                      icon="pi pi-plus"
                      onClick={() => navigate("/admin/users/managers/add")}
                      className="add-button"
                      style={{ marginTop: '1rem' }}
                    />
                  )}
                </div>
              ) : (
                <DataTable
                  ref={dt}
                  value={filteredManagers}
                  responsiveLayout="scroll"
                  stripedRows
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} người quản lý"
                  emptyMessage="Không tìm thấy người quản lý nào"
                  loading={loading}
                  dataKey="id"
                  className="manager-table"
                  filters={filters}
                  globalFilterFields={["full_name", "phone", "facility_name"]}
                >
                  <Column
                    header="STT"
                    body={(_, { rowIndex }) => rowIndex + 1}
                    style={{ width: "80px", textAlign: "center" }}
                  />
                  <Column 
                    field="full_name" 
                    header="Họ và tên" 
                    body={nameTemplate}
                    sortable
                    style={{ minWidth: "200px" }}
                  />
                  <Column 
                    field="phone" 
                    header="Số điện thoại" 
                    body={phoneTemplate}
                    style={{ minWidth: "150px" }}
                  />
                  <Column 
                    field="facility_name" 
                    header="Cơ sở liên kết" 
                    body={facilityTemplate}
                    sortable
                    style={{ minWidth: "200px" }}
                  />
                  <Column
                    field="status"
                    header="Trạng thái"
                    body={statusTemplate}
                    style={{ width: "140px", textAlign: "center" }}
                    sortable
                  />
                  <Column
                    header="Hành động"
                    body={actionTemplate}
                    style={{ width: "140px", textAlign: "center" }}
                  />
                </DataTable>
              )}
            </div>
          )}
        </div>
      </div>

      <AdminFooter />
    </>
  );
};

export default ManagerListPage;
