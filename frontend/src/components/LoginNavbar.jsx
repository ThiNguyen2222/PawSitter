import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // + useNavigate
import { MdMenu } from "react-icons/md";
import ResponsiveMenu from "./ResponsiveMenu";
import logo from "../assets/logo.png";

const LoginNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [open, setOpen] = React.useState(false);

  const btnClass =
    "hover:bg-primary text-primary font-semibold hover:text-white rounded-md border-2 border-primary px-6 py-2 duration-200";
  const mobileBtnClass =
    "hover:bg-secondary text-white font-semibold hover:text-white rounded-2xl border-2 border-white px-6 py-2 duration-200";

  // Close mobile menu on resize or route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);

    // Close menu automatically when route changes
    setOpen(false);

    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  // Dashboard menu items
  const dashboardItems = [
    { path: "/dashboard", label: "Search" },
    { path: "/messages", label: "Messages" },
    { path: "/booking", label: "Bookings" },
    { path: "/profile", label: "Profile" },
  ];

  // 🔐 Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // remove any other auth/user keys you might have saved
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav>
        <div className="container flex justify-between items-center py-8">
          {/* Logo Section */}
          <Link to="/dashboard" className="text-2xl flex items-center gap-2 font-bold uppercase">
            <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
            <p className="text-primary">PawSitter</p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-6 items-center">
            {dashboardItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? "text-orange-500 font-semibold"
                    : "text-gray-700 hover:text-orange-400"
                } py-1 px-3`}
              >
                {item.label}
              </Link>
            ))}

            {/* 🔸 Add Logout button here */}
            <button
              onClick={handleLogout}
              className="py-1 px-3 text-gray-700 hover:text-orange-400 font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Hamburger Menu */}
          <div
            className="lg:hidden cursor-pointer hover:bg-transparent"
            onClick={() => setOpen(!open)}
          >
            <MdMenu className="text-4xl" />
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar — pass Logout as an action item */}
      <ResponsiveMenu
        open={open}
        btnClass={mobileBtnClass}
        menuItems={[
          ...dashboardItems,
          {label: "LOGOUT", onClick: handleLogout}, // <-- action item
        ]}
      />
    </>
  );
};

export default LoginNavbar;
