import { PetSelection } from '../constants/index';
import React from 'react';

const PetSection = () => {
  return (
    <div className="container py-5">
      {/* Title */}
      <div className="w-full">
        <h2 className="text-3xl text-primary font-bold uppercase mb-6">
          Choose Your Pet
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PetSelection.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl px-10 py-10 transition-all duration-300 ease-in-out transform bg-[rgba(47,160,201,0.1)] hover:shadow-xl hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="flex-shrink-0 transition-transform duration-300 ease-in-out hover:scale-110">
                {React.cloneElement(option.icon, { size: 50, color: "#374151" })}
              </div>

              {/* Text (centered vertically) */}
              <div className="flex-1 flex justify-center">
                <span className="text-gray-700 font-semibold text-base sm:text-lg text-center">
                  {option.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetSection;
