import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import PetSection from './components/PetSection'

const App = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <PetSection />
    </div>

  )
}

export default App

