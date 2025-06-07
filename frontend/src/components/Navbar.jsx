import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="bg-red-700 text-white py-4 px-6 flex justify-between items-center">
      <div className="text-xl font-bold">Stanford</div>
      <ul className="flex space-x-4">
        <li><a href="#about" className="hover:underline">About</a></li>
        <li><a href="#academics" className="hover:underline">Academics</a></li>
        <li><a href="#research" className="hover:underline">Research</a></li>
        <li><a href="#admission" className="hover:underline">Admission</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
