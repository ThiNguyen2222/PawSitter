import React from "react";
import AboutBackground from "../assets/images/about-bg.png";

const About = () => {
  return (
    <section id="about" className="container mx-auto flex flex-col md:flex-row-reverse items-center justify-between gap-10 py-10 scroll-mt-28">
      {/* Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={AboutBackground}
          alt="About Background Blob"
          className="w-3/4 md:w-full max-w-sm md:max-w-md object-contain"
        />
      </div>

      {/* Text */}
      <div className="w-full md:w-1/2 text-center md:text-left px-4">
        <p className="primary-subheading">About Us</p>
        <h2 className="text-3xl text-primary font-bold uppercase mb-6">
          Take care of your pet as if they were our own
        </h2>
        <p className="primary-text text-gray-700 leading-relaxed">
          As a pet parent, leaving your pets at home while you are on vacation
          or at work can be stressful.
          <br />
          <br />
          PawSitter connects pet owners with trusted local sitters who treat
          every pet with the care they deserve. Our mission is simple: to bring
          peace of mind to owners, reliable opportunities to sitters, and
          consistent care to pets.
        </p>
      </div>
    </section>
  );
};

export default About;
