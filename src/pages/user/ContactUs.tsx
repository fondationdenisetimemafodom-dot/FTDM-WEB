"use client";
/*-----------------------------------------------------------------------------------------------------
 | @component Contact
 | @brief    Contact page with contact details, message form, and footer
 | @param    --
 | @return   Contact JSX element
 -----------------------------------------------------------------------------------------------------*/

import React from "react";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

function ContactUs() {
  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />

      {/* Contact Section */}
      <section className="">
        <div className=" flex flex-col  gap-12 items-center ">
          <div className="flex items-start justify-center bg-[#F3F5F8] w-full py-20 px-25 gap-28 ">
            <div className="mt-2 bg-soft-dark-500 h-4 w-20"></div>

            <div>
              <p className="uppercase text-2xl font-bold text-soft-dark-500">
                CONTACT US
              </p>
              <div className="flex flex-col gap-2 max-w-[480px]">
                <h2 className="text-[56px] font-bold text-main-500 mt-2">
                  We'd love to hear from you
                </h2>
                <p className="text-secondary-text-500 text-3xl">
                  Have any question in mind or want to enquire? Please feel free
                  to contact us through the form or the following details.
                </p>
              </div>
            </div>

            <div className="space-y-12 text-gray-700">
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  Let's talk!
                </h3>
                <div className="flex space-x-10">
                  <span className="text-gray-500">+237 690000000</span>
                  <span className="text-gray-500">help@fdtm.org</span>
                </div>
                <hr className="mt-3 text-gray-300" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  Head Office
                </h3>
                <p className="text-gray-500">West region, Dschang</p>
                <p className="text-gray-500">Cameroon</p>
              </div>
              <div>
                <h3 className="font-bold text-2xl text-secondary-500">
                  Branch Office
                </h3>
                <p className="text-gray-500">Mafodom</p>
                <p className="text-gray-500">Cameroon</p>
              </div>
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaFacebook />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaTwitter />
                </a>
                <a
                  href="#"
                  className="text-secondary-500 hover:text-secondary-500"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="bg-white rounded-xl  p-8">
            <h3 className="text-[40px] text-soft-dark-500 font-bold mb-6 text-center">
              Want to leave us a message?
            </h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <input
                  type="text"
                  placeholder="First name"
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <input
                  type="email"
                  placeholder="Email id"
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
                />
              </div>
              <textarea
                placeholder="Leave Message..."
                rows={5}
                className="border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500 px-4 py-2 w-full"
              ></textarea>
              <button
                type="submit"
                className="w-full bg-main-500 text-white py-3 rounded-lg font-semibold hover:bg-secondary-600 transition"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactUs;
