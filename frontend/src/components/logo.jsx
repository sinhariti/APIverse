import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/file.svg'; // adjust the path as needed

const Navbar = () => {
  return (
    <nav className="bg-transparent px-8 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Menu Items */}
      <div className="flex space-x-8">
        <Link to="/about" className="text-gray-200 hover:text-blue-400 font-medium">
          About
        </Link>
        <Link to="/contact" className="text-gray-200 hover:text-blue-400 font-medium">
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;