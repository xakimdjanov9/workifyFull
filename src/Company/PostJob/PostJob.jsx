import React, { useState, useEffect, useRef } from 'react';
import { jobApi, talentApi, UZBEK_REGIONS } from '../../services/api.js';
import { XCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Img from "../../assets/Frame.png";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('Matches');
  const [allTalents, setAllTalents] = useState([]);
  
  const [showRegions, setShowRegions] = useState(false);
  const [activeLangIndex, setActiveLangIndex] = useState(null);

  const regionRef = useRef(null);
  const langRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (regionRef.current && !regionRef.current.contains(event.target)) setShowRegions(false);
      if (langRef.current && !langRef.current.contains(event.target)) setActiveLangIndex(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (submitted) {
      talentApi.getAll().then(res => setAllTalents(res.data || [])).catch(console.error);
    }
  }, [submitted]);

  const LANGUAGE_LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Native'];

  const filteredRegions = UZBEK_REGIONS.filter(region => 
    region.toLowerCase().includes(formData.location.toLowerCase())
  );

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
      toast.error("Kompaniya ID topilmadi.");
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
      toast.error("Xatolik yuz berdi");
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
                {matchedTalents.map(talent => (
                  <div key={talent.id} className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all p-8 text-center">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-50">
                      {talent.image ? <img src={talent.image} className="w-full h-full object-cover" alt="talent" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-300">{talent.first_name?.[0]}</div>}
                    </div>
                    <h4 className="font-bold text-[#343C44] text-xl">{talent.first_name} {talent.last_name}</h4>
                    <p className="text-gray-500 font-medium mb-1">{talent.specialty || "Specialist"}</p>
                    <p className="text-gray-400 text-sm mb-4">{talent.location || "Uzbekistan"}</p>
                    <p className="text-xl font-bold text-[#343C44] mb-4">${talent.minimum_salary?.toLocaleString()}</p>
                    <Link to={`/talents/${talent.id}`} className="w-full py-3 border-2 border-[#A855F7] text-[#A855F7] rounded-full text-sm font-bold hover:bg-purple-50 transition-colors inline-block">View profile</Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-400 text-lg">Yuborilgan taklifnomalar ro'yxati bo'sh.</div>
          )}
        </div>
      </div>
    );
  }

  const inputClass = "w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#50C594] bg-white transition-all";

  return (
    <div className="max-w-5xl mx-auto my-6 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex items-center justify-between bg-white p-3 rounded-[1.5rem] shadow-sm mb-8 border border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-6 py-2 text-[#343C44] font-bold text-xl hover:text-[#50C594] transition-colors"
        >
          <ArrowLeft size={24} />
          Back
        </button>

        <button 
          onClick={() => navigate('/company/my-jobs')} 
          className="bg-[#50C594] hover:opacity-90 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95"
        >
          My Jobs
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
        <h2 className="text-2xl font-bold text-[#343C44] mb-8">Post a job</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Occupation</label>
              <input className={inputClass} placeholder="Designer" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Speciality</label>
              <input className={inputClass} placeholder="UX/UI" value={formData.speciality} onChange={(e) => setFormData({ ...formData, speciality: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative" ref={regionRef}>
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <div className="relative">
                <input 
                  className={inputClass} 
                  placeholder="Select or type region" 
                  value={formData.location}
                  onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setShowRegions(true); }}
                  onFocus={() => setShowRegions(true)}
                />
                <ChevronDown size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform cursor-pointer ${showRegions ? 'rotate-180' : ''}`} />
              </div>
              {showRegions && filteredRegions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredRegions.map(region => (
                    <div key={region} className="px-4 py-3 hover:bg-[#50C594] hover:text-white cursor-pointer transition-colors border-b border-gray-50 last:border-none" onClick={() => { setFormData({ ...formData, location: region }); setShowRegions(false); }}>
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Salary (USD)</label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" className={`${inputClass} pl-7`} placeholder="300.00" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value.replace(/\D/g, "") })} />
                </div>
                <span className="text-gray-400 text-sm">To</span>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="text" className={`${inputClass} pl-7`} placeholder="500.00" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Skills</label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <input className={inputClass} placeholder="Figma" value={skill.name} onChange={(e) => handleDynamicChange(index, 'name', e.target.value, 'skills')} />
                  <input 
                    className={inputClass} 
                    placeholder="2 years" 
                    value={skill.experience} 
                    onChange={(e) => handleDynamicChange(index, 'experience', e.target.value, 'skills')}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        const digits = e.target.value.replace(/\D/g, "");
                        if (digits.length > 0) {
                          const newDigits = digits.slice(0, -1);
                          const newData = [...formData.skills];
                          newData[index].experience = newDigits ? `${newDigits} years` : "";
                          setFormData({ ...formData, skills: newData });
                          e.preventDefault();
                        }
                      }
                    }}
                  />
                  {index > 0 && (
                    <XCircle 
                      className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" 
                      onClick={() => removeField(index, 'skills')} 
                      size={32} 
                    />
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField('skills')} className="px-6 py-2 bg-[#50C594] text-white rounded-full text-sm font-medium hover:opacity-90 transition-colors">Add skill</button>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Language</label>
              {formData.languages.map((lang, index) => (
                <div key={index} className="flex gap-3 items-center group" ref={index === activeLangIndex ? langRef : null}>
                  <input className={inputClass} placeholder="English" value={lang.name} onChange={(e) => handleDynamicChange(index, 'name', e.target.value, 'languages')} />
                  <div className="relative w-full">
                    <div className={`${inputClass} flex justify-between items-center cursor-pointer`} onClick={() => setActiveLangIndex(activeLangIndex === index ? null : index)}>
                      <span className={lang.level ? "text-gray-800" : "text-gray-400"}>{lang.level || "Level"}</span>
                      <ChevronDown size={16} className={`transition-transform ${activeLangIndex === index ? 'rotate-180' : ''}`} />
                    </div>
                    {activeLangIndex === index && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {LANGUAGE_LEVELS.map(level => (
                          <div key={level} className="px-4 py-2 hover:bg-[#50C594] hover:text-white cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-none" onClick={() => {
                            const newLangs = [...formData.languages];
                            newLangs[index].level = level;
                            setFormData({ ...formData, languages: newLangs });
                            setActiveLangIndex(null);
                          }}>{level}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  {index > 0 && (
                    <XCircle 
                      className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" 
                      onClick={() => removeField(index, 'languages')} 
                      size={32} 
                    />
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField('languages')} className="px-6 py-2 bg-[#50C594] text-white rounded-full text-sm font-medium hover:opacity-90 transition-colors">Add language</button>
            </div>
          </div>

          <div className="space-y-2 mt-8">
            <label className="text-sm font-semibold text-gray-700">Job description</label>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <textarea className="w-full p-4 h-48 focus:outline-none resize-none" placeholder="Write here..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
            </div>
          </div>

          <div className="pt-6 text-center">
            <button type="submit" disabled={loading} className="w-full md:w-1/3 py-3 bg-[#50C594] hover:opacity-90 text-white font-bold rounded-full text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Posting..." : "Submit Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;