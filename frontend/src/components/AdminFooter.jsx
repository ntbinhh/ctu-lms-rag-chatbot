import React from "react";

const AdminFooter = () => (
  <footer className="bg-blue-900 text-white p-3 text-center">
    <small>&copy; {new Date().getFullYear()} Admin Dashboard</small>
  </footer>
);

export default AdminFooter;