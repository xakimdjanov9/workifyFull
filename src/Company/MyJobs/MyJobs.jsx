import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { jobApi, companyApi } from '../../services/api';
import { MdLocationOn } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';

const MyJobs = () => {
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
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 animate-pulse mb-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-24 h-24 shrink-0 bg-gray-200 rounded-full mx-auto md:mx-0"></div>
                <div className="flex-1 space-y-4">
                    <div className="h-7 bg-gray-200 rounded-lg w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
                    <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-[#F9FAFB] min-h-screen font-sans text-left">
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <div className="max-w-7xl mx-auto flex flex-col min-h-[85vh]">

                {/* Header - ORIGINAL STYLE */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 mt-4 md:mt-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#4B5563] bg-white px-8 py-5 rounded-2xl shadow-sm w-full md:flex-1 border border-gray-100 text-center md:text-left">
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
                                <div key={job.id} className="bg-white p-6 sm:p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

                                        {/* Logo - ORIGINAL SIZE */}
                                        <div className="w-24 h-24 shrink-0 shadow-sm rounded-full overflow-hidden border border-gray-50">
                                            {renderLogo(job)}
                                        </div>

                                        {/* Info Section - ORIGINAL TEXT SIZES */}
                                        <div className="flex-1 flex flex-col lg:flex-row justify-between items-center lg:items-start w-full gap-4">
                                            <div className="text-center md:text-left">
                                                <h2 className="text-[25px] font-bold text-[#343C44] tracking-tight leading-tight">
                                                    {job.occupation}
                                                </h2>
                                                <p className="text-[#8E8E8E] font-[600] text-[23px] mt-0.5">
                                                    {job.company?.company_name || currentCompany?.company_name}
                                                </p>
                                                <div className="flex items-center justify-center md:justify-start gap-1 text-[#8E8E8E] text-[16px] mt-1 font-[500]">
                                                    <span>{job.location}</span>
                                                    {job.workplace_type && (
                                                        <span className="text-[#8E8E8E]">
                                                            ({job.workplace_type})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price and Date - ORIGINAL COLORS */}
                                            <div className="flex flex-col items-center lg:items-end w-full lg:w-auto mt-2 lg:mt-0">
                                                <p className="text-[#a7a6a6] text-[16px] font-[600] flex items-center gap-1 mb-0.5">
                                                    <MdLocationOn className="hidden md:block" /> {job.location}
                                                </p>
                                                <p className="text-[#9c9c9c] text-[16px] font-bold mb-0.5 uppercase">
                                                    {formatDate(job.created_at || job.createdAt)}
                                                </p>
                                                <p className="text-[26px] font-bold text-[#4B5563]">
                                                    ${job.salary_min?.toLocaleString()}{job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description - ORIGINAL STYLE */}
                                    <div className="mt-6">
                                        <p className="text-[#343C44] text-[17px] leading-relaxed text-center md:text-left">
                                            {isExpanded ? descriptionText : `${descriptionText.slice(0, 170)}...`}
                                            {descriptionText.length > 170 && (
                                                <span
                                                    onClick={() => toggleExpand(job.id)}
                                                    className="text-[#6b6f74] opacity-40 cursor-pointer ml-1 hover:opacity-100 transition-opacity font-bold italic text-sm"
                                                >
                                                    {isExpanded ? " show less" : " ... show more"}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Footer Button - ORIGINAL STYLE */}
                                    <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center md:justify-end">
                                        <button
                                            onClick={() => navigate(`/company/job-detail/${job.id}`)}
                                            className="w-full md:w-auto px-10 py-3.5 bg-[#1e3a5a] text-white rounded-2xl font-bold text-sm hover:shadow-lg active:scale-95 transition-all uppercase tracking-widest"
                                        >
                                            Job Detail
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200 text-gray-400 font-bold uppercase italic">
                            No jobs found
                        </div>
                    )}
                </div>

                {/* Footer Tabs - ORIGINAL STYLE */}
                <div className="mt-auto pt-6 flex justify-center">
                    <div className="flex bg-[#E9E9E9] p-1.5 rounded-[1.8rem] w-full max-w-[1000px] border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('Applications')}
                            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all 
                            ${activeTab === 'Applications' ? 'bg-white text-[#343C44] shadow-sm' : 'text-[#8E8E8E]'}`}
                        >
                            Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('Matches')}
                            className={`flex-1 py-4 rounded-[1.5rem] font-bold text-sm transition-all 
                            ${activeTab === 'Matches' ? 'bg-white text-[#343C44] shadow-sm' : 'text-[#8E8E8E]'}`}
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