import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { jobApi, companyApi } from '../../services/api';
import { MdLocationOn } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from "../../talent/Context/ThemeContext";

const MyJobs = () => {
    const { settings } = useTheme();
    const isDark = settings.darkMode;

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Applications');
    const [currentCompany, setCurrentCompany] = useState(null);
    const [expandedJobs, setExpandedJobs] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                const compRes = await companyApi.getById(decoded.id);
                setCurrentCompany(compRes.data);

                const jobRes = await jobApi.getByCompany(decoded.id);
                setJobs(Array.isArray(jobRes.data) ? jobRes.data : []);
            }
        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik!");
        } finally {
            setTimeout(() => setLoading(false), 800);
        }
    };

    const toggleExpand = (id) => {
        setExpandedJobs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Recently';
            const res = formatDistanceToNow(new Date(dateString), { addSuffix: true });
            return res.charAt(0).toUpperCase() + res.slice(1);
        } catch (e) {
            return 'Recently';
        }
    };

    const renderLogo = (job) => {
        const logoUrl = job.company?.profileimg_url || currentCompany?.profileimg_url;
        const name = job.company?.company_name || currentCompany?.company_name || "C";

        if (logoUrl) {
            return (
                <img
                    src={logoUrl}
                    alt="logo"
                    className="w-full h-full object-cover rounded-full"
                />
            );
        }
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#00A7AC] text-white text-2xl sm:text-3xl font-bold rounded-full uppercase shadow-inner">
                {name.charAt(0)}
            </div>
        );
    };

    const JobSkeleton = () => (
        <div className={`p-6 sm:p-10 rounded-[2.5rem] shadow-sm border animate-pulse mb-8 transition-colors duration-500 ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
            }`}>
            <div className="flex flex-col md:flex-row gap-8">
                <div className={`w-24 h-24 shrink-0 rounded-full mx-auto md:mx-0 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}></div>
                <div className="flex-1 space-y-4">
                    <div className={`h-7 rounded-lg w-3/4 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}></div>
                    <div className={`h-5 rounded-lg w-1/2 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}></div>
                    <div className={`h-20 rounded-xl w-full ${isDark ? "bg-gray-900" : "bg-gray-100"}`}></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`p-4 sm:p-6 lg:p-8 min-h-screen font-sans text-left transition-colors duration-500 ${isDark ? "bg-[#121212] text-white" : "bg-[#F9FAFB] text-[#1E293B]"
            }`}>
            <ToastContainer position="top-right" autoClose={3000} theme={isDark ? "dark" : "colored"} />

            <div className="max-w-7xl mx-auto flex flex-col min-h-[85vh]">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 mt-4 md:mt-0">
                    <h1 className={`text-xl sm:text-2xl font-bold px-8 py-4 rounded-2xl shadow-sm w-full md:flex-1 border text-center md:text-left transition-colors duration-500 ${isDark ? "bg-[#1E1E1E] border-gray-800 text-gray-100" : "bg-white border-gray-100 text-[#4B5563]"
                        }`}>
                        My jobs
                    </h1>
                    <button
                        onClick={() => navigate('/company/post-job')}
                        className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-all text-lg"
                    >
                        Post a Job
                    </button>
                </div>

                {/* Jobs List */}
                <div className="space-y-8 mb-12">
                    {loading ? (
                        [1, 2, 3].map((i) => <JobSkeleton key={i} />)
                    ) : jobs.length > 0 ? (
                        jobs.map((job) => {
                            const isExpanded = expandedJobs[job.id];
                            const descriptionText = job.description || "";

                            return (
                                <div key={job.id} className={`p-6 sm:p-8 md:p-10 rounded-[2.5rem] shadow-sm border transition-all duration-500 ${isDark ? "bg-[#1E1E1E] border-gray-800 hover:bg-[#252525]" : "bg-white border-gray-100 hover:shadow-md"
                                    }`}>
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

                                        {/* Logo Container */}
                                        <div className={`w-24 h-24 shrink-0 shadow-sm rounded-full overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-50"}`}>
                                            {renderLogo(job)}
                                        </div>

                                        {/* Info Section */}
                                        <div className="flex-1 flex flex-col lg:flex-row justify-between items-center lg:items-start w-full gap-4">
                                            <div className="text-center md:text-left">
                                                <h2 className={`text-[25px] font-bold tracking-tight leading-tight transition-colors duration-500 ${isDark ? "text-white" : "text-[#343C44]"
                                                    }`}>
                                                    {job.occupation}
                                                </h2>
                                                <p className={`font-[600] text-[23px] mt-0.5 ${isDark ? "text-gray-400" : "text-[#8E8E8E]"
                                                    }`}>
                                                    {job.company?.company_name || currentCompany?.company_name}
                                                </p>
                                                <div className={`flex items-center justify-center md:justify-start gap-1 text-[16px] mt-1 font-[500] ${isDark ? "text-gray-500" : "text-[#8E8E8E]"
                                                    }`}>
                                                    <span>{job.location}</span>
                                                    {job.workplace_type && (
                                                        <span>({job.workplace_type})</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price and Date */}
                                            <div className="flex flex-col items-center lg:items-end w-full lg:w-auto mt-2 lg:mt-0">
                                                <p className="text-[#a7a6a6] text-[16px] font-[600] flex items-center gap-1 mb-0.5">
                                                    <MdLocationOn className="hidden md:block" /> {job.location}
                                                </p>
                                                <p className="text-[#9c9c9c] text-[16px] font-bold mb-0.5 uppercase">
                                                    {formatDate(job.created_at || job.createdAt)}
                                                </p>
                                                <p className={`text-[26px] font-bold ${isDark ? "text-[#5CB85C]" : "text-[#4B5563]"
                                                    }`}>
                                                    ${job.salary_min?.toLocaleString()}{job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-6">
                                        <p className={`text-[17px] leading-relaxed text-center md:text-left transition-colors duration-500 ${isDark ? "text-gray-300" : "text-[#343C44]"
                                            }`}>
                                            {isExpanded ? descriptionText : `${descriptionText.slice(0, 170)}...`}
                                            {descriptionText.length > 170 && (
                                                <span
                                                    onClick={() => toggleExpand(job.id)}
                                                    className={`opacity-60 cursor-pointer ml-1 hover:opacity-100 transition-opacity font-bold italic text-sm ${isDark ? "text-blue-400" : "text-[#6b6f74]"
                                                        }`}
                                                >
                                                    {isExpanded ? " show less" : " ... show more"}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <div className={`mt-8 pt-6 border-t flex justify-center md:justify-end ${isDark ? "border-gray-800" : "border-gray-50"}`}>
                                        <button
                                            onClick={() => navigate(`/company/job-detail/${job.id}`)}
                                            className={`w-full md:w-auto px-10 py-3.5 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all uppercase tracking-widest ${isDark ? "bg-[#3E3E3E] hover:bg-[#4E4E4E]" : "bg-[#1e3a5a] hover:bg-[#2a4d74]"
                                                }`}
                                        >
                                            Job Detail
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={`p-20 rounded-[2.5rem] text-center border border-dashed font-bold uppercase italic transition-colors duration-500 ${isDark ? "bg-[#1E1E1E] border-gray-700 text-gray-600" : "bg-white border-gray-200 text-gray-400"
                            }`}>
                            No jobs found
                        </div>
                    )}
                </div>

                {/* Footer Tabs (Bottom Bar) */}
                <div className="mt-auto pt-6 flex justify-center">
                    <div className={`p-1.5 rounded-[1.8rem] w-full max-w-[1000px] border shadow-sm flex transition-colors duration-500 ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-[#E9E9E9] border-gray-100"
                        }`}>
                        <button
                            onClick={() => setActiveTab('Applications')}
                            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${activeTab === 'Applications'
                                ? isDark ? "bg-[#3E3E3E] text-white shadow-lg" : "bg-white text-[#343C44] shadow-sm"
                                : isDark ? "text-gray-500 hover:text-gray-300" : "text-[#8E8E8E] hover:text-[#343C44]"
                                }`}
                        >
                            Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('Matches')}
                            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all duration-300 ${activeTab === 'Matches'
                                ? isDark ? "bg-[#3E3E3E] text-white shadow-lg" : "bg-white text-[#343C44] shadow-sm"
                                : isDark ? "text-gray-500 hover:text-gray-300" : "text-[#8E8E8E] hover:text-[#343C44]"
                                }`}
                        >
                            Matches
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyJobs;