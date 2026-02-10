import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BiSolidCity } from "react-icons/bi";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaChevronDown,
  FaSearch,
  FaUser,
  FaBuilding,
} from "react-icons/fa";
import { PiFlagPennantFill } from "react-icons/pi";
import PasswordInput from "../common/PasswordInput";
import LoadingSpinner from "../common/LoadingSpinner";
import { COUNTRIES, UZBEK_REGIONS, INDUSTRIES } from "../../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState("company");
  const [activeTab, setActiveTab] = useState("talent");

  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    country: "",
    city: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  const countryRef = useRef(null);
  const cityRef = useRef(null);
  const industryRef = useRef(null);

  useEffect(() => {
    if (location.state?.allData) {
      setFormData(location.state.allData);
    }
  }, [location.state]);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );
  const filteredIndustries = INDUSTRIES.filter((i) =>
    i.toLowerCase().includes(industrySearch.toLowerCase()),
  );
  const filteredCities = UZBEK_REGIONS.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      let formatted = "+998 ";
      let mainDigits = digits.startsWith("998") ? digits.slice(3) : digits;
      if (mainDigits.length > 0) formatted += "(" + mainDigits.substring(0, 2);
      if (mainDigits.length >= 2)
        formatted += ") " + mainDigits.substring(2, 5);
      if (mainDigits.length >= 5) formatted += "-" + mainDigits.substring(5, 7);
      if (mainDigits.length >= 7) formatted += "-" + mainDigits.substring(7, 9);
      setFormData((prev) => ({ ...prev, [name]: formatted.trim() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.password || passwordError)
      return toast.error("Please fix password errors");
    navigate("/company/signup/telegram", { state: { allData: formData } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target))
        setShowCountryDropdown(false);
      if (cityRef.current && !cityRef.current.contains(event.target))
        setShowCityDropdown(false);
      if (industryRef.current && !industryRef.current.contains(event.target))
        setShowIndustryDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputStyle =
    "w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#163D5C] outline-none transition-all text-gray-700 bg-white";
  const iconStyle =
    "w-[30px] absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-lg pr-2 border-r border-gray-100";
  const labelStyle = "text-xl font-medium text-gray-600 mb-2 block";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-left">
      <ToastContainer />
      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl p-8 md:p-16 transition-all duration-500">
        {/* User Type Toggle */}
        <div className="relative bg-gray-100 rounded-[50px] border border-gray-200 grid grid-cols-2 p-1 mb-6 sm:mb-8 overflow-hidden">
          <div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-md transition-all duration-300"
            style={{
              transform: `translateX(${activeTab === "talent" ? "100%" : "0%"
                })`,
            }}
          ></div>
          <Link
            to="/talent/registration/step-1"
            onClick={() => setActiveTab("talent")}
            className={`flex items-center justify-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 relative z-10 font-medium text-sm xs:text-base ${activeTab === "talent" ? "text-[#163D5C]" : "text-gray-400"
              }`}
          >
            <FaUser className="text-sm xs:text-base" />
            <span className="truncate">Talent</span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("company")}
            className={`flex items-center justify-center gap-1 xs:gap-2 px-3 xs:px-4 sm:px-6 py-2 xs:py-3 relative z-10 font-medium text-sm xs:text-base ${activeTab === "company" ? "text-[#163D5C]" : "text-gray-400"
              }`}
          >
            <FaBuilding className="text-sm xs:text-base" />
            <span className="truncate">Company</span>
          </button>
        </div>

        {/* Dinamik Kontent */}
        <div
          className={`transition-all duration-500 transform ${userType === "company" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none hidden"}`}
        >
          <form onSubmit={handleNext} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              <div className="space-y-8">
                <div>
                  <label className={labelStyle}>Company name</label>
                  <div className="relative">
                    <BiSolidCity className={iconStyle} />
                    <input
                      name="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="TechCells"
                    />
                  </div>
                </div>
                {/* Email Section */}
                <div>
                  <label className={labelStyle}>Email</label>
                  <div className="relative">
                    <FaEnvelope className={iconStyle} />
                    <input
                      name="email"
                      type="email"
                      list="email-options"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="example@domain.com"
                      autoComplete="off" // Brauzerning eski ma'lumotlari xalaqit bermasligi uchun
                    />
                    <datalist id="email-options">
                      {/* Faqat foydalanuvchi biror narsa yozgan bo'lsa va @ bo'lmasa ko'rsatamiz */}
                      {formData.email && !formData.email.includes("@") && (
                        <>
                          <option value={`${formData.email}@gmail.com`} />
                          <option value={`${formData.email}@mail.ru`} />
                          <option value={`${formData.email}@outlook.com`} />
                          <option value={`${formData.email}@icloud.com`} />
                        </>
                      )}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Website</label>
                  <div className="relative">
                    <FaGlobe className={iconStyle} />
                    <input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="www.TechCells.com"
                    />
                  </div>
                </div>

                {/* Country Section */}
                <div className="relative" ref={countryRef}>
                  <label className={labelStyle}>Country</label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <PiFlagPennantFill className={iconStyle} />
                    <input
                      readOnly
                      value={formData.country}
                      className={`${inputStyle} cursor-pointer`}
                      placeholder="Select Country"
                    />
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                  </div>
                  {showCountryDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            autoFocus
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg outline-none text-sm"
                            placeholder="Search country..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {filteredCountries.map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              country: c,
                              city: "",
                            }));
                            setShowCountryDropdown(false);
                            setCountrySearch("");
                          }}
                          className="px-5 py-3 hover:bg-gray-50 cursor-pointer"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className={labelStyle}>Phone</label>
                  <div className="relative">
                    <FaPhoneAlt className={iconStyle} />
                    <input
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputStyle}
                      placeholder="+998 (99) 123-45-67"
                      maxLength={19}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Password</label>
                  <PasswordInput
                    name="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, password: e.target.value }));
                    }}
                    error={passwordError}
                  />
                </div>

                {/* Industry Section */}
                <div className="relative" ref={industryRef}>
                  <label className={labelStyle}>Industry</label>
                  <div
                    className="relative cursor-pointer"
                    onClick={() =>
                      setShowIndustryDropdown(!showIndustryDropdown)
                    }
                  >
                    <BiSolidCity className={iconStyle} />
                    <input
                      readOnly
                      value={formData.industry}
                      className={`${inputStyle} cursor-pointer`}
                      placeholder="Select Industry"
                    />
                  </div>
                  {showIndustryDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            autoFocus
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg outline-none text-sm"
                            placeholder="Search..."
                            value={industrySearch}
                            onChange={(e) => setIndustrySearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {filteredIndustries.map((i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setFormData((p) => ({ ...p, industry: i }));
                            setShowIndustryDropdown(false);
                          }}
                          className="px-5 py-3 hover:bg-gray-50 cursor-pointer"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* City Section (Dinamik Input) */}
                <div className="relative" ref={cityRef}>
                  <label className={labelStyle}>City</label>
                  <div className="relative">
                    <BiSolidCity className={iconStyle} />
                    {formData.country === "Uzbekistan" ? (
                      // Uzbekistan bo'lsa DROPDOWN
                      <>
                        <input
                          readOnly
                          value={formData.city}
                          onClick={() => setShowCityDropdown(!showCityDropdown)}
                          className={`${inputStyle} cursor-pointer`}
                          placeholder="Select City"
                        />
                        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                        {showCityDropdown && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                              <input
                                autoFocus
                                className="w-full px-4 py-2 bg-gray-50 rounded-lg outline-none text-sm"
                                placeholder="Search city..."
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                              />
                            </div>
                            {filteredCities.map((city) => (
                              <div
                                key={city}
                                onClick={() => {
                                  setFormData((p) => ({ ...p, city: city }));
                                  setShowCityDropdown(false);
                                }}
                                className="px-5 py-3 hover:bg-gray-50 cursor-pointer"
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      // Boshqa davlat bo'lsa ODDIY TEXT INPUT
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Enter your city"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 pt-12">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full md:w-72 py-4 border-2 border-[#163D5C] text-[#163D5C] rounded-full font-bold text-xl hover:bg-blue-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-full md:w-72 py-4 bg-[#163D5C] text-white rounded-full font-bold text-xl shadow-lg hover:opacity-90 transition-all"
              >
                Next
              </button>
            </div>
          </form>
        </div>

        {/* Talent Mode Empty Space */}
        <div
          className={`transition-all duration-500 flex flex-col items-center justify-center min-h-[400px] ${userType === "talent" ? "opacity-100 scale-100" : "opacity-0 scale-95 hidden"}`}
        >
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-gray-300 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-400">
              Talent Registration
            </h2>
            <p className="text-gray-400 max-w-xs mx-auto">
              This section is coming soon for talents. Please stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
