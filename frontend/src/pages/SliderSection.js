import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SliderSection.css";

const SliderSection = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:8000/home/slider-images");
        setImages(response.data || []);
      } catch (error) {
        console.error("Error fetching slider images:", error);
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (images.length === 0) return;

    const autoPlay = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(autoPlay);
  }, [images.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="slider-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // No images state
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        {/* Images */}
        <div 
          className="slider-images"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:8000${image.url}`}
              alt={image.title || `Slide ${index + 1}`}
              className="slider-image"
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="slider-nav prev"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          &#8249;
        </button>
        
        <button 
          className="slider-nav next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          &#8250;
        </button>

        {/* Dots Indicator */}
        <div className="slider-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SliderSection;
