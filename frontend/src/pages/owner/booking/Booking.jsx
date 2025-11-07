// owner/booking/Booking.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import PetService from "./PetService";
import BookingDetails from "./BookingDetails";
import BookingReview from "./BookingReview";
import BookingsTable from "./BookingsTable";
import {
  getBookings,
  getSitters,
  getMyOwnerProfile,
  createBooking,
} from "../../../api/api";

const Booking = () => {
  const [step, setStep] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [sitters, setSitters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    selectedPets: [],
    serviceType: "house_sitting",
    sitterId: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    priceQuote: "",
    specialNotes: "",
  });

  // Load all data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, sittersData, ownerData] = await Promise.all([
        getBookings(),
        getSitters(),
        getMyOwnerProfile(),
      ]);
      
      setBookings(bookingsData);
      setSitters(sittersData);
      setPets(Array.isArray(ownerData.pets) ? ownerData.pets : []);
      
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load booking data. Please try again.");
    }
  };

  // Handle form input
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const togglePetSelection = (petId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedPets.includes(petId);
      return {
        ...prev,
        selectedPets: isSelected
          ? prev.selectedPets.filter((id) => id !== petId)
          : [...prev.selectedPets, petId],
      };
    });
  };

  // Validation before moving forward
  const validateStep = () => {
    if (step === 1) {
      if (formData.selectedPets.length === 0)
        return setError("Please select at least one pet"), false;
      if (!formData.serviceType)
        return setError("Please select a service"), false;
    }
    if (step === 2) {
      if (
        !formData.sitterId ||
        !formData.startDate ||
        !formData.startTime ||
        !formData.endDate ||
        !formData.endTime
      )
        return setError("Please fill in all booking fields"), false;
      if (!formData.priceQuote)
        return setError("Please enter a price quote"), false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  // Create booking
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError("");

    try {
      const newBooking = await createBooking({
        sitter: parseInt(formData.sitterId),
        service_type: formData.serviceType,
        start_ts: `${formData.startDate}T${formData.startTime}:00`,
        end_ts: `${formData.endDate}T${formData.endTime}:00`,
        price_quote: formData.priceQuote,
      });

      setBookings([...bookings, newBooking]);
      setSuccessMessage("Booking created successfully!");
      setFormData({
        selectedPets: [],
        serviceType: "house_sitting",
        sitterId: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        priceQuote: "",
        specialNotes: "",
      });
      setStep(1);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container flex justify-between items-center py-8 pt-32">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl text-primary font-semibold mb-8">
          Book a Pet Service
        </h2>

        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="mr-2" size={20} /> {successMessage}
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-primary/70 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {["Pet & Service", "Booking Details", "Review"].map((label, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= i + 1
                      ? "bg-white text-primary"
                      : "bg-primary/50 text-white"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-white text-sm mt-2 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white p-8 rounded-b-2xl shadow-lg">
          {step === 1 && (
            <PetService
              pets={pets}
              formData={formData}
              handleInputChange={handleInputChange}
              togglePetSelection={togglePetSelection}
            />
          )}
          {step === 2 && (
            <BookingDetails
              formData={formData}
              handleInputChange={handleInputChange}
              sitters={sitters}
            />
          )}
          {step === 3 && <BookingReview formData={formData} pets={pets} />}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="mr-2 flex-shrink-0" size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-full hover:bg-gray-50 transition font-medium text-primary"
              >
                <ChevronLeft size={20} className="mr-1" /> Previous
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="ml-auto flex items-center px-8 py-3 bg-secondary text-white rounded-full hover:opacity-90 transition font-medium"
              >
                Next <ChevronRight size={20} className="ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto flex items-center px-8 py-3 bg-secondary text-white rounded-full hover:opacity-90 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>

        <BookingsTable bookings={bookings} />
      </div>
    </section>
  );
};

export default Booking;