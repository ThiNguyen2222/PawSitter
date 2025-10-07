import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PetSection from './components/PetSection'
import About from './components/About'
import Services from './components/Services'


const App = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <PetSection />
      <About />
      <Services />
    </div>

  )
}

export default App

