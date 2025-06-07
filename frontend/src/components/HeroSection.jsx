import React from "react";

const HeroSection = () => {
  return (
    <section className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: "url('https://www.stanford.edu/wp-content/uploads/2023/06/0620-Commencement-496.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-center px-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Stanford University</h1>
          <p className="text-lg md:text-2xl">Exploring knowledge. Changing the world.</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
