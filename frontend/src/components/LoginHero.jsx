import React from "react";
import heroImage from "../assets/images/hero1.PNG";

const LoginHero = ({ 
  title, 
  subtitle, 
  buttonText, 
  onButtonClick
}) => {
  return (
    <section className="relative overflow-visible bg-white">
      <div className="container mx-auto px-6">
        <div className="relative flex items-center h-[600px]">

          {/* Background Rectangle */}
          <div className="absolute left-[10%] top-[10%] w-[100%] h-[600px] bg-[#f0e6e4] rounded-2xl z-0" />

          {/* Dog Image with overlay text */}
            <div className="absolute -left-[8%] top-[0%] w-[103%] z-10">
            <img
                src={heroImage}
                alt="Cute dog"
                className="w-full h-auto object-contain rounded-3xl"
            />

            {/* TEXT OVER IMAGE */}
            <div className="absolute right-60 top-[35%] -translate-y-1/2 
                            flex flex-col items-center text-center max-w-md">
            <h1 className="text-5xl font-bold text-secondary mb-6">
                {title}
            </h1>

            <p className="text-gray-700 text-lg mb-6 drop-shadow">
                {subtitle}
            </p>

            <button
                onClick={onButtonClick}
                className="bg-secondary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-secondary/90 transition shadow-lg"
            >
                {buttonText}
            </button>
            </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default LoginHero;
