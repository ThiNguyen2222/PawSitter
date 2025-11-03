import React from "react";
import { PawPrint } from "lucide-react";
import { servicesList } from "../constants/index";
import AllPets from "../assets/images/services.png";

const Services = () => {
  return (
    <section id="services" className="container mx-auto flex flex-col lg:flex-row justify-between items-center py-8 gap-10 scroll-mt-28">
      {/* Image */}
      <div className="w-full lg:w-1/2 flex justify-center">
        <img
          src={AllPets}
          alt="Image Collage of Cat, Bird, Dog, and Fish"
          className="w-full max-w-lg lg:max-w-2xl object-contain"
        />
      </div>

      {/* Title and Services list */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-3xl text-primary font-bold uppercase mb-6">
          Our Services
        </h2>

        <div className="flex flex-col justify-center">
          {servicesList.map((item, index) => (
            <div key={index} className="flex mb-12">
              <div className="text-secondary mx-6 h-10 w-10 p-2 justify-center items-center rounded-full">
                <PawPrint />
              </div>
              <div>
                <h5 className="mt-1 mb-2 text-xl">{item.title}</h5>
                <p className="primary-text text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
