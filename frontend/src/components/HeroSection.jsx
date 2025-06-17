import React from "react";

const HeroSection = () => (
  <div style={{
    backgroundImage: `url("/images/banner.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white"
  }}>
    <h1 style={{ fontSize: "2.5rem", backgroundColor: "rgba(0,0,0,0.4)", padding: "1rem" }}>
      TRUNG TÂM LIÊN KẾT ĐÀO TẠO - ĐẠI HỌC CẦN THƠ
    </h1>
  </div>
);


export default HeroSection;
