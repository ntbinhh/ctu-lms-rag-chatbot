import React from "react";
import "./AdminFooter.css";

const AdminFooter = () => (
  <footer className="ctu-admin-footer">
    <div className="ctu-footer-container">
      <div className="ctu-footer-grid">
        {/* Địa chỉ */}
        <div className="ctu-footer-section">
          <h4>Địa chỉ</h4>
          <p>
            Tầng trệt - Nhà Điều hành<br />
            Trường Đại học Cần Thơ<br />
            Khu II, đường 3/2, phường Xuân Khánh<br />
            Quận Ninh Kiều, TP. Cần Thơ
          </p>
        </div>
        
        {/* Liên hệ */}
        <div className="ctu-footer-section">
          <h4>Liên hệ</h4>
          <p>
            <i className="pi pi-phone"></i>
            (0292) 3734370 - 3831634
          </p>
          <p>
            <i className="pi pi-envelope"></i>
            ttlkdt@ctu.edu.vn
          </p>
          <p>
            <i className="pi pi-globe"></i>
            www.ctu.edu.vn
          </p>
        </div>
        
        {/* Thông tin */}
        <div className="ctu-footer-section">
          <h4>Trung tâm Liên kết Đào tạo</h4>
          <p>
            Trường Đại học Cần Thơ
          </p>
          <p>
            Hệ thống quản lý đào tạo và tuyển sinh
          </p>
        </div>
      </div>
      
      <div className="ctu-footer-bottom">
        <small>&copy; {new Date().getFullYear()} Trung tâm Liên kết Đào tạo - Đại học Cần Thơ. All rights reserved.</small>
      </div>
    </div>
  </footer>
);

export default AdminFooter;