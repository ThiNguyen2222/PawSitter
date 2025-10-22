import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import ResponsiveMenu from "./ResponsiveMenu";
import logo from "../assets/logo.png";
import { NavbarMenu } from "../constants/index";

const Navbar = () => {
  const location = useLocation(); // track current route
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

  return (
    <>
      <nav>
        <div className="container flex justify-between items-center py-8">
          {/* Logo Section */}
          <div className="text-2xl flex items-center gap-2 font-bold uppercase">
            <Link to="/" className="flex items-center gap-2">
              <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
              <p className="text-primary">PawSitter</p>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-6 items-center">
            {NavbarMenu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1 px-3 font-semibold text-gray-500 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <Link to="/login" className={btnClass}>
              Login
            </Link>
            <Link to="/create-account" className={btnClass}>
              Create Account
            </Link>
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

      {/* Mobile Sidebar */}
      <ResponsiveMenu
        open={open}
        btnClass={mobileBtnClass}
        menuItems={[
          ...NavbarMenu.map((item) => ({ href: item.href, label: item.label })),
          { path: "/login", label: "Login" },
          { path: "/create-account", label: "Create Account" },
        ]}
      />
    </>
  );
};

export default Navbar;
