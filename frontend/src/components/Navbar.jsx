import React from 'react';
import { MdMenu } from 'react-icons/md';
import { NavbarMenu } from '../constants/data';
import ResponsiveMenu from './ResponsiveMenu';
import logo from "../assets/logo.png";


const Navbar = () => {
    const [open, setOpen] = React.useState(false);
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
                <div className="hidden md:block">
                    <ul className="flex items-center gap-6 
                    text-gray-500">
                        {NavbarMenu.map((item) => {
                                return (
                                    <li key={item.id}>
                                        <a href={item.link} className="
                                        inline-block py-1 px-3 
                                        hover:text-primary font-semibold">
                                            {item.title
                                        }</a>
                                    </li>
                                )
                            })}
                    </ul>
                </div>
                {/* Icons Section */}
                <div className="hidden md:flex gap-4">
                    <button className="hover:bg-primary 
                                        text-primary font-semibold hover:text-white
                                        rounded-md border-2 border-primary px-6 py-2
                                        duration-200">
                        Login
                    </button>
                    <button className="hover:bg-primary 
                                        text-primary font-semibold hover:text-white
                                        rounded-md border-2 border-primary px-6 py-2
                                        duration-200">
                        Create Account
                    </button>
                </div>
                <div className="md:hidden" onClick={() =>
                setOPen(!open)}>
                    <MdMenu className="text-4xl" />
                </div>
            </div>
        </nav>

        {/* Mobile Sidebar section */}
        <ResponsiveMenu open={open}/>
    </>
  )
}

export default Navbar