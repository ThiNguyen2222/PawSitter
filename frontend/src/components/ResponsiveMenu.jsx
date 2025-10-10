import React from 'react';
import {motion, AnimatePresence} from "framer-motion";
import { Link } from "react-router-dom";

const ResponsiveMenu = ({open, btnClass}) => {
  return(
    <AnimatePresence mode='wait'>
        {
            open && (
                <motion.div 
                    initial={{ opacity: 0, y:-100 }}
                    animate={{ opacity: 1, y:0 }}
                    exit={{ opacity: 0, y:-100 }}
                    transition={{duration: 0.3}}
                    className="absolute top-20 left-0 w-full h-screen z-20"
                >
                    <div className="text-xl font-semibold uppercase
                    bg-primary text-white py-10 m-6 rounded-3xl">
                        <ul className="flex flex-col justify-center
                        items-center gap-10">
                            <li>Home</li>
                            <li>Services</li>
                            <li>About Us</li>
                            <li>Contact</li>
                            <Link to="/login" className={btnClass}>
                                Login
                            </Link>
                            <Link to="/create-account" className={btnClass}>
                                Create Account
                            </Link>

                        </ul>
                    </div>
                </motion.div>
            )
        }
    </AnimatePresence>
  );
}

export default ResponsiveMenu