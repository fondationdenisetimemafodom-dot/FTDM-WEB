/*-----------------------------------------------------------------------------------------------------
 | @file     Footer.tsx
 | @brief    Translated Footer component with contact info, navigation links, social media, and message form
 | @param    --
 | @return   Footer JSX element
 -----------------------------------------------------------------------------------------------------*/

import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../src/assets/images/logo-white.png";

const Footer = () => {
  const { t } = useTranslation("footer");

  return (
    <footer className="bg-secondary-500 text-white py-8 px-20 mt-auto">
      <div className=" mx-auto flex flex-col items-start lg:flex-row lg:justify-between gap-8 lg:gap-16">
        {/* Logo and Info */}
        <div>
          <div className="flex flex-row items-start">
            <img src={logo} alt="Foundation Logo" className="w-16 mb-3" />
            <div className="ml-3 space-y-2 text-sm">
              <h2 className="font-bold max-w-54 text-2xl">{t("title")}</h2>
              <p className="flex items-center gap-2">
                <MdEmail /> {t("contact.email")}
              </p>
              <p className="flex items-center gap-2">
                <MdLocationOn /> {t("contact.location")}
              </p>
              <p className="flex items-center gap-2">
                <MdPhone /> {t("contact.phone")}
              </p>
            </div>
          </div>
        </div>

        {/* Home Links */}
        <div>
          <h3 className="font-semibold mb-3">{t("sections.home")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/about-us" className="hover:underline">
                {t("links.about")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/what-we-do" className="hover:underline">
                {t("links.whatWeDo")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact-us" className="hover:underline">
                {t("links.contact")}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* More Links */}
        <div>
          <h3 className="font-semibold mb-3">{t("sections.more")}</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/projects" className="hover:underline">
                {t("links.projects")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" className="hover:underline">
                {t("links.events")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/donate" className="hover:underline">
                {t("links.donate")}
              </NavLink>
            </li>
            <li>
              <NavLink to="/blog" className="hover:underline">
                {t("links.blog")}
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Connect Links */}
        <div>
          <h3 className="font-semibold mb-3">{t("sections.connect")}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaFacebook /> {t("social.facebook")}
            </li>
            <li className="flex items-center gap-2">
              <FaInstagram /> {t("social.instagram")}
            </li>
            <li className="flex items-center gap-2">
              <FaTwitter /> {t("social.twitter")}
            </li>
            <li className="flex items-center gap-2">
              <FaLinkedin /> {t("social.linkedin")}
            </li>
          </ul>
        </div>

        {/* Anonymous Message form */}
        <div>
          <h3 className="font-bold text-3xl mb-2">{t("sections.message")}</h3>
          <form className="flex border-2 mt-4 border-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder={t("form.placeholder") || ""}
              className="w-full p-2 text-white focus:outline-none placeholder:text-white bg-transparent"
            />
            <button
              type="submit"
              className="bg-white text-secondary-500 px-4 font-medium"
            >
              {t("form.send")}
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
