// HeroSection.jsx
import React from "react";
import BannerBackground from "../assets/images/home_banner_bg.png";
import PawBg from "../assets/images/paw.png";

const HeroSection = ({
  title = "Find the Best Sitter for You and Your Pet!",
  subtitle = "Book a Service or Become a Pet Sitter",
  buttonText = "Get Started",
  onButtonClick,
}) => {
  return (
    <section id="home" className="relative w-full scroll-mt-28">
      <div className="home-banner-container relative z-0">
        <img
          src={BannerBackground}
          alt="Hero background shape"
          className="w-full object-cover md:object-fill h-[400px] md:h-[700px]"
        />

        {/* Decorative paw images */}
        <img
          src={PawBg}
          alt="paw"
          className="absolute top-10 left-5 w-10 md:w-12 h-10 md:h-12 rotate-12 opacity-80"
        />
        <img
          src={PawBg}
          alt="paw"
          className="absolute top-44 md:top-32 right-2 md:right-10 w-8 md:w-16 h-8 md:h-16 -rotate-6 opacity-70 md:opacity-80"
        />
        <img
          src={PawBg}
          alt="paw"
          className="absolute bottom-10 left-20 w-8 md:w-10 h-8 md:h-10 rotate-45 opacity-80"
        />

        {/* Overlay text + button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-sky-700 leading-tight">
            {title}
          </h1>
          <p className="primary-text mt-4 text-sm md:text-base">{subtitle}</p>
          {buttonText && (
            <button
              className="mt-6 bg-sky-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-sky-700 transition font-bold"
              onClick={onButtonClick}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
