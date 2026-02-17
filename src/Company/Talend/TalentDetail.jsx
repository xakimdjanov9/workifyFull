import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TalentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [talent, setTalent] = useState(null);

  useEffect(() => {
    axios.get(`https://workifybackend-production.up.railway.app/api/talent/${id}`)
      .then(res => setTalent(res.data))
      .catch(err => console.error("Detail yuklashda xatolik:", err));
  }, [id]);

  if (!talent) return null;

  return (
    <div className="max-w-[1000px] mx-auto p-6 bg-[#F9FAFB] min-h-screen font-gilroy">
      <button onClick={() => navigate(-1)} className="mb-8 font-bold text-gray-400 hover:text-black transition flex items-center gap-2">
        <span>←</span> BACK TO LIST
      </button>

      <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-purple-500/5 mb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start border-b border-gray-50 pb-10">
          <img src={talent.image || talent.profilePhoto} className="w-44 h-44 rounded-[40px] object-cover shadow-lg border-4 border-white" />
          <div className="flex-1 text-center md:text-left mt-4 md:mt-2">
            <h1 className="text-4xl font-black text-[#111827]">
              {talent.first_name} {talent.last_name}
              <span className="text-blue-500 text-2xl ml-2">✔</span>
            </h1>
            <p className="text-[#A855F7] font-black uppercase tracking-[0.15em] text-sm mt-3">
              {talent.occupation} • {talent.specialty}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              <div className="flex text-yellow-400">★★★★<span className="text-gray-200">★</span></div>
              <span className="font-bold text-[#111827]">4.0</span>
              <span className="text-gray-400 text-sm">(1,000 Reviews)</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {/* Skills */}
          <div>
            <h3 className="text-xl font-black text-[#111827] mb-6 border-l-4 border-[#A855F7] pl-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2.5">
              {talent.skills?.map((skill, i) => (
                <span key={i} className="bg-[#111827] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#F9FAFB] p-8 rounded-[40px] border border-gray-50">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">Preferences</h3>
            <div className="space-y-6">
              <div className="flex flex-col border-b border-gray-100 pb-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Work Type</span>
                <span className="font-bold text-[#111827]">{talent.work_type || "Full-time"}</span>
              </div>
              <div className="flex flex-col border-b border-gray-100 pb-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Workplace</span>
                <span className="font-bold text-[#111827]">{talent.workplace_type || "Remote"}</span>
              </div>
              <div className="flex flex-col border-b border-gray-100 pb-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Minimum Salary</span>
                <span className="font-bold text-green-600 text-xl">${talent.minimum_salary?.toLocaleString()} / month</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Location</span>
                <span className="font-bold text-[#111827]">{talent.location || talent.countrycity}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button className="bg-[#111827] text-white px-12 py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95">
            Hire {talent.first_name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TalentDetail;