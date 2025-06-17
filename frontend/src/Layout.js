// src/components/Layout.js
import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
