import HeroSection from "../components/HeroSection";
import PetSection from "../components/PetSection";
import About from "../components/About";
import Services from "../components/Services";
import Testimony from "../components/Testimony";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection
        title="Find the Best Sitter for You and Your Pet!"
        subtitle="Book a Service or Become a Pet Sitter"
        buttonText="Get Started"
        onButtonClick={() => navigate("/create-account")} // <-- redirect here
      />
      <PetSection />
      <About />
      <Services />
      <Testimony />
    </>
  );
};

export default Home;
