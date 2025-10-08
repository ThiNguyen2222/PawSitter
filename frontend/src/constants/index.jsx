import { Dog } from "lucide-react";
import { Cat } from "lucide-react";
import { Rabbit } from "lucide-react";
import { Fish } from "lucide-react";
import { Bird } from "lucide-react";
import { Turtle } from "lucide-react";

import Testimony1 from "../assets/images/owner1.jpg";
import Testimony2 from "../assets/images/owner2.jpg";
import Testimony3 from "../assets/images/owner3.jpg";

export const NavbarMenu = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
];

export const PetSelection = [
  {
    icon: <Dog />,
    text: "Dog",
  },
    {
    icon: <Cat />,
    text: "Cat",
  },
  {
    icon: <Rabbit />,
    text: "Rabbit",
  },
  {
    icon: <Fish />,
    text: "Fish",
  },
  {
    icon: <Bird />,
    text: "Bird",
  },
    {
    icon: <Turtle />,
    text: "And More",
  },
];

export const servicesList = [
  {
    title: "House Sitting",
    description:
      "Your sitter will provide an attentive in-home care while you're away and keep your pet comfortable in their familiar environment",
  },
  {
    title: "Pet Boarding",
    description:
      "Your pet will stay overnight in your sitter's home where they will be treated like they're apart of a family.",
  },
  {
    title: "In-Home Visit",
    description:
      "Your sitter will stop by your home for personalized check-ins for feeding, playtime, potty breaks, and lots of cuddles.",
  },
  {
    title: "Pet Grooming",
    description:
      "Professional grooming to keep your pets looking and feeling their best--from baths, trims, nail care, and brushing.",
  },
  {
    title: "Pet Walking",
    description:
      "Walks and exercise that match your pet's energy level, ensuring that they stay healthy, happy, and socialized.",
  },
];

export const testimonials = [
  {
    id: 1,
    message:
      "PawSitter made finding a trustworthy sitter so easy! I love this picture of my cat that the pet sitter took during the house sitting and I'm sure Noog had a blast as well.",
    name: " - Hazel McNut",
    image: Testimony1,
  },
  {
    id: 2,
    message:
      "The fish and turtle got their food on time, the sitter did an amazing job!",
    name: " - Emma Frost",
    image: Testimony2,
  },
  {
    id: 3,
    message:
      "The sitter kept me updated with photos every time I book a service on PawSitter. It feel reassuring to be updated when I'm away from home.",
    name: " - Pinkity Drinkity",  
    image: Testimony3,
  },
];
