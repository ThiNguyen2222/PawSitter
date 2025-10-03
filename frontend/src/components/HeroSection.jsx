import React from "react";
import BannerBackground from "../assets/images/home_banner_bg.png";
import PawBg from "../assets/images/paw.png";


const HeroSection = () => {
  return (
    <section className="relative w-full">
        {/* Banner image */}
        <div className="home-banner-container relative z-0">
            <img
            src={BannerBackground}
            alt="Hero background shape"
            className="w-[95%] object-contain -mt-8"
            style={{ height: "700px", objectFit: "fill" }}
            />

        {/* Decorative paws */}
        <img
            src={PawBg}
            alt="paw"
            className="absolute top-10 left-5 w-12 h-12 rotate-12"
        />
        <img
            src={PawBg}
            alt="paw"
            className="absolute top-32 right-10 w-16 h-16 -rotate-6"
        />
        <img
            src={PawBg}
            alt="paw"
            className="absolute bottom-10 left-20 w-10 h-10 rotate-45"
        />


        {/* Overlay content */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl md:text-5xl font-bold text-sky-700 leading-tight">
            Find the Best Sitter <br /> for You and Your Pet!
          </h1>
          <p className="primary-text mt-4">
            Book a Service or Become a Pet Sitter
          </p>
          <button className="mt-6 bg-sky-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-sky-700 transition font-bold">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
