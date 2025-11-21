import React from "react";
import heroImage from "../assets/images/hero1.PNG";

const LoginHero = ({ 
  title, 
  subtitle, 
  buttonText, 
  onButtonClick,
  showCalendar = false,
  calendarWidget = null
}) => {
  return (
    <section className="relative w-full overflow-visible bg-white">
      <div className="relative w-full">
        {/* Dog Image - Full width */}
        <img
          src={heroImage}
          alt="Cute dog"
          className="w-full h-[600px] object-cover"
        />
        
        {/* Text Content */}
        <div className="absolute top-1/2 right-[20%] -translate-y-1/2 text-center z-20">
          <h1 className="text-5xl font-bold text-secondary mb-4 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-lg text-gray-700 mb-6 drop-shadow-lg">
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
    </section>
  );
};

export default LoginHero;