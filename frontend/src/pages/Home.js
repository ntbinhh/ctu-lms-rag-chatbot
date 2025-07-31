import React, { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SliderSection from "./SliderSection"
import NewsSection from "./NewsSection";
import Chatbot from "../components/chatbot/Chatbot";
import FloatingChatbot from "../components/chatbot/FloatingChatbot";
import IntroductionSection from "../components/IntroductionSection";
import StatisticsSection from "../components/StatisticsSection";
import "../styles/modern-homepage.css";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Smooth loading animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="layout-wrapper">
      <Header />
      
      <main className="layout-main">
        {/* Modern Static Banner */}
        <section className="static-banner">
          <div className="section-container">
            <div className={`animate-fade-up ${isLoaded ? 'loaded' : ''}`}>
              <img
                src="/347.png"
                alt="Giới thiệu Trung tâm Liên kết Đào tạo - Đại học Cần Thơ"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* Dynamic Slider Section - Full Width */}
        <SliderSection />

        {/* Hero Section with Modern Design */}
        <section className="section-spacing">
          <div className="section-container">
            <HeroSection />
          </div>
        </section>

        {/* New Introduction Section */}
        <section className="section-spacing">
          <div className="section-container">
            <IntroductionSection />
          </div>
        </section>

        {/* Statistics Section */}
        <section className="section-spacing">
          <div className="section-container">
            <StatisticsSection />
          </div>
        </section>

        {/* Enhanced News Section */}
        <section className="section-spacing">
          <NewsSection />
        </section>

        {/* Floating Chatbot */}
        <FloatingChatbot />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
