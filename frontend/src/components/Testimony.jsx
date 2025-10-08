import React, { useState } from "react";
import { testimonials } from "../constants/index";

const Testimony = () => {
  const [current, setCurrent] = useState(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const { title, message, name, image } = testimonials[current];

  return (
    <section className="bg-[#f0e6e4] py-12 md:py-20 px-4 md:px-8 flex justify-center">
      <div className="relative bg-white rounded-2xl shadow-md p-6 md:p-12 flex flex-col md:flex-row items-center justify-between w-full max-w-4xl md:max-w-5xl">
        {/* Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-[#B49C68] hover:text-primary text-2xl md:text-3xl font-bold"
        >
          ‹
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-[#B49C68] hover:text-primary text-2xl md:text-3xl font-bold"
        >
          ›
        </button>

        {/* Text Section */}
        <div className="md:w-2/3 text-center md:text-left">
          <h2 className="text-3xl text-primary md:text-3xl font-bold uppercase mb-6">
            See What Our Friends Have to Say
          </h2>
          <p className="text-gray-600 leading-relaxed mb-2 text-base md:text-lg">
            {message}
          </p>
          <p className="text-gray-600 text-sm md:text-base">{name}</p>
        </div>

        {/* Image Section */}
        <div className="md:w-1/3 mt-6 md:mt-0 flex justify-center">
          <img
            src={image}
            alt="happy clients"
            className="rounded-lg shadow-md w-3/4 md:w-[85%] lg:w-[90%]"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimony;
