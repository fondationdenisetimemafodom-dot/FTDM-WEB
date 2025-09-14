/*-----------------------------------------------------------------------------------------------------
 | @component PartnershipForm
 | @brief    Form component for partners to submit their details
 | @param    --
 | @return   Partnership form JSX element
 -----------------------------------------------------------------------------------------------------*/
function PartnershipForm() {
  return (
    <form className="space-y-4 w-full lg:w-[800px] mx-auto p-6 rounded-lg">
      <h2 className="text-[30px] text-secondary-500 font-bold text-center">
        Partnership form
      </h2>
      <p className="text-center text-sm text-gray-600">
        Fill the form below correctly and we will review and get to you
      </p>

      {/* First Name */}
      <input
        type="text"
        placeholder="First name"
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Last Name */}
      <input
        type="text"
        placeholder="Last name"
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Whatsapp Number */}
      <input
        type="text"
        placeholder="Whatsapp number"
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
      />

      {/* Reason for Partnership */}
      <textarea
        placeholder="Tell Us Why You Would Want To Partner With Us"
        className="w-full border-3 border-blue-300 rounded p-2 focus:outline-none focus:border-blue-500"
        rows={3}
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Submit
      </button>
    </form>
  );
}

export default PartnershipForm;
