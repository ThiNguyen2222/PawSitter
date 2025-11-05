import React from "react";

const BookingsTable = ({ bookings }) => (
  <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
    <h2 className="text-2xl font-semibold text-primary mb-6">
      Your Bookings
    </h2>

    {bookings.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">No bookings yet</p>
        <p className="text-sm text-gray-400">
          Create your first booking above!
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-primary">ID</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Service</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Sitter</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Start</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">End</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-primary">Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-b border-gray-100 hover:bg-[#f0e6e4]/30 transition"
              >
                <td className="py-3 px-4 text-gray-700">#{b.id}</td>
                <td className="py-3 px-4 capitalize text-gray-700">
                  {b.service_type?.replace("_", " ")}
                </td>
                <td className="py-3 px-4 text-gray-700">{b.sitter_id}</td>
                <td className="py-3 px-4 text-gray-700">
                  {new Date(b.start_ts).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {new Date(b.end_ts).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "requested"
                        ? "bg-yellow-100 text-yellow-700"
                        : b.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-secondary">
                  ${parseFloat(b.price_quote).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default BookingsTable;
