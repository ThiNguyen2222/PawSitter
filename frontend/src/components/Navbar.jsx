import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import ResponsiveMenu from "./ResponsiveMenu";
import logo from "../assets/logo.png";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  // Reusable button styles
  const btnClass =
    "hover:bg-primary text-primary font-semibold hover:text-white rounded-md border-2 border-primary px-6 py-2 duration-200";
  const mobileBtnClass =
    "hover:bg-secondary text-white font-semibold hover:text-white rounded-2xl border-2 border-white px-6 py-2 duration-200";

  // Scroll to section smoothly
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Handle nav click
  const handleNav = (id) => {
    if (location.pathname !== "/") {
      // Navigate home first, then scroll after render
      navigate(`/#${id}`);
      setTimeout(() => scrollToId(id), 100);
    } else {
      window.history.replaceState(null, "", `/#${id}`);
      scrollToId(id);
    }
    setOpen(false);
  };

  // Close mobile menu when resizing or switching routes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    setOpen(false);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  return (
    <>
      <nav>
        <div className="container flex justify-between items-center py-8">
          {/* Logo */}
          <div className="text-2xl flex items-center gap-2 font-bold uppercase">
            <Link to="/" className="flex items-center gap-2" onClick={() => handleNav("home")}>
              <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
              <p className="text-primary">PawSitter</p>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-6 items-center">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleNav(s.id)}
                className="py-1 px-3 font-semibold text-gray-500 hover:text-primary"
              >
                {s.label}
              </button>
            ))}
            {/* Auth buttons */}
            <Link to="/login" className={btnClass}>
              Login
            </Link>
            <Link to="/create-account" className={btnClass}>
              Create Account
            </Link>
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
          ...SECTIONS.map((s) => ({
            label: s.label,
            onClick: () => handleNav(s.id),
          })),
          { path: "/login", label: "Login" },
          { path: "/create-account", label: "Create Account" },
        ]}
      />
    </>
  );
};

export default Navbar;


