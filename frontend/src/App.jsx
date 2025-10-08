import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PetSection from './components/PetSection'
import About from './components/About'
import Services from './components/Services'
import Testimony from './components/Testimony'
import BackendData from './components/BackendData';


const App = () => {
  return (
    <div className="overflow-x-hidden">
      <BackendData />
      <Navbar />
      <HeroSection />
      <PetSection />
      <About />
      <Services />
      <Testimony />
    </div>

  )
}

export default App

