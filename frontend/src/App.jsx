import React from 'react'
import Navbar from './components/Navbar'
import BannerBackground from "./assets/images/home_banner_bg.png";


const App = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar/>
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img 
          src={BannerBackground} 
          alt="Background Vector Image" 
          className="w-[95%] object-contain -mt-8"
          />
        </div>

      </div>
    </div>
  )
}

export default App

