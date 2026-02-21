import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobApi, talentApi } from "../../services/api";
import { MdLocationOn, MdKeyboardArrowLeft, MdClose } from "react-icons/md";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi"; // Trash iconlari qo'shildi
import { formatDistanceToNow } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

// --- SKELETON COMPONENT ---
const SkeletonLoader = () => (
    <div className="max-w-5xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
            <div className="h-16 bg-gray-200 rounded-2xl flex-1"></div>
            <div className="h-16 bg-gray-200 rounded-2xl w-full md:w-40"></div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 mb-10">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
        <div className="space-y-6">
            {[1, 2].map(i => (
                <div key={i} className="h-44 bg-white border border-gray-100 rounded-[2rem]"></div>
            ))}
        </div>
    </div>
);

const JobDetailPageCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [allTalents, setAllTalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDetailTab, setActiveDetailTab] = useState('Matches');

    // --- DELETE STATE ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        occupation: "",
        location: "",
        salary_min: "",
        salary_max: "",
        description: "",
        skils: "",
        specialty: "",
        job_type: "",
        workplace_type: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [jobRes, talentRes] = await Promise.all([
                jobApi.getById(id),
                talentApi.getAll()
            ]);
            const jobData = jobRes.data;
            setJob(jobData);
            setAllTalents(talentRes.data || []);

            setFormData({
                occupation: jobData.occupation || "",
                location: jobData.location || "",
                salary_min: jobData.salary_min || "",
                salary_max: jobData.salary_max || "",
                description: jobData.description || "",
                skils: Array.isArray(jobData.skils) ? jobData.skils.join(", ") : jobData.skils || "",
                specialty: jobData.specialty || jobData.occupation || "",
                job_type: jobData.job_type || "Full-time",
                workplace_type: jobData.workplace_type || "Remote"
            });
        } catch (error) {
            console.error("Ma'lumotlarni yuklashda xatolik:", error);
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- DELETE LOGIC ---
    const handleDeleteJob = async () => {
        try {
            await jobApi.delete(id);
            toast.success("E'lon muvaffaqiyatli o'chirildi");
            navigate('/company/my-jobs'); // O'chgandan keyin my-jobs sahifasiga o'tadi
        } catch (error) {
            toast.error("O'chirishda xatolik yuz berdi");
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleUpdateJob = async (e) => {
        e.preventDefault();
        const updatePromise = jobApi.update(id, {
            ...formData,
            company_id: job.company_id,
            salary_min: Number(formData.salary_min),
            salary_max: Number(formData.salary_max)
        });

        toast.promise(updatePromise, {
            loading: 'Yangilanmoqda...',
            success: 'Ish muvaffaqiyatli yangilandi! 🎉',
            error: (err) => `Xatolik: ${err.response?.data?.message || 'Saqlab bo‘lmadi'}`,
        });

        try {
            const response = await updatePromise;
            if (response.data || response.status === 200) {
                setIsEditModalOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getInitials = (firstName, lastName) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : '';
        const l = lastName ? lastName.charAt(0).toUpperCase() : '';
        return (f + l) || '?';
    };

    const parseTalentSkills = (skillsStr) => {
        try {
            if (!skillsStr) return [];
            const parsed = typeof skillsStr === 'string' ? JSON.parse(skillsStr) : skillsStr;
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    };

    const getJobSkills = () => {
        if (!job?.skils) return [];
        if (typeof job.skils === 'string') {
            return job.skils.split(',').map(s => s.trim()).filter(s => s !== "");
        }
        return Array.isArray(job.skils) ? job.skils : [];
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD', minimumFractionDigits: 0,
        }).format(price || 0);
    };

    const matchedTalents = allTalents.filter(talent => {
        if (!job || !job.skils) return false;
        const jobSkillsArr = getJobSkills().map(s => s.toLowerCase());
        const talentSkills = parseTalentSkills(talent.skils);
        return talentSkills.some(t => jobSkillsArr.includes(t.skill.toLowerCase()));
    });

    if (loading) return (
        <div className="w-full min-h-screen bg-[#F8F9FA] p-8">
            <SkeletonLoader />
        </div>
    );

    if (!job) return <div className="p-10 text-center text-red-500">Job not found</div>;

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA] p-3 sm:p-6 md:p-8 text-left font-sans">
            <Toaster position="top-center" />

            <div className="max-w-5xl mx-auto relative">

                {/* --- DELETE MODAL --- */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiAlertCircle size={40} className="text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ishonchingiz komilmi?</h2>
                                <p className="text-gray-500 mb-6">Bu e'lonni butunlay o'chirib tashlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl">Bekor qilish</button>
                                    <button onClick={handleDeleteJob} className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-200">O'chirish</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- EDIT MODAL --- */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <MdClose size={28} />
                            </button>

                            <h2 className="text-2xl font-bold text-[#343C44] mb-8">Edit Job Position</h2>
                            <form onSubmit={handleUpdateJob} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Occupation</label>
                                    <input name="occupation" value={formData.occupation} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl focus:outline-none" required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Location</label>
                                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl focus:outline-none" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Salary Min ($)</label>
                                    <input name="salary_min" type="number" value={formData.salary_min} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl focus:outline-none" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#343C44]">Salary Max ($)</label>
                                    <input name="salary_max" type="number" value={formData.salary_max} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl focus:outline-none" />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-bold text-[#343C44]">Skills (comma separated)</label>
                                    <input name="skils" placeholder="HTML, CSS, React" value={formData.skils} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl focus:outline-none" />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-bold text-[#343C44]">Description</label>
                                    <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#F8F9FA] border border-gray-100 rounded-xl focus:outline-none resize-none" />
                                </div>
                                <button type="submit" className="md:col-span-2 w-full mt-4 py-4 bg-[#5CB85C] text-white font-bold rounded-2xl shadow-lg hover:bg-[#4cae4c] transition-all">
                                    Update Job Details
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 mt-2 md:mt-0 w-full">
                    <div className="bg-white px-6 sm:px-8 py-4 rounded-2xl shadow-sm border border-gray-100 flex-1 w-full text-center md:text-left">
                        <h1 className="text-xl sm:text-2xl font-bold text-[#4B5563]">Job Details</h1>
                    </div>
                    <button
                        onClick={() => navigate('/company/post-job')}
                        className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-all shrink-0"
                    >
                        Post a Job
                    </button>
                </div>

                {/* 2. Main Job Card */}
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute top-6 right-6 p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#73dd73] hover:text-white transition-all shadow-sm z-10"
                    >
                        <FiEdit2 size={20} />
                    </button>

                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-6 mb-8 pr-12">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="w-24 h-24 shrink-0 rounded-full bg-[#00A7AC] flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-gray-50 shadow-sm">
                                {job.company?.profileimg_url ? (
                                    <img src={job.company.profileimg_url} className="w-full h-full object-cover" alt="logo" />
                                ) : (job.occupation?.charAt(0) || "J")}
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[#343C44]">{job.occupation}</h2>
                                <p className="text-[#8E8E8E] font-[600] text-[22px] mt-1">{job.company?.company_name || "Company"}</p>
                                <div className="text-[#a7a6a6] flex items-center justify-center md:justify-start gap-1 mt-2 text-base sm:text-lg font-medium">
                                    <MdLocationOn /> {job.location} ({job.workplace_type || "Remote"})
                                </div>
                            </div>
                        </div>
                        <div className="text-center lg:text-right w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0">
                            <p className="text-[#8E8E8E] text-base sm:text-[18px] font-[600] mb-1">
                                {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'Recently'}
                            </p>
                            <p className="text-2xl sm:text-[28px] font-bold text-[#4B5563]">
                                ${job.salary_min?.toLocaleString()} {job.salary_max ? `- $${job.salary_max.toLocaleString()}` : ""}
                            </p>
                        </div>
                    </div>

                    <p className="text-[#343C44] text-base sm:text-lg leading-relaxed mb-8 text-center md:text-left">{job.description}</p>

                    <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="w-full">
                            <h4 className="text-[#343C44] font-bold mb-4 uppercase text-xs sm:text-sm tracking-widest text-center md:text-left">Required skills</h4>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                                {getJobSkills().map((skill, index) => (
                                    <span key={index} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#F3F4F6] text-[#4B5563] rounded-xl font-semibold border border-gray-100 text-sm sm:text-base">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* DELETE BUTTON - Cardning pastki o'ng qismida */}
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100 shadow-sm shrink-0"
                            title="O'chirish"
                        >
                            <FiTrash2 size={22} />
                        </button>
                    </div>
                </div>

                {/* Back Button */}
                <button onClick={() => navigate('/company/my-jobs')} className="group flex items-center justify-center md:justify-start gap-2 text-[#1D3D54] font-bold mb-10 py-2 px-4 rounded-lg transition-all hover:bg-[#1D3D54]/5 w-full md:w-auto">
                    <MdKeyboardArrowLeft size={24} /> <span>Back to my jobs</span>
                </button>

                {/* Tabs */}
                <div className="flex bg-[#E9E9E9] p-1.5 rounded-[1.5rem] w-full relative mb-10 overflow-hidden">
                    <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.2rem] shadow-sm transition-all duration-300 ${activeDetailTab === 'Matches' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
                    <button onClick={() => setActiveDetailTab('Matches')} className={`flex-1 py-3.5 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === 'Matches' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>All Matches</button>
                    <button onClick={() => setActiveDetailTab('Invitations')} className={`flex-1 py-3.5 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === 'Invitations' ? 'text-[#343C44]' : 'text-[#8E8E8E]'}`}>Invitations sent</button>
                </div>
                {/* Candidates List */}
                <div className="pb-20">
                    {activeDetailTab === 'Matches' ? (
                        <>
                            <div className="mb-6 flex items-baseline justify-center md:justify-start gap-2">
                                <span className="text-xl sm:text-2xl font-bold text-[#343C44]">{matchedTalents.length}</span>
                                <span className="text-xl sm:text-2xl font-bold text-[#343C44]">candidates</span>
                            </div>

                            {/* Grid sozlamalari */}
                            <div className="grid grid-cols-1 min-[1350px]:grid-cols-2 gap-6 sm:gap-8 w-full justify-items-center min-[1350px]:justify-items-stretch">
                                {matchedTalents.map(talent => (
                                    <div
                                        key={talent.id}
                                        className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-all min-h-[400px] w-full max-w-[650px] min-[1350px]:max-w-none"
                                    >
                                        {/* 1. Header Section: Eng muhim o'zgarish shu yerda */}
                                        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-5 mb-5 w-full">

                                            {/* Profil va Ism: lg (1024px) gacha ustun bo'lib turadi, keyin yonma-yon */}
                                            <div className="flex flex-col lg:flex-row items-center gap-4 flex-1 w-full min-w-0">
                                                {/* Rasm: shrink-0 - o'lchamni qat'iy saqlaydi */}
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-[#F3F4F6] flex items-center justify-center overflow-hidden border border-gray-100">
                                                    {talent.image ? (
                                                        <img src={talent.image} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-2xl font-bold text-gray-400">
                                                            {getInitials(talent.first_name, talent.last_name)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Matn qismi: w-full va text-center/left moslashuvchan */}
                                                <div className="w-full min-w-0 text-center lg:text-left">
                                                    <h2 className="text-[20px] sm:text-[24px] font-bold text-[#3a3a3a] leading-tight mb-1 break-words">
                                                        {talent.specialty || "Specialist"}
                                                    </h2>
                                                    <p className="text-gray-500 text-[16px] sm:text-[18px] font-medium leading-relaxed break-words">
                                                        {talent.first_name} {talent.last_name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Narx va Joylashuv: lg gacha markazda, keyin o'ngda */}
                                            <div className="shrink-0 w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0 text-center lg:text-right">
                                                <div className="text-[22px] sm:text-[26px] font-bold text-[#1D3D54] leading-tight whitespace-nowrap">
                                                    {formatPrice(talent.minimum_salary)}
                                                </div>
                                                <div className="flex items-center justify-center lg:justify-end gap-1 text-gray-400 text-[13px] font-bold uppercase mt-2">
                                                    <HiOutlineLocationMarker size={16} className="text-[#00A7AC]" />
                                                    <span className="whitespace-nowrap">{talent.city || "UZB"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Skills Section */}
                                        <div className="flex-1 my-6">
                                            <h4 className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-3 text-center lg:text-left">
                                                Candidate Skills:
                                            </h4>
                                            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                                {parseTalentSkills(talent.skils).slice(0, 6).map((s, i) => (
                                                    <span key={i} className="px-4 py-1.5 bg-[#f8fafc] text-[#64748b] text-[13px] font-semibold rounded-xl border border-gray-100 whitespace-nowrap">
                                                        {s.skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3. Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-50">
                                            <Link
                                                to={`/talents/${talent.id}`}
                                                className="flex-1 py-4 bg-[#1D3D54] text-white text-center font-bold rounded-2xl text-[14px] hover:bg-[#152e40] transition-all active:scale-95"
                                            >
                                                View profile
                                            </Link>
                                            <button className="flex-1 py-4 border-2 border-[#1D3D54] text-[#1D3D54] font-bold rounded-2xl text-[14px] hover:bg-gray-50 transition-all active:scale-95">
                                                Send alert
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed text-gray-400">
                            Ro'yxat bo'sh.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailPageCompany;