import React from "react";
import heroImage from "../assets/images/hero1.PNG";

const LoginHero = ({ title, subtitle, buttonText, onButtonClick }) => {
  return (
    <section className="relative w-full bg-white">
      <img
        src={heroImage}
        alt="Cute dog"
        className="w-full h-[350px] md:h-[600px] object-cover"
      />

      {/* Text container */}
      <div className="
        absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20
        md:items-end md:text-right md:pr-[20%]
      ">
        <h1 className="text-3xl md:text-5xl font-bold text-secondary drop-shadow-lg">
          {title}
        </h1>

        <p className="text-sm md:text-lg text-gray-700 mt-3 drop-shadow-lg">
          {subtitle}
        </p>

        <button
          onClick={onButtonClick}
          className="mt-5 bg-secondary text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-semibold shadow-lg hover:bg-secondary/90 transition"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default LoginHero;
