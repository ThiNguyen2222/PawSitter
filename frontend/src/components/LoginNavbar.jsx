import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import ResponsiveMenu from "./ResponsiveMenu";
import logo from "../assets/logo.png";

const DASHBOARD_LINKS = [
  { path: "/dashboard", label: "Search" },
  { path: "/messages", label: "Messages" },
  { path: "/booking", label: "Bookings" },
  { path: "/profile", label: "Profile" },
];

const LoginNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  // Shared button styles (same as Navbar)
  const btnClass =
    "hover:bg-primary text-primary font-semibold hover:text-white rounded-md border-2 border-primary px-6 py-2 duration-200";
  const mobileBtnClass =
    "hover:bg-secondary text-white font-semibold hover:text-white rounded-2xl border-2 border-white px-6 py-2 duration-200";

  // Handle window resizing and route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    setOpen(false);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav>
        <div className="container flex justify-between items-center py-8">
          {/* Logo */}
          <div className="text-2xl flex items-center gap-2 font-bold uppercase">
            <Link to="/dashboard" className="flex items-center gap-2">
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

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={btnClass}
            >
              Logout
            </button>
          </div>

          {/* Hamburger Menu */}
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
  );
};

export default LoginNavbar;
