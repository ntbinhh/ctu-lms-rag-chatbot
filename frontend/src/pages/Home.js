import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      {/* Có thể thêm các section khác như giới thiệu, học tập, nghiên cứu... */}
      <Footer />
    </div>
  );
};

export default Home;
