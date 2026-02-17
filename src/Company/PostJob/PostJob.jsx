import React, { useState, useEffect } from 'react';
import { jobApi, talentApi, UZBEK_REGIONS } from '../../services/api.js';
import { XCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { HiOutlineLocationMarker } from "react-icons/hi";
import { Link } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Img from "../../assets/Frame.png"

const PostJob = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('Matches');
  const [allTalents, setAllTalents] = useState([]);

  const user = JSON.parse(localStorage.getItem("user_info") || "{}");
  const companyId = user.id || user._id;

  const [formData, setFormData] = useState({
    occupation: '',
    speciality: '',
    location: '',
    salary_min: '',
    salary_max: '',
    skills: [{ name: '', experience: '' }],
    languages: [{ name: '', level: '' }],
    description: ''
  });

  useEffect(() => {
    if (submitted) {
      talentApi.getAll().then(res => setAllTalents(res.data || [])).catch(console.error);
    }
  }, [submitted]);

  const LANGUAGE_LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Native'];

  const parseTalentSkills = (skillsStr) => {
    try {
      if (!skillsStr) return [];
      const parsed = typeof skillsStr === 'string' ? JSON.parse(skillsStr) : skillsStr;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };

  const matchedTalents = allTalents.filter(talent => {
    const jobOcc = formData.occupation.toLowerCase().trim();
    const talentOcc = (talent.occupation || "").toLowerCase().trim();
    const talentSpec = (talent.specialty || "").toLowerCase().trim();
    const isOccMatch = talentOcc.includes(jobOcc) || talentSpec.includes(jobOcc) || jobOcc.includes(talentOcc);
    const talentSkills = parseTalentSkills(talent.skils);
    const jobSkills = formData.skills.map(s => s.name.toLowerCase().trim()).filter(s => s !== "");
    const isSkillMatch = jobSkills.length === 0 || talentSkills.some(ts =>
      jobSkills.some(js => ts.skill?.toLowerCase().includes(js))
    );
    return isOccMatch || isSkillMatch;
  });

  const handleDynamicChange = (index, field, value, type) => {
    const newData = [...formData[type]];
    if (field === 'experience') {
      const num = value.replace(/\D/g, "");
      newData[index][field] = num ? `${num} years` : "";
    } else {
      newData[index][field] = value;
    }
    setFormData({ ...formData, [type]: newData });
  };

  const addField = (type) => {
    const newItem = type === 'skills' ? { name: '', experience: '' } : { name: '', level: '' };
    setFormData({ ...formData, [type]: [...formData[type], newItem] });
  };

  const removeField = (index, type) => {
    const newData = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Kompaniya ID topilmadi. Iltimos, qaytadan login qiling.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        company_id: Number(companyId),
        occupation: formData.occupation,
        speciality: formData.speciality,
        job_type: "Full-time",
        workplace_type: "Remote",
        salary_min: Number(formData.salary_min),
        salary_max: Number(formData.salary_max),
        description: formData.description,
        location: formData.location,
        skills: formData.skills.map(s => `${s.name} (${s.experience})`).join(", ")
      };
      await jobApi.create(payload);
      toast.success("Ish muvaffaqiyatli joylashtirildi!");
      setSubmitted(true);
    } catch (err) {
      toast.error("Xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-5xl mx-auto my-10 px-4">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Congratulations!</h2>
          <p className="text-gray-500 mb-6">Congratulations on successfully submitting your job posting!</p>
          <div className="flex justify-center mb-6">
            <img src={Img} alt="Success" className="max-w-xs md:max-w-sm" />
          </div>
          <Link to="/company/my-jobs" className="px-8 py-2 border-2 border-[#1D3D54] text-[#1D3D54] rounded-full font-bold hover:bg-gray-50 transition-all inline-block">
            Back to My jobs
          </Link>
        </div>

        <div className="flex bg-[#E9E9E9] p-1.5 rounded-[1.5rem] w-full relative mb-10 overflow-hidden max-w-2xl mx-auto">
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.2rem] shadow-sm transition-all duration-300
              ${activeDetailTab === 'Matches' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />

          <button onClick={() => setActiveDetailTab('Matches')} className={`flex-1 py-3.5 z-10 font-bold text-sm transition-colors ${activeDetailTab === 'Matches' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>
            All Matches
          </button>
          <button onClick={() => setActiveDetailTab('Invitations')} className={`flex-1 py-3.5 z-10 font-bold text-sm transition-colors ${activeDetailTab === 'Invitations' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>
            Invitations sent
          </button>
        </div>

        <div className="pb-20">
          {activeDetailTab === 'Matches' ? (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 px-4 py-2 bg-gray-50 rounded-lg inline-block">Best matches</h3>
              <p className="text-gray-400 font-medium mb-6">{matchedTalents.length} talents matches for "{formData.occupation}"</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedTalents.length > 0 ? matchedTalents.map(talent => (
                  <div key={talent.id} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all p-8 text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-50">
                      {talent.image ? (
                        <img src={talent.image} className="w-full h-full object-cover" alt="talent" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">
                          {talent.first_name?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h4 className="font-bold text-[#343C44] text-xl">{talent.first_name} {talent.last_name}</h4>
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>

                    <p className="text-gray-500 font-medium mb-1">{talent.specialty || talent.occupation || "Specialist"}</p>
                    <p className="text-gray-400 text-sm mb-4">{talent.location || "Uzbekistan"} (Remote)</p>
                    <p className="text-xl font-bold text-[#343C44] mb-4">${talent.minimum_salary?.toLocaleString() || "0.00"}</p>

                    <div className="flex items-center justify-center gap-1 mb-6">
                      <div className="flex text-yellow-400">
                        {[...Array(4)].map((_, i) => <span key={i} className="text-xl">★</span>)}
                        <span className="text-xl text-gray-300">★</span>
                      </div>
                      <span className="text-gray-500 text-sm ml-1">(4.0)</span>
                      <span className="text-gray-300 mx-2">|</span>
                      <span className="text-gray-400 text-sm">1K reviews</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link to={`/talents/${talent.id}`} className="w-full py-3 border-2 border-[#A855F7] text-[#A855F7] rounded-full text-sm font-bold hover:bg-purple-50 transition-colors">
                        View profile
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-10 text-gray-400">
                    No matching talents found for this job criteria.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400 text-lg">
              Yuborilgan taklifnomalar ro'yxati bo'sh.
            </div>
          )}
        </div>
      </div>
    );
  }

  const inputClass = "w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white transition-all";

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Post a job</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Occupation</label>
            <input
              className={inputClass} placeholder="Designer"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Speciality</label>
            <input
              className={inputClass} placeholder="UX/UI"
              value={formData.speciality}
              onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <input
              className={inputClass}
              placeholder="Type region (e.g. A...)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              list="region-list"
              required
            />
            <datalist id="region-list">
              {UZBEK_REGIONS.map(r => <option key={r} value={r} />)}
            </datalist>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Salary (USD)</label>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text" className={`${inputClass} pl-7`} placeholder="300.00"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <span className="text-gray-400 text-sm">To</span>
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="text" className={`${inputClass} pl-7`} placeholder="500.00"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value.replace(/\D/g, "") })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Skills</label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 items-center group">
                <input
                  className={inputClass} placeholder="Figma"
                  value={skill.name}
                  onChange={(e) => handleDynamicChange(index, 'name', e.target.value, 'skills')}
                />
                <input
                  className={inputClass} placeholder="2 years"
                  value={skill.experience}
                  onChange={(e) => handleDynamicChange(index, 'experience', e.target.value, 'skills')}
                />
                {index > 0 && <XCircle className="text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => removeField(index, 'skills')} size={50} />}
              </div>
            ))}
            <button type="button" onClick={() => addField('skills')} className="px-6 py-2 bg-emerald-400 text-white rounded-full text-sm font-medium hover:bg-emerald-500 transition-colors">
              Add skill
            </button>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Language</label>
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex gap-2 items-center group">
                <input
                  className={inputClass} placeholder="English"
                  value={lang.name}
                  onChange={(e) => handleDynamicChange(index, 'name', e.target.value, 'languages')}
                />
                <select
                  className={inputClass}
                  value={lang.level}
                  onChange={(e) => handleDynamicChange(index, 'level', e.target.value, 'languages')}
                >
                  <option value="">Select Level</option>
                  {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {index > 0 && <XCircle className="text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => removeField(index, 'languages')} size={50} />}
              </div>
            ))}
            <button type="button" onClick={() => addField('languages')} className="px-6 py-2 bg-emerald-400 text-white rounded-full text-sm font-medium hover:bg-emerald-500 transition-colors">
              Add language
            </button>
          </div>
        </div>

        <div className="space-y-2 mt-8">
          <label className="text-sm font-semibold text-gray-700">Job description</label>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <textarea
              className="w-full p-4 h-48 focus:outline-none resize-none"
              placeholder="Write here ...,"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="pt-6 text-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-1/3 py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-full text-lg shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post a job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;