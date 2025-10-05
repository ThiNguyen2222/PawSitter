import { PetSelection } from '../constants/index';
import React from 'react';

const PetSection = () => {
  return (
    <div className="container py-5">
      {/* Title */}
      <div className="mt-25 w-full">
        <h2 className="text-3xl text-primary font-bold uppercase mb-6">
          Choose Your Pet
        </h2>

        {/* Pet Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-5 gap-x-5">
          {PetSelection.map((option, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center
                         border border-neutral-400 rounded-xl
                         w-full aspect-square
                         hover:shadow-md transition-all duration-200 text-center"
            >
              {/* Icon with explicit size */}
              <div className="mb-2">
                {React.cloneElement(option.icon, { size: 60, color: "#2FA0C9" })} 
              </div>

              <p className="text-base sm:text-lg font-semibold text-secondary mt-3">
                {option.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetSection;
