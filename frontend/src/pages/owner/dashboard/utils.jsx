// Gender-neutral sitter profile images
import profile0 from "../../../assets/dummy/profile0.png";

// Pet images
import bird from "../../../assets/dummy/bird.jpg";
import cat1 from "../../../assets/dummy/cat1.jpg";
import cat2 from "../../../assets/dummy/cat2.jpg";
import dog1 from "../../../assets/dummy/dog1.jpg";
import dog2 from "../../../assets/dummy/dog2.jpg";
import fish from "../../../assets/dummy/fish.jpg";
import rabbit from "../../../assets/dummy/rabbit.jpg";
import reptile from "../../../assets/dummy/reptile.jpg";

// Get sitter image - uses only gender-neutral images
export const getSitterImage = (gender, index = 0) => {
  // Array of gender-neutral profile images
  const neutralImages = [profile0];
  return neutralImages[index % neutralImages.length];
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
