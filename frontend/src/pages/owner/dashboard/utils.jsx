// Local sitter profile images
import profile0 from "../../../assets/dummy/profile0.png";
import profile1 from "../../../assets/dummy/profile1.jpg";
import profile2 from "../../../assets/dummy/profile2.jpg";
import profile3 from "../../../assets/dummy/profile3.jpg";
import profile4 from "../../../assets/dummy/profile4.jpg";
import profile5 from "../../../assets/dummy/profile5.jpg";
import profile6 from "../../../assets/dummy/profile6.jpg";

// Pet images
import bird from "../../../assets/dummy/bird.jpg";
import cat1 from "../../../assets/dummy/cat1.jpg";
import cat2 from "../../../assets/dummy/cat2.jpg";
import dog1 from "../../../assets/dummy/dog1.jpg";
import dog2 from "../../../assets/dummy/dog2.jpg";
import fish from "../../../assets/dummy/fish.jpg";
import rabbit from "../../../assets/dummy/rabbit.jpg";
import reptile from "../../../assets/dummy/reptile.jpg";

// Get sitter image based on gender + index
export const getSitterImage = (gender, index = 0) => {
  const femaleImages = [profile1, profile2, profile3];
  const maleImages = [profile4, profile5, profile6];

  if (gender?.toLowerCase() === "male") {
    return maleImages[index % maleImages.length];
  } else if (gender?.toLowerCase() === "female") {
    return femaleImages[index % femaleImages.length];
  }

  // Default gender-neutral fallback
  return profile0;
};

// Get pet image based on species (uses local photos)
export const getPetImage = (species) => {
  switch (species?.toLowerCase()) {
    case "dog":
      return Math.random() > 0.5 ? dog1 : dog2;
    case "cat":
      return Math.random() > 0.5 ? cat1 : cat2;
    case "bird":
      return bird;
    case "rabbit":
      return rabbit;
    case "lizard":
    case "reptile":
      return reptile;
    case "fish":
      return fish;
    default:
      return "https://source.unsplash.com/800x600/?pet";
  }
};
