import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { MdMenu } from 'react-icons/md';
import { NavbarMenu } from '../constants/index';
import ResponsiveMenu from './ResponsiveMenu';
import logo from "../assets/logo.png";


const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const btnClass = "hover:bg-primary text-primary font-semibold hover:text-white rounded-md border-2 border-primary px-6 py-2 duration-200";
    const mobileBtnClass = "hover:bg-secondary text-white font-semibold hover:text-white rounded-md border-2 border-white px-6 py-2 duration-200";

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
    <>
        <nav>
            <div className="container flex justify-between
            items-center py-8">
                {/* Logo Section */}
                <div className="text-2xl flex items-center gap-2 font-bold uppercase">
                    <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
                    <p className="text-primary">PawSitter</p>

                </div>
                {/* Menu Section */}
                <div className="hidden lg:block">
                    <ul className="flex items-center gap-6 
                    text-gray-500">
                        {NavbarMenu.map((item, index) => (
                            <li key={index}>
                                <a
                                href={item.href}
                                className="inline-block py-1 px-3 hover:text-primary font-semibold"
                                >
                                {item.label}
                                </a>
                            </li>
                            ))}
                    </ul>
                </div>
                
                {/* Icons Section */}
                <div className="hidden lg:flex gap-4">
                <Link to="/login" className={btnClass}>
                    Login
                </Link>
                <Link to="/create-account" className={btnClass}>
                    Create Account
                </Link>
                </div>

                {/* Hamburger Menu */}
                <div className="lg:hidden cursor-pointer hover:bg-transparent" 
                onClick={() => setOpen(!open)}
                >
                    <MdMenu className="text-4xl" />
                </div>
            </div>
        </nav>

        {/* Mobile Sidebar section */}
        <ResponsiveMenu open={open} btnClass={mobileBtnClass}/>
    </>
  )
}

export default Navbar