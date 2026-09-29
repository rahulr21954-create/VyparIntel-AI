import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    BrainCircuit,
} from "lucide-react";

import api from "../api/axios";

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const {
            fullName,
            email,
            phone,
            password,
            confirmPassword,
        } = formData;

        // Validation
        if (
            !fullName ||
            !email ||
            !phone ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // Signup API
            const response = await api.post(
                "/api/auth/signup",
                {
                    fullName,
                    email,
                    phone,
                    password,
                }
            );

            const token = response.data.token;

            if (!token) {
                throw new Error(
                    "Signup successful but token was not received."
                );
            }

            // Save authentication
            localStorage.setItem("token", token);

            if (response.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
            }

            // New account → Create Business
            navigate("/business-setup", {
                replace: true,
            });

        } catch (error) {
            console.error("Signup Error:", error);

            if (!error.response) {
                setError(
                    "Unable to connect to the backend server."
                );
                return;
            }

            setError(
                error.response?.data?.message ||
                "Signup failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">

            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />

                <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">

                {/* Brand */}
                <div className="mb-8 text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">

                        <BrainCircuit
                            size={30}
                            className="text-white"
                        />

                    </div>

                    <h1 className="text-3xl font-bold text-white">
                        Vypar<span className="text-blue-500">Intel</span>
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Start making smarter business decisions
                    </p>

                </div>

                {/* Signup Card */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-white">
                            Create your account
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Start using VyparMind to understand your business.
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >

                        {/* Full Name */}
                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Full Name
                            </label>

                            <div className="relative">

                                <User
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Rahul Sharma"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Email
                            </label>

                            <div className="relative">

                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />

                            </div>

                        </div>

                        {/* Phone */}
                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Phone
                            </label>

                            <div className="relative">

                                <Phone
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />

                            </div>

                        </div>

                        {/* Password */}
                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 6 characters"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Confirm Password */}
                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Confirm Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="confirmPassword"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    disabled={loading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* Login */}
                    <div className="mt-6 text-center text-sm text-slate-400">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-blue-400 hover:text-blue-300"
                        >
                            Sign in
                        </Link>

                    </div>

                </div>

                <p className="mt-6 text-center text-xs text-slate-600">
                    VyparIntel • Powered by VyparMind
                </p>

            </div>

        </div>
    );
};

export default Signup;
