import React from "react";
import { Dog, Cat, Home, Clock, Star, CheckCircle } from "lucide-react";

const serviceOptions = [
  { value: "house_sitting", label: "House Sitting", icon: Home },
  { value: "pet_boarding", label: "Pet Boarding", icon: Home },
  { value: "in_home_visit", label: "In-Home Visit", icon: Clock },
  { value: "pet_grooming", label: "Pet Grooming", icon: Star },
  { value: "pet_walking", label: "Pet Walking", icon: Dog },
];

const PetService = ({ pets, formData, handleInputChange, togglePetSelection }) => (
  <div className="space-y-8">
    {/* Pet Selection */}
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-2">
        Select Your Pets
      </h2>
      <p className="text-gray-600 mb-4">Choose one or more pets for this booking</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pets.map((pet) => {
          const isSelected = formData.selectedPets.includes(pet.id);
          return (
            <button
              key={pet.id}
              onClick={() => togglePetSelection(pet.id)}
              className={`p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-secondary bg-secondary/5 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center space-x-4">
                {pet.species?.toLowerCase() === "dog" ? (
                  <Dog size={40} className={isSelected ? "text-secondary" : "text-primary"} />
                ) : (
                  <Cat size={40} className={isSelected ? "text-secondary" : "text-primary"} />
                )}
                <div className="text-left flex-1">
                  <p className="font-semibold text-lg text-gray-800">{pet.name}</p>
                  <p className="text-sm text-gray-500">{pet.breed}</p>
                </div>
                {isSelected && <CheckCircle className="text-secondary" size={24} />}
              </div>
            </button>
          );
        })}
      </div>

      {formData.selectedPets.length > 0 && (
        <p className="mt-3 text-sm text-secondary font-medium">
          {formData.selectedPets.length} pet
          {formData.selectedPets.length > 1 ? "s" : ""} selected
        </p>
      )}
    </div>

    {/* Service Type */}
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-2">
        Select Service Type
      </h2>
      <p className="text-gray-600 mb-4">What service do you need?</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {serviceOptions.map((service) => {
          const Icon = service.icon;
          const isSelected = formData.serviceType === service.value;
          return (
            <button
              key={service.value}
              onClick={() => handleInputChange("serviceType", service.value)}
              className={`p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-secondary bg-secondary text-white shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Icon size={32} className="mb-2" />
                <span className="font-medium text-sm">{service.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export default PetService;
