import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import ResponsiveMenu from "./ResponsiveMenu";
import logo from "../assets/logo.png";

const LoginNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [basePath, setBasePath] = useState(null);

  // Load role immediately on mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user?.role === "OWNER") setBasePath("/owner");
      else if (user?.role === "SITTER") setBasePath("/sitter");
    } else {
      setBasePath("/"); // fallback
    }
  }, []);

  const DASHBOARD_LINKS = [
    { path: `${basePath}/dashboard`, label: "Search" },
    { path: `${basePath}/messages`, label: "Messages" },
    { path: `${basePath}/booking`, label: "Bookings" },
    { path: `${basePath}/profile`, label: "Profile" },
  ];

  const btnClass =
    "hover:bg-primary text-primary font-semibold hover:text-white rounded-md border-2 border-primary px-6 py-2 duration-200";
  const mobileBtnClass =
    "hover:bg-secondary text-white font-semibold hover:text-white rounded-2xl border-2 border-white px-6 py-2 duration-200";

  // Close menu when resizing or navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    setOpen(false);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  // Logout clears everything
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // ✅ Only one return statement — with conditional UI
  return (
    <>
      {basePath === null ? (
        <div style={{ height: "80px" }}></div> // temporary placeholder
      ) : (
        <>
          <nav>
            <div className="container flex justify-between items-center py-8">
              {/* Logo → goes to the correct dashboard */}
              <div className="text-2xl flex items-center gap-2 font-bold uppercase">
                <Link
                  to={`${basePath}/dashboard`}
                  className="flex items-center gap-2"
                >
                  <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
                  <p className="text-primary">PawSitter</p>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex gap-6 items-center">
                {DASHBOARD_LINKS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`py-1 px-3 font-semibold ${
                      location.pathname === item.path
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-500 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className={btnClass}>
                  Logout
                </button>
              </div>

              {/* Hamburger (mobile) */}
              <button
                aria-label="Open menu"
                className="lg:hidden cursor-pointer hover:bg-transparent"
                onClick={() => setOpen((prev) => !prev)}
              >
                <MdMenu className="text-4xl" />
              </button>
            </div>
          </nav>

          {/* Mobile Sidebar */}
          <ResponsiveMenu
            open={open}
            btnClass={mobileBtnClass}
            menuItems={[
              ...DASHBOARD_LINKS.map((item) => ({
                label: item.label,
                onClick: () => navigate(item.path),
              })),
              { label: "Logout", onClick: handleLogout },
            ]}
          />
        </>
      )}
    </>
  );
};

export default LoginNavbar;
