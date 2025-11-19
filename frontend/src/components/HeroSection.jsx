// HeroSection.jsx
import React from "react";
import BannerBackground from "../assets/images/home_banner_bg.png";
import PawBg from "../assets/images/paw.png";
import wool from "../assets/images/wool.png";
import bowl from "../assets/images/pet-bowl.png";
import food from "../assets/images/dog-biscuit.png";

import bunny from "../assets/images/bunny.jpg";
import cat from "../assets/images/cat.jpg";
import fish from "../assets/images/fish.jpg";
import hamster from "../assets/images/hamster.jpg";
import kid from "../assets/images/kid_rabbit.jpg";
import samoyed from "../assets/images/samoyed.jpg";

function HeroSection({
  title = "",
  subtitle = "",
  buttonText = "Book Now",
  onButtonClick,
}) {
  return (
    <section id="home" className="relative w-full scroll-mt-28 -mt-10">
      <div className="home-banner-container relative z-0">

        <img
          src={BannerBackground}
          alt="Hero background shape"
          className="w-full object-cover md:object-fill h-[300px] md:h-[650px]"
        />

        <div className="absolute inset-0 w-full h-full pointer-events-none">

          {/* LEFT TOP BUNNY */}
          <div className="absolute left-[11%] top-[10%]">
            <div className="w-28 h-28 bg-secondary bg-opacity-50  rounded-full absolute -left-4 -top-4"></div>
            <img
              src={bunny}
              alt="bunny"
              className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* LEFT BOTTOM CAT */}
          <img
            src={cat}
            alt="cat"
            className="absolute left-[5%] top-[53%] w-44 h-44 rounded-full object-cover border-4 border-white shadow-lg"
          />

          {/* CENTER SAMOYED */}
          <img
            src={samoyed}
            alt="samoyed"
            className="absolute left-[27%] top-[28%] -translate-x-1/2 w-60 h-60 rounded-full object-cover border-4 border-white shadow-xl"
          />

          {/* RIGHT TOP WOOL */}
          <img
            src={wool}
            alt="wool"
            className="absolute right-[39%] top-[17%] w-20 h-20 rotate-[20deg] opacity-90"
          />

          {/* RIGHT BOWL */}
          <img
            src={bowl}
            alt="bowl"
            className="absolute right-[7%] top-[45%] w-20 h-20 rotate-[20deg] opacity-90"
          />

          {/* LEFT FOOD
          <img
            src={food}
            alt="food"
            className="absolute left-[10%] top-[37%] w-20 h-20 rotate-[320deg] opacity-70"
          /> */}

          {/* RIGHT TOP FISH */}
          <img
            src={fish}
            alt="fish"
            className="absolute right-[15%] top-[20%] w-[140px] h-[140px] rounded-full object-cover border-4 border-white shadow-lg"
          />

          {/* RIGHT LARGE KID + BLUE BLOB */}
          <div className="absolute right-[26%] top-[47%]">
            <div className="w-40 h-40 bg-secondary bg-opacity-50 rounded-full absolute -right-12 top-14"></div>
            <img
              src={kid}
              alt="kid with rabbit"
              className="relative w-64 h-64 rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>

          {/* RIGHT BOTTOM HAMSTER */}
          <img
            src={hamster}
            alt="hamster"
            className="absolute right-[10%] top-[72%] w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>

        {/* PAW PRINTS */}
        <img
          src={PawBg}
          alt="paw"
          className="absolute top-16 left-10 w-10 h-10 rotate-12 opacity-60"
        />
        {/* RIGHT PAWS*/}
        <img src={PawBg} alt="paw" className="absolute right-[24%] top-[45%] w-11 h-11 rotate-[310deg] opacity-70"/>
        <img src={PawBg} alt="paw" className="absolute right-[29%] top-[41%] w-10 h-10 rotate-[330deg] opacity-65"/>
        <img src={PawBg} alt="paw" className="absolute right-[29%] top-[32%] w-10 h-10 rotate-[330deg] opacity-60"/>
        <img src={PawBg} alt="paw" className="absolute right-[33%] top-[31%] w-9 h-9 rotate-[320deg] opacity-55"/>
        <img src={PawBg} alt="paw" className="absolute right-[34%] top-[23%] w-9 h-9 rotate-[290deg] opacity-50"/>

        {/* LEFT PAWS */}
        <img src={PawBg} alt="paw" className="absolute left-[39%] top-[63%] w-10 h-10 rotate-[320deg] opacity-80"/>
        <img src={PawBg} alt="paw" className="absolute left-[36%] top-[58%] w-9 h-9 rotate-[5deg] opacity-75"/>
        <img src={PawBg} alt="paw" className="absolute left-[37%] top-[50%] w-8 h-8 rotate-[330deg] opacity-70"/>
        <img src={PawBg} alt="paw" className="absolute left-[35%] top-[42%] w-8 h-8 rotate-[15deg] opacity-65"/>
        <img src={PawBg} alt="paw" className="absolute left-[37%] top-[36%] w-7 h-7 rotate-[340deg] opacity-60"/>

        {/* CENTER TEXT */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-auto">
            <h1 className="lg:text-4xl font-bold text-secondary leading-tight max-w-3xl">
              Book a Service <br /> or Become a Pet Sitter!
            </h1>

            {buttonText && (
              <button
                className="mt-8 bg-secondary text-white px-8 py-3 rounded-lg shadow-lg 
                          hover:bg-secondary/80 transition-all duration-200 font-bold text-lg flex items-center gap-2"
                onClick={onButtonClick}
              >
                {buttonText}
                <span className="text-xl">→</span>
              </button>
            )}
          </div>

      </div>
    </section>
  );
}

export default HeroSection;
