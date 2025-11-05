import React from "react";
import { Star } from "lucide-react";

const BookingDetails = ({ formData, handleInputChange, sitters }) => (
  <div className="space-y-8">
    {/* Header */}
    <div>
      <h2 className="text-2xl font-semibold text-primary mb-2">
        Booking Details
      </h2>
      <p className="text-gray-600 mb-6">
        Choose a sitter and fill in your booking info
      </p>
    </div>

    {/* Sitters */}
    <div>
      <h3 className="text-xl font-semibold text-primary mb-3">
        Select a Pet Sitter
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sitters.map((sitter) => {
          const isSelected = parseInt(formData.sitterId) === sitter.id;
          return (
            <button
              key={sitter.id}
              onClick={() => handleInputChange("sitterId", sitter.id)}
              className={`p-5 rounded-2xl border-2 text-left transition-all shadow-sm ${
                isSelected
                  ? "border-secondary bg-secondary/10 ring-2 ring-secondary"
                  : "border-gray-200 hover:border-secondary/50 hover:shadow-md"
              }`}
            >
              {/* Sitter Info */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-800">
                  {sitter.display_name}
                </h4>
                <div className="flex items-center text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="ml-1 text-sm text-gray-700 font-medium">
                    {sitter.avg_rating?.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                {sitter.bio}
              </p>

              <div className="flex justify-between items-center mt-3">
                <p className="text-primary font-semibold">
                  ${sitter.rate_hourly}/hr
                </p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    sitter.verification_status === "VERIFIED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {sitter.verification_status}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {formData.sitterId && (
        <p className="mt-3 text-sm text-secondary font-medium">
          Selected:{" "}
          {
            sitters.find((s) => s.id === parseInt(formData.sitterId))
              ?.display_name
          }
        </p>
      )}
    </div>

    {/* Date and Time Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Start Date
        </label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => handleInputChange("startDate", e.target.value)}
          className="w-full px-4 py-3 border-b-2 border-gray-300 outline-none focus:border-secondary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Start Time
        </label>
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => handleInputChange("startTime", e.target.value)}
          className="w-full px-4 py-3 border-b-2 border-gray-300 outline-none focus:border-secondary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          End Date
        </label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => handleInputChange("endDate", e.target.value)}
          className="w-full px-4 py-3 border-b-2 border-gray-300 outline-none focus:border-secondary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          End Time
        </label>
        <input
          type="time"
          value={formData.endTime}
          onChange={(e) => handleInputChange("endTime", e.target.value)}
          className="w-full px-4 py-3 border-b-2 border-gray-300 outline-none focus:border-secondary"
        />
      </div>
    </div>

    {/* Price Quote */}
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Price Quote ($)
      </label>
      <input
        type="number"
        step="0.01"
        value={formData.priceQuote}
        onChange={(e) => handleInputChange("priceQuote", e.target.value)}
        className="w-full px-4 py-3 border-b-2 border-gray-300 outline-none focus:border-secondary placeholder-gray-400"
        placeholder="0.00"
      />
    </div>

    {/* Special Notes */}
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Special Notes (Optional)
      </label>
      <textarea
        value={formData.specialNotes}
        onChange={(e) => handleInputChange("specialNotes", e.target.value)}
        rows="4"
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-secondary placeholder-gray-400 resize-none"
        placeholder="Any special instructions or requirements..."
      />
    </div>
  </div>
);

export default BookingDetails;
