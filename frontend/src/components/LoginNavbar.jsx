import React from "react";
import { Link, useLocation } from "react-router-dom";

const DashboardNavbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Search" },
    { path: "/messages", label: "Messages" },
    { path: "/booking", label: "Bookings" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-orange-500">PawSitter</h1>
      <ul className="flex gap-6">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? "text-orange-500 font-semibold"
                  : "text-gray-700 hover:text-orange-400"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashboardNavbar;
