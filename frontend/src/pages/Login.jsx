import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { BrainCircuit } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            // ==========================================
            // 1. LOGIN
            // ==========================================

            const response = await api.post(
                "/api/auth/login",
                formData
            );

            const token = response.data.token;

            if (!token) {
                throw new Error(
                    "Login successful but token was not received."
                );
            }

            // ==========================================
            // 2. SAVE TOKEN + USER
            // ==========================================

            localStorage.setItem("token", token);

            if (response.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
            }

            // ==========================================
            // 3. CHECK BUSINESS
            // ==========================================

            try {
                const businessResponse = await api.get(
                    "/api/business/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Business already exists
                if (businessResponse.status === 200) {
                    navigate("/business-setup", {
                        replace: true,
                    });

                    return;
                }

            } catch (businessError) {

                // User has no business yet
                if (
                    businessError.response?.status === 404
                ) {
                    navigate("/business-setup", {
                        replace: true,
                    });

                    return;
                }

                // Invalid / expired token
                if (
                    businessError.response?.status === 401
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    setError(
                        "Authentication failed. Please login again."
                    );

                    return;
                }

                throw businessError;
            }

        } catch (error) {
            console.error("Login Error:", error);

            if (!error.response) {
                setError(
                    "Unable to connect to the backend server."
                );

                return;
            }

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl" />

                <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">

                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">

                    {/* Brand */}
                    <div className="text-center mb-8">

                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
                        
                                <BrainCircuit
                                        size={30}
                                        className="text-white"
                                />
                        
                        </div>

                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Vypar<span className="text-blue-500">Intel</span>
                        </h1>

                        <p className="text-slate-400 text-sm mt-2">
                            Intelligent insights for your business
                        </p>

                    </div>

                    {/* Heading */}
                    <div className="mb-6">

                        <h2 className="text-xl font-semibold text-white">
                            Welcome back
                        </h2>

                        <p className="text-slate-400 text-sm mt-1">
                            Login to continue to your dashboard
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Email */}
                        <div>

                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                            />

                        </div>

                        {/* Password */}
                        <div>

                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-3 pr-16 text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (prev) => !prev
                                        )
                                    }
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    {/* Signup */}
                    <div className="mt-7 text-center">

                        <p className="text-sm text-slate-400">

                            Don't have an account?{" "}

                            <Link
                                to="/signup"
                                className="font-semibold text-blue-400 hover:text-blue-300 transition"
                            >
                                Create Account
                            </Link>

                        </p>

                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-5 border-t border-slate-800 text-center">

                        <p className="text-xs text-slate-500">
                            Powered by{" "}
                            <span className="text-slate-400 font-medium">
                                VyparMind AI
                            </span>
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;
