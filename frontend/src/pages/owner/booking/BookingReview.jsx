import React from "react";

const BookingReview = ({ formData, pets }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-primary mb-2">
      Review Your Booking
    </h2>
    <p className="text-gray-600 mb-6">Please confirm the details below</p>

    <div className="bg-[#f0e6e4] rounded-xl p-6 space-y-4">
      <div className="flex justify-between py-2 border-b border-primary/20">
        <span className="text-gray-700 font-medium">Selected Pets:</span>
        <div className="text-right">
          {formData.selectedPets.map((id) => {
            const pet = pets.find((p) => p.id === id);
            return (
              <div key={id} className="font-semibold text-primary">
                {pet?.name}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between py-2 border-b border-primary/20">
        <span className="text-gray-700 font-medium">Service:</span>
        <span className="font-semibold text-primary capitalize">
          {formData.serviceType.replace("_", " ")}
        </span>
      </div>

      <div className="flex justify-between py-2 border-b border-primary/20">
        <span className="text-gray-700 font-medium">Sitter ID:</span>
        <span className="font-semibold text-primary">{formData.sitterId}</span>
      </div>

      <div className="flex justify-between py-2 border-b border-primary/20">
        <span className="text-gray-700 font-medium">Start:</span>
        <span className="font-semibold text-primary">
          {formData.startDate} at {formData.startTime}
        </span>
      </div>

      <div className="flex justify-between py-2 border-b border-primary/20">
        <span className="text-gray-700 font-medium">End:</span>
        <span className="font-semibold text-primary">
          {formData.endDate} at {formData.endTime}
        </span>
      </div>

      <div className="flex justify-between py-2">
        <span className="text-gray-700 font-medium">Price:</span>
        <span className="font-bold text-secondary text-xl">
          ${parseFloat(formData.priceQuote || 0).toFixed(2)}
        </span>
      </div>
    </div>

    {formData.specialNotes && (
      <div className="bg-secondary/10 border-l-4 border-secondary rounded-lg p-4">
        <p className="text-sm font-medium text-primary mb-1">Special Notes:</p>
        <p className="text-gray-700">{formData.specialNotes}</p>
      </div>
    )}
  </div>
);

export default BookingReview;
