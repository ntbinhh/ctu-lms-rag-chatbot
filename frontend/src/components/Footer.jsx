import React from "react";

const Footer = () => {
  return (
    <footer style={{ background: "#0c4da2", color: "white", padding: "2rem 1rem", textAlign: "center" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        TRUNG TÂM LIÊN KẾT ĐÀO TẠO - TRƯỜNG ĐẠI HỌC CẦN THƠ
      </div>
      <div style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
        Địa chỉ: Tầng trệt - Nhà Điều hành Trường Đại học Cần Thơ - Khu II, đường 3/2, phường Xuân Khánh, quận Ninh Kiều, TPCT<br />
        Điện thoại: (0292) 3734370 - 3831634<br />
        Email: <a href="mailto:ttlkdt@ctu.edu.vn" style={{ color: "#ffffff", textDecoration: "underline" }}>
          ttlkdt@ctu.edu.vn
        </a>
      </div>
    </footer>
  );
};

export default Footer;
