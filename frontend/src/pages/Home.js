import React from "react";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SliderSection from "./SliderSection"
import NewsSection from "./NewsSection";
const Home = () => {
  return (
    <div className="layout-wrapper">
      <Header />
      
      <main className="layout-main">
        <section className="static-banner" style={{ textAlign: "center", padding: "2rem 0" }}>
          <img
            src="/347.png"
            alt="Giới thiệu Trung tâm"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </section>
        <SliderSection />
        <HeroSection />
        <NewsSection />
        {/* Thêm các section khác ở đây nếu cần */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
