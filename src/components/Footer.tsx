/*-----------------------------------------------------------------------------------------------------
 | @file     Footer.tsx
 | @brief    Footer component with contact info, navigation links, social media, and message form
 | @param    --
 | @return   Footer JSX element
 -----------------------------------------------------------------------------------------------------*/

import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { NavLink } from "react-router-dom";
import logo from "../../src/assets/images/logo-white.png";

const Footer = () => {
  return (
    <footer className="bg-secondary-500 text-white py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-start lg:flex-row lg:justify-between gap-8 lg:gap-16">
        {/* Logo and Info */}
        <div>
          <div className="flex flex-row items-start">
            <img src={logo} alt="Foundation Logo" className="w-16 mb-3" />
            <div className="ml-3 space-y-2 text-sm">
              <h2 className="font-bold max-w-54 text-2xl">
                Fondation Denise Time Mafodom
              </h2>
              <p className="flex items-center gap-2">
                <MdEmail /> fdtm@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <MdLocationOn /> Dschang, Cameroon
              </p>
              <p className="flex items-center gap-2">
                <MdPhone /> +237 6666666
              </p>
            </div>
          </div>
        </div>

        {/* Home Links */}
        <div>
          <h3 className="font-semibold mb-3">Home</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/about-us" className="hover:underline">
                About us
              </NavLink>
            </li>
            <li>
              <NavLink to="/what-we-do" className="hover:underline">
                What we do
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact-us" className="hover:underline">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h3 className="font-semibold mb-3">More</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/projects" className="hover:underline">
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className="hover:underline">
                Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/donate" className="hover:underline">
                Donate
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className="hover:underline">
                Blog
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Connect Links */}
        <div>
          <h3 className="font-semibold mb-3">Connect</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaFacebook /> Facebook
            </li>
            <li className="flex items-center gap-2">
              <FaInstagram /> Instagram
            </li>
            <li className="flex items-center gap-2">
              <FaTwitter /> Twitter
            </li>
            <li className="flex items-center gap-2">
              <FaLinkedin /> LinkedIn
            </li>
          </ul>
        </div>

        {/* Anonymous Message form */}
        <div>
          <h3 className="font-bold text-3xl mb-2">
            Send us an anonymous message
          </h3>
          <form className="flex border-2 mt-4 border-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="Type in here"
              className="w-full p-2 text-white focus:outline-none placeholder:text-white bg-transparent"
            />
            <button
              type="submit"
              className="bg-white text-secondary-500 px-4 font-medium"
            >
              send
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
