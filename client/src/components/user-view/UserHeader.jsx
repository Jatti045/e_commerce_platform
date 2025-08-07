import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

const UserHeader = React.memo(() => {
  const navigate = useNavigate();

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Banner images and content data
  const bannerData = [
    {
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      title: "Discover Our Collection",
      subtitle: "Handpicked items that redefine style and comfort.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2148&q=80",
      title: "Premium Fashion",
      subtitle: "Elevate your wardrobe with our curated selection.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Seasonal Trends",
      subtitle: "Stay ahead with the latest fashion trends and styles.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      title: "Exclusive Deals",
      subtitle: "Don't miss out on our limited-time special offers.",
    },
  ];

  // Auto-rotation functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, bannerData.length]);

  // Manual navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [bannerData.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? bannerData.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [bannerData.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const currentBanner = bannerData[currentIndex];

  return (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] flex items-center justify-center overflow-hidden">
      {/* Carousel Images */}
      {bannerData.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
      ))}

      {/* Overlay for better text readability */}
      <div className="absolute w-full h-full inset-0 bg-black/30 sm:bg-black/25 dark:bg-black/40"></div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 border border-white/30"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 border border-white/30"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 text-center px-3 sm:px-4 md:px-6 lg:px-8 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
        <h1
          key={`title-${currentIndex}`}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-lg animate-fadeIn leading-tight"
        >
          {currentBanner.title}
        </h1>
        <p
          key={`subtitle-${currentIndex}`}
          className="mt-2 sm:mt-3 md:mt-4 px-2 sm:px-4 md:px-8 lg:px-12 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white/90 drop-shadow-md animate-fadeIn leading-relaxed"
        >
          {currentBanner.subtitle}
        </p>
        <Button
          onClick={() => navigate("/user/products")}
          className="mt-4 sm:mt-6 md:mt-8 bg-white hover:bg-gray-100 text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base rounded-lg font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20"
        >
          Explore Now
        </Button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border ${
              index === currentIndex
                ? "bg-white border-white scale-110 sm:scale-125 shadow-lg"
                : "bg-white/50 border-white/70 hover:bg-white/70 backdrop-blur-sm"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 z-20">
        <div
          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-white/50 ${
            isAutoPlaying ? "bg-green-400 animate-pulse" : "bg-white/50"
          }`}
        />
      </div>
    </div>
  );
});

export default UserHeader;
