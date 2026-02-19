import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { talenApi } from "../../services/api";
import { motion } from "framer-motion"; 
import {
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import { IoChevronBack } from "react-icons/io5";
import { IoStarSharp } from "react-icons/io5";

const TalentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [talent, setTalent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTalentDetail = async () => {
      try {
        setLoading(true);
        const res = await talenApi.getById(id);
        const data = res.data?.data || res.data;
        setTalent(data);
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTalentDetail();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFEFF]">
        <div className="w-10 h-10 border-4 border-[#A855F7]/20 border-t-[#A855F7] rounded-full animate-spin"></div>
      </div>
    );

  if (!talent)
    return (
      <div className="text-center py-20 bg-[#FDFEFF] min-h-screen">
        <p className="text-gray-400 text-lg">Talent ma'lumotlari topilmadi.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[#A855F7] font-semibold hover:underline"
        >
          Orqaga qaytish
        </button>
      </div>
    );

  // Skillarni formatlash
  const skillsArray = Array.isArray(talent.skills)
    ? talent.skills
    : JSON.parse(talent.skils || "[]");

      const defaultAvatar =
    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-gilroy text-[#1A1C21] pb-20">
      {/* Top Navigation */}
      <div className="max-w-[1100px] mx-auto px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#A855F7] transition-all font-medium group"
        >
          <IoChevronBack className="group-hover:-translate-x-1 transition-transform" />
          Back to Search
        </button>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative">
                  <img
                    src={
                      talent.image ||
                      talent.profilePhoto ||
                      defaultAvatar
                    }
                    className="w-32 h-32 md:w-40 md:h-40 rounded-[28px] object-cover ring-8 ring-[#F9F5FF]"
                    alt="Profile"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {talent.first_name} {talent.last_name}
                    </h1>
                  </div>
                  <p className="text-[#A855F7] font-bold text-sm mt-2 tracking-wide uppercase">
                    {talent.occupation} • {talent.specialty}
                  </p>

                  <div className="flex flex-wrap gap-5 mt-6 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-lg">
                      <HiOutlineLocationMarker className="text-lg text-gray-400" />
                      {talent.city}, {talent.country}
                    </div>
                    <div className="flex items-center gap-2 bg-[#F9FAFB] px-3 py-1.5 rounded-lg">
                      <HiOutlineBriefcase className="text-lg text-gray-400" />
                      {talent.workplace_type || "Remote"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-50">
                <h3 className="text-lg font-bold mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-[#F9F5FF] text-[#7F56D9] px-4 py-2 rounded-full text-sm font-semibold border border-[#F4EBFF]"
                    >
                      {typeof skill === "object" ? skill.skill : skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Additional Info / About Section (Optional) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-lg font-bold mb-4">About</h3>
              <p className="text-gray-500 leading-relaxed">
                {talent.bio ||
                  `${talent.first_name} is a highly skilled ${talent.specialty} specialist with extensive experience in ${talent.occupation}. Dedicated to delivering high-quality results and professional collaboration.`}
              </p>
            </motion.div>
          </div>

          {/* Right Column: Hire Card a*/}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-md sticky top-8"
            >
              <div className="mb-6">
                <span className="text-gray-400 text-sm font-medium">
                  Expected Salary
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-[#101828]">
                    ${talent.minimum_salary?.toLocaleString()}
                  </span>
                  <span className="text-gray-400 font-medium">/month</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Employment</span>
                  <span className="font-semibold text-sm">
                    {talent.work_type || "Contract"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Rating</span>
                  <span className="font-semibold text-sm flex items-center gap-1">
                    <IoStarSharp />
                    4.8
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 text-sm">Availability</span>
                  <span className=" font-semibold text-sm">Open to work</span>
                </div>
              </div>

              <button className="w-full bg-[#7F56D9] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#6941C6] transition-all shadow-lg shadow-purple-200 active:scale-[0.98]">
                Hire {talent.first_name}
              </button>

              <button className="w-full mt-3 bg-white text-gray-700 py-4 rounded-2xl font-bold text-lg border border-gray-200 hover:bg-gray-50 transition-all">
                Save Profile
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDetail;
