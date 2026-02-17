import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineBriefcase } from "react-icons/hi";
import { PiMonitorBold } from "react-icons/pi";
import { LuUser } from "react-icons/lu";
import {
  FaUser,
  FaGlobe,
  FaMoneyBillWave,
  FaCity,
  FaEarthAmericas,
  FaPlus,
} from "react-icons/fa6";
import { IoCloseCircleOutline } from "react-icons/io5";

const Talents = () => {
  const [allTalents, setAllTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Skills and expertice");

  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [occupation, setOccupation] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [skillsRows, setSkillsRows] = useState([
    { id: 1, skill: "", experience: "", isDefault: true },
  ]);

  const [workType, setWorkType] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [location, setLocation] = useState({ country: "", city: "" });

  const popularLanguages = ["Uzbek", "English", "Russian", "Turkish", "German"];
  const defaultAvatar =
    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://workifybackend-production.up.railway.app/api/talent")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setAllTalents(data);
        setFilteredTalents(data);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  // --- TAKOMILLASHTIRILGAN FILTER MANTIQI ---
  useEffect(() => {
    let result = [...allTalents];

    if (occupation)
      result = result.filter((t) =>
        t.occupation?.toLowerCase().includes(occupation.toLowerCase()),
      );
    if (speciality)
      result = result.filter((t) =>
        t.specialty?.toLowerCase().includes(speciality.toLowerCase()),
      );
    if (selectedSpecs.length > 0)
      result = result.filter((t) => selectedSpecs.includes(t.specialty));

    if (selectedLangs.length > 0) {
      result = result.filter((talent) => {
        try {
          const tLangs =
            typeof talent.language === "string"
              ? JSON.parse(talent.language)
              : talent.language || [];
          return selectedLangs.some((sl) =>
            tLangs.some((tl) => tl.language.toLowerCase() === sl.toLowerCase()),
          );
        } catch {
          return false;
        }
      });
    }

    // Skills va Experience mantiqi: Kamida yozilgan yilga teng yoki ko'p bo'lishi kerak
    // --- SKILLS VA EXPERIENCE (TUZATILGAN QISMI) ---
    const activeSkills = skillsRows.filter((r) => r.skill.trim() !== "");

    if (activeSkills.length > 0) {
      result = result.filter((talent) => {
        try {
          const talentSkills =
            typeof talent.skils === "string"
              ? JSON.parse(talent.skils)
              : talent.skils || [];

          return activeSkills.every((fRow) => {
            return talentSkills.some((ts) => {
              const skillNameFromDB = (ts.skill || "").toLowerCase();
              const skillNameFromFilter = fRow.skill.toLowerCase();

              const isSkillMatch =
                skillNameFromDB.includes(skillNameFromFilter);

              const talentExpRaw = ts.experience_years || "0";
              const talentExpNumber =
                parseInt(talentExpRaw.replace(/\D/g, "")) || 0;

              const requiredExpNumber = parseInt(fRow.experience) || 0;

              const isExpMatch =
                fRow.experience === "" || talentExpNumber >= requiredExpNumber;

              return isSkillMatch && isExpMatch;
            });
          });
        } catch (e) {
          console.error("Skill parsing error:", e);
          return false;
        }
      });
    }

    if (workType) result = result.filter((t) => t.work_type === workType);
    if (workplaceType)
      result = result.filter((t) => t.workplace_type === workplaceType);
    if (salaryRange.min)
      result = result.filter(
        (t) => (t.minimum_salary || 0) >= Number(salaryRange.min),
      );
    if (salaryRange.max)
      result = result.filter(
        (t) => (t.minimum_salary || 0) <= Number(salaryRange.max),
      );
    if (location.country)
      result = result.filter((t) =>
        t.country?.toLowerCase().includes(location.country.toLowerCase()),
      );
    if (location.city)
      result = result.filter((t) =>
        t.city?.toLowerCase().includes(location.city.toLowerCase()),
      );

    setFilteredTalents(result);
  }, [
    occupation,
    speciality,
    skillsRows,
    selectedSpecs,
    selectedLangs,
    workType,
    workplaceType,
    salaryRange,
    location,
    allTalents,
  ]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-6 md:py-10 px-4 md:px-6 font-gilroy text-[#111827]">
      <div className="max-w-[1240px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
          <h1 className="text-[28px] md:text-[32px] font-black">Talents</h1>
          <Link to="/company/post-job" className="w-full md:w-auto bg-[#50C594] text-white px-8 py-3 rounded-[15px] font-bold text-[18px] shadow-sm hover:bg-[#45b385] transition-colors">
            Post a Job
          </Link>
        </div>

        {/* Filter Card */}
        <div className="max-w-[1043px] mx-auto mb-6">
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-2 flex items-center justify-between gap-2">
            <div className="flex flex-1 gap-1 md:gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {["Specialty", "Skills and expertice", "Preferences"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 min-w-[130px] py-3 rounded-[15px] font-bold text-[13px] md:text-[16px] transition-all z-10 whitespace-nowrap ${activeTab === tab ? "text-[#26282c]" : "text-[#C7C7C7]"}`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="tabBg"
                        className="absolute inset-0 bg-[#F8F9FA] shadow-sm rounded-[15px] -z-10"
                      />
                    )}
                    {tab}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2 md:px-4 transition-transform flex-shrink-0"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-white rounded-[25px] md:rounded-[30px] p-5 md:p-8 border border-gray-100 shadow-sm overflow-hidden"
              >
                {activeTab === "Specialty" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4">
                    {[
                      ...new Set(
                        allTalents.map((t) => t.specialty).filter(Boolean),
                      ),
                    ].map((spec, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecs.includes(spec)}
                          onChange={() =>
                            setSelectedSpecs((prev) =>
                              prev.includes(spec)
                                ? prev.filter((s) => s !== spec)
                                : [...prev, spec],
                            )
                          }
                          className="w-5 h-5 rounded border-gray-300 text-[#8B39E5] focus:ring-[#8B39E5]"
                        />
                        <span
                          className={`text-[14px] ${selectedSpecs.includes(spec) ? "text-[#8B39E5] font-bold" : "text-gray-600 group-hover:text-black"}`}
                        >
                          {spec}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {activeTab === "Skills and expertice" && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                      <div className="space-y-2">
                        <p className="font-bold text-[16px] md:text-[18px]">
                          Occupation
                        </p>
                        <div className="relative">
                          <HiOutlineBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#163D5C]" />
                          <input
                            type="text"
                            placeholder="Designer"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-[12px] focus:bg-white focus:border-[#8B39E5] outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-[16px] md:text-[18px]">
                          Speciality
                        </p>
                        <div className="relative">
                          <PiMonitorBold className="absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#163D5C]" />
                          <input
                            type="text"
                            placeholder="UX/UI"
                            value={speciality}
                            onChange={(e) => setSpeciality(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-[12px] focus:bg-white focus:border-[#8B39E5] outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[#163D5C] font-bold text-[16px] md:text-[18px]">
                        Languages
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {popularLanguages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() =>
                              setSelectedLangs((prev) =>
                                prev.includes(lang)
                                  ? prev.filter((l) => l !== lang)
                                  : [...prev, lang],
                              )
                            }
                            className={`px-4 md:px-5 py-2 rounded-[12px] font-bold text-[12px] md:text-[14px] border transition-all ${selectedLangs.includes(lang) ? "bg-[#8B39E5] text-white border-[#8B39E5]" : "bg-[#F8F9FA] text-gray-500 border-transparent hover:border-gray-300"}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="hidden md:grid grid-cols-2 gap-10 font-bold text-[18px] text-[#163D5C]">
                        <p>Skills</p>
                        <p>Experience (years)</p>
                      </div>
                      {skillsRows.map((row) => (
                        <div
                          key={row.id}
                          className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-10 relative group bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl"
                        >
                          <div className="relative">
                            <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#163D5C]" />
                            <input
                              type="text"
                              placeholder="Figma"
                              value={row.skill}
                              onChange={(e) =>
                                setSkillsRows(
                                  skillsRows.map((r) =>
                                    r.id === row.id
                                      ? { ...r, skill: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                              className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] md:bg-[#F8F9FA] border border-transparent rounded-[12px] focus:bg-white focus:border-[#8B39E5] outline-none transition-all"
                            />
                          </div>
                          <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-[#163D5C]" />
                            <input
                              type="number"
                              placeholder="Minimum years (e.g. 2)"
                              value={row.experience}
                              onChange={(e) =>
                                setSkillsRows(
                                  skillsRows.map((r) =>
                                    r.id === row.id
                                      ? { ...r, experience: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                              className="w-full pl-12 pr-12 py-3 bg-[#F8F9FA] md:bg-[#F8F9FA] border border-transparent rounded-[12px] focus:bg-white focus:border-[#8B39E5] outline-none transition-all"
                            />
                            {skillsRows.length > 1 && (
                              <IoCloseCircleOutline
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer hover:text-red-500 transition-colors"
                                size={22}
                                onClick={() =>
                                  setSkillsRows(
                                    skillsRows.filter((r) => r.id !== row.id),
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() =>
                            setSkillsRows([
                              ...skillsRows,
                              {
                                id: Date.now(),
                                skill: "",
                                experience: "",
                                isDefault: false,
                              },
                            ])
                          }
                          className="flex items-center gap-2 bg-[#50C594]/10 text-[#50C594] px-6 py-2.5 rounded-[12px] font-bold hover:bg-[#50C594] hover:text-white transition-all text-sm md:text-base"
                        >
                          <FaPlus size={14} /> Add skill
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Preferences" && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-4">
                        <p className="font-bold text-[16px] md:text-[18px] text-[#163D5C]">
                          Employment type
                        </p>
                        <div className="flex flex-wrap bg-[#F8F9FA] p-1.5 rounded-[15px] gap-1">
                          {[
                            "fulltime",
                            "parttime",
                            "contract",
                            "freelance",
                          ].map((type) => (
                            <button
                              key={type}
                              onClick={() =>
                                setWorkType(workType === type ? "" : type)
                              }
                              className={`flex-1 min-w-[70px] py-2 rounded-[12px] text-[12px] md:text-[14px] font-bold capitalize transition-all ${workType === type ? "bg-white shadow-md text-[#8B39E5]" : "text-gray-400 hover:text-gray-600"}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="font-bold text-[16px] md:text-[18px] text-[#163D5C]">
                          Workplace type
                        </p>
                        <div className="flex bg-[#F8F9FA] p-1.5 rounded-[15px] gap-1">
                          {["Onsite", "Remote", "Hybrid"].map((type) => (
                            <button
                              key={type}
                              onClick={() =>
                                setWorkplaceType(
                                  workplaceType === type ? "" : type,
                                )
                              }
                              className={`flex-1 py-2 rounded-[12px] text-[12px] md:text-[14px] font-bold transition-all ${workplaceType === type ? "bg-white shadow-md text-[#8B39E5]" : "text-gray-400 hover:text-gray-600"}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="font-bold text-[16px] md:text-[18px] text-[#163D5C]">
                          Salary range
                        </p>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="relative flex-1">
                            <FaMoneyBillWave className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="number"
                              placeholder="Min"
                              value={salaryRange.min}
                              onChange={(e) =>
                                setSalaryRange({
                                  ...salaryRange,
                                  min: e.target.value,
                                })
                              }
                              className="w-full pl-9 md:pl-11 p-3 bg-[#F8F9FA] border border-transparent rounded-[12px] outline-none focus:bg-white focus:border-[#8B39E5] text-sm md:text-base"
                            />
                          </div>
                          <div className="text-gray-400 font-bold">—</div>
                          <div className="relative flex-1">
                            <FaMoneyBillWave className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="number"
                              placeholder="Max"
                              value={salaryRange.max}
                              onChange={(e) =>
                                setSalaryRange({
                                  ...salaryRange,
                                  max: e.target.value,
                                })
                              }
                              className="w-full pl-9 md:pl-11 p-3 bg-[#F8F9FA] border border-transparent rounded-[12px] outline-none focus:bg-white focus:border-[#8B39E5] text-sm md:text-base"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-4">
                          <p className="font-bold text-[16px] md:text-[18px] text-[#163D5C]">
                            Country
                          </p>
                          <div className="relative">
                            <FaEarthAmericas className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Uzbekistan"
                              value={location.country}
                              onChange={(e) =>
                                setLocation({
                                  ...location,
                                  country: e.target.value,
                                })
                              }
                              className="w-full pl-9 md:pl-11 p-3 bg-[#F8F9FA] border border-transparent rounded-[12px] outline-none focus:bg-white focus:border-[#8B39E5] text-sm md:text-base"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="font-bold text-[16px] md:text-[18px] text-[#163D5C]">
                            City
                          </p>
                          <div className="relative">
                            <FaCity className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Tashkent"
                              value={location.city}
                              onChange={(e) =>
                                setLocation({
                                  ...location,
                                  city: e.target.value,
                                })
                              }
                              className="w-full pl-9 md:pl-11 p-3 bg-[#F8F9FA] border border-transparent rounded-[12px] outline-none focus:bg-white focus:border-[#8B39E5] text-sm md:text-base"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="max-w-[1043px] mx-auto mb-6 md:mb-8 pt-6 md:pt-8 border-t border-gray-200">
          <h2 className="text-[20px] md:text-[24px] font-bold">
            {filteredTalents.length}{" "}
            {filteredTalents.length === 1 ? "talent" : "talents"} found
          </h2>
        </div>

        {/* Talents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
          {filteredTalents.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-[30px] border border-gray-100 p-6 text-center w-full max-w-[330px] h-auto min-h-[440px] shadow-sm flex flex-col items-center justify-between hover:border-[#8B39E5] hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-[110px] h-[110px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden border-4 border-[#F8F9FA] group-hover:border-[#8B39E5]/10 transition-colors">
                <img
                  src={talent.image || defaultAvatar}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="font-bold text-[17px] md:text-[18px] group-hover:text-[#8B39E5] transition-colors">
                  {talent.first_name} {talent.last_name}
                </h3>
                <p className="text-gray-500 text-[13px] md:text-[14px] bg-[#F8F9FA] px-3 py-1 rounded-full inline-block">
                  {talent.occupation || "Specialist"}
                </p>
              </div>

              <div className="my-4">
                <p className="text-gray-400 text-[11px] md:text-[12px] uppercase tracking-wider font-bold">
                  Minimum Salary
                </p>
                <div className="font-black text-[22px] md:text-[24px] text-[#111827]">
                  ${talent.minimum_salary?.toLocaleString() || "0"}
                </div>
              </div>

              <button
                onClick={() => navigate(`/company/talents/${talent.id}`)}
                className="w-full py-3 border-2 border-[#8B39E5] text-[#8B39E5] rounded-xl font-bold hover:bg-[#8B39E5] hover:text-white transition-all transform active:scale-95"
              >
                View profile
              </button>
            </div>
          ))}
        </div>

        {filteredTalents.length === 0 && (
          <div className="text-center py-16 md:py-20 bg-white rounded-[30px] border border-dashed border-gray-300">
            <p className="text-gray-400 text-base md:text-lg">
              No talents found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Talents;
