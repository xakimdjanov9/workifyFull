import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmResetPassword } from "../../services/api"; // API funksiyangiz
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ForgotPasswordCombined = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [loading, setLoading] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [isError, setIsError] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    // Timer sozlamalari
    useEffect(() => {
        if (!email) {
            toast.warn("Email topilmadi, boshidan boshlang.");
            navigate('/company/forgot-password-1');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    // CTRL + V (Paste) funksiyasi
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text/plain').trim();
        if (pastedText.length === 6 && /^\d+$/.test(pastedText)) {
            const newCode = pastedText.split('');
            setCode(newCode);
            setIsError(false);
            inputRefs.current[5].focus();
        }
    };

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);
        setIsError(false);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');

        // Validatsiya
        if (fullCode.length < 6) {
            toast.error("Tasdiqlash kodini to'liq kiriting!");
            setIsError(true);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Parollar mos kelmadi!");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Parol kamida 6 ta belgi bo'lsin!");
            return;
        }

        setLoading(true);
        try {
            // SERVERGA YUBORILADIGAN OBYEKT:
            // { email: "...", code: "...", newPassword: "..." }
            await confirmResetPassword(email, fullCode, newPassword);

            toast.success("Parol muvaffaqiyatli yangilandi!");

            // Tozalash
            localStorage.removeItem(`resetTimer_${email}`);
            localStorage.removeItem(`resetStartTime_${email}`);

            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setIsError(true);
            toast.error(err.response?.data?.message || "Kod yoki ma'lumotlar noto'g'ri!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white p-4">
            <div className="w-full max-w-[500px] px-6 py-8 shadow-2xl rounded-3xl border border-gray-100 text-center">
                <h1 className="text-[28px] font-bold text-[#1e3a5a] mb-2">Reset Password</h1>
                <p className="text-gray-500 mb-8 text-sm">{email}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP INPUTS */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 text-left">Verification Code</label>
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {code.map((num, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (inputRefs.current[idx] = el)}
                                    type="text"
                                    className={`w-full h-[55px] border-2 rounded-xl text-center text-xl font-bold transition-all focus:outline-none ${isError ? 'border-red-500' : 'border-gray-200 focus:border-[#1e3a5a]'
                                        }`}
                                    value={num}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    disabled={isExpired}
                                />
                            ))}
                        </div>
                        <div className="mt-2 text-right text-xs font-mono">
                            Time left: <span className={isExpired ? "text-red-500" : "text-blue-600"}>
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="New Password"
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5a] outline-none transition-all"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPass ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5a] outline-none transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || isExpired}
                            className="w-full bg-[#1e3a5a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#152c45] active:scale-95 transition-all disabled:bg-gray-300"
                        >
                            {loading ? "Processing..." : "Update Password"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full py-3 text-gray-500 font-semibold hover:text-[#1e3a5a] transition-all"
                        >
                            Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordCombined;