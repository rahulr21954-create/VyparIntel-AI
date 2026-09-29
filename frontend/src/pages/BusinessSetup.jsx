import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    BriefcaseBusiness,
    Phone,
    Mail,
    MapPin,
    Map,
    Landmark,
    Hash,
    IndianRupee,
    ArrowRight,
    Loader2,
} from "lucide-react";

import api from "../api/axios";

const BusinessSetup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstin: "",
        currency: "INR",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Business name is required.");
            return;
        }

        if (!formData.category.trim()) {
            setError("Business category is required.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/api/business",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const user = JSON.parse(
                    localStorage.getItem("user") || "{}"
                );

                user.business = response.data.business?._id;

                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );

                navigate("/dashboard", {
                    replace: true,
                });
            }
        } catch (err) {
            console.error(
                "Business Setup Error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to create business. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">

            <div className="w-full max-w-4xl">

                {/* Header */}
                <div className="text-center mb-8">

                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Building2 size={28} />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold">
                        Set Up Your Business
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Tell VyparIntel about your business
                    </p>

                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                    >

                        {/* Business Information */}
                        <section>

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                                    <BriefcaseBusiness size={18} />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Business Information
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Basic details about your business
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Business Name */}
                                <InputField
                                    label="Business Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Rahul General Store"
                                    icon={<Building2 size={18} />}
                                    required
                                />

                                {/* Category */}
                                <InputField
                                    label="Business Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="e.g. Retail, Restaurant"
                                    icon={<BriefcaseBusiness size={18} />}
                                    required
                                />

                                {/* Phone */}
                                <InputField
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Business phone number"
                                    icon={<Phone size={18} />}
                                />

                                {/* Email */}
                                <InputField
                                    label="Business Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="business@example.com"
                                    icon={<Mail size={18} />}
                                    type="email"
                                />

                            </div>

                        </section>

                        {/* Address */}
                        <section>

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                                    <MapPin size={18} />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Business Address
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Where your business operates
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-5">

                                {/* Address */}
                                <InputField
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Shop / Office address"
                                    icon={<MapPin size={18} />}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                                    {/* City */}
                                    <InputField
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        icon={<Map size={18} />}
                                    />

                                    {/* State */}
                                    <InputField
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        icon={<Landmark size={18} />}
                                    />

                                    {/* Pincode */}
                                    <InputField
                                        label="Pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="201301"
                                        icon={<Hash size={18} />}
                                    />

                                </div>

                            </div>

                        </section>

                        {/* Business Registration */}
                        <section>

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center">
                                    <Landmark size={18} />
                                </div>

                                <div>
                                    <h2 className="font-semibold">
                                        Business Registration
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Optional business details
                                    </p>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* GSTIN */}
                                <InputField
                                    label="GSTIN"
                                    name="gstin"
                                    value={formData.gstin}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                    icon={<Hash size={18} />}
                                />

                                {/* Currency */}
                                <InputField
                                    label="Currency"
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    placeholder="INR"
                                    icon={<IndianRupee size={18} />}
                                />

                            </div>

                        </section>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 transition rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />
                                    Creating Business...
                                </>
                            ) : (
                                <>
                                    Create Business
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                    </form>

                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    VyparIntel • Powered by VyparMind
                </p>

            </div>

        </div>
    );
};


/* Reusable Input Component */

const InputField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    icon,
    type = "text",
    required = false,
}) => {
    return (
        <div>

            <label className="block text-sm font-medium text-slate-300 mb-2">
                {label}
                {required && (
                    <span className="text-blue-400 ml-1">
                        *
                    </span>
                )}
            </label>

            <div className="relative">

                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {icon}
                </div>

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

            </div>

        </div>
    );
};

export default BusinessSetup;