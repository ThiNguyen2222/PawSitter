export const getPetImage = (species) => {
  switch (species?.toLowerCase()) {
    case "dog":
      return "https://images.unsplash.com/photo-1601758123927-1969c9d69b1f?auto=format&fit=crop&w=800&q=80";
    case "cat":
      return "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80";
    case "bird":
      return "https://images.unsplash.com/photo-1603775020644-5cce3f0b8b3a?auto=format&fit=crop&w=800&q=80";
    case "rabbit":
      return "https://images.unsplash.com/photo-1595433562696-a8b7d92a98d7?auto=format&fit=crop&w=800&q=80";
    case "lizard":
      return "https://images.unsplash.com/photo-1570032257809-d573e18c4a0d?auto=format&fit=crop&w=800&q=80";
    case "fish":
      return "https://images.unsplash.com/photo-1565895405127-38a9b67c8b5d?auto=format&fit=crop&w=800&q=80";
    default:
      return "https://source.unsplash.com/800x600/?pet";
  }
};
