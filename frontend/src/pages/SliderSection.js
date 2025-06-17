import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SliderSection.css"; // import CSS riêng

const SliderSection = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:8000/home/slider-images")
      .then(res => setImages(res.data))
      .catch(() => setImages([]));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [images, current]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="slider-wrapper">
      <div className="slider-container">
        {images.map((img, index) => (
          <img
            key={index}
            src={`http://localhost:8000${img.url}`}
            alt={`slide-${index}`}
            className={`slider-image ${index === current ? "active" : ""}`}
          />
        ))}
        <button className="nav-button prev" onClick={handlePrev}>‹</button>
        <button className="nav-button next" onClick={handleNext}>›</button>
      </div>
    </div>
  );
};

export default SliderSection;
