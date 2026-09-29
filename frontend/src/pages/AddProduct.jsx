import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    PackagePlus,
    ArrowLeft,
    Save,
    X,
    Tag,
    IndianRupee,
    Boxes,
    Truck,
    FileText,
    Layers3,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const AddProduct = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
        stock: "",
        minimumStock: "5",
        unit: "piece",
        supplier: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.name ||
            !formData.sku ||
            !formData.category ||
            formData.costPrice === "" ||
            formData.sellingPrice === "" ||
            formData.stock === ""
        ) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.post(
                "/api/products",
                {
                    ...formData,
                    costPrice: Number(formData.costPrice),
                    sellingPrice: Number(formData.sellingPrice),
                    stock: Number(formData.stock),
                    minimumStock: Number(formData.minimumStock),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSuccess("Product added successfully.");

                setTimeout(() => {
                    navigate("/products");
                }, 700);
            }
        } catch (err) {
            console.error("Add Product Error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to add product."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07100D] text-white">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-400/5 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/products")}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-900/50 bg-[#0B1712] text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-white"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Inventory
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Add Product
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Add a new product to your business inventory.
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-3 rounded-2xl border border-emerald-900/40 bg-[#0B1712] px-4 py-3 md:flex">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                            <PackagePlus
                                size={18}
                                className="text-emerald-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Powered by
                            </p>
                            <p className="text-sm font-semibold text-slate-200">
                                VyparMind AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                        {success}
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 xl:grid-cols-12">

                        {/* Left */}
                        <div className="space-y-6 xl:col-span-8">

                            {/* Basic Information */}
                            <section className="rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20 sm:p-8">
                                <div className="mb-7 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                                        <PackagePlus
                                            size={22}
                                            className="text-emerald-400"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Product Information
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Basic details about your product
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">

                                    <InputField
                                        label="Product Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Wireless Mouse"
                                        icon={PackagePlus}
                                        required
                                    />

                                    <InputField
                                        label="SKU"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="e.g. WM-001"
                                        icon={Tag}
                                        required
                                    />

                                    <InputField
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="e.g. Electronics"
                                        icon={Layers3}
                                        required
                                    />

                                    <InputField
                                        label="Supplier"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleChange}
                                        placeholder="e.g. ABC Suppliers"
                                        icon={Truck}
                                    />

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Description
                                        </label>

                                        <div className="relative">
                                            <FileText
                                                size={18}
                                                className="absolute left-4 top-4 text-slate-500"
                                            />

                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                placeholder="Add a short description about this product..."
                                                className="w-full resize-none rounded-2xl border border-slate-800 bg-[#07100D] px-12 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Pricing */}
                            <section className="rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20 sm:p-8">
                                <div className="mb-7 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10">
                                        <IndianRupee
                                            size={22}
                                            className="text-teal-400"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Pricing
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Set your product pricing
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">

                                    <InputField
                                        label="Cost Price"
                                        name="costPrice"
                                        type="number"
                                        min="0"
                                        value={formData.costPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        icon={IndianRupee}
                                        required
                                    />

                                    <InputField
                                        label="Selling Price"
                                        name="sellingPrice"
                                        type="number"
                                        min="0"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        icon={IndianRupee}
                                        required
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Right */}
                        <div className="space-y-6 xl:col-span-4">

                            {/* Inventory */}
                            <section className="rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20">
                                <div className="mb-7 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10">
                                        <Boxes
                                            size={22}
                                            className="text-lime-400"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Inventory
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Manage stock levels
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">

                                    <InputField
                                        label="Current Stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="0"
                                        icon={Boxes}
                                        required
                                    />

                                    <InputField
                                        label="Minimum Stock"
                                        name="minimumStock"
                                        type="number"
                                        min="0"
                                        value={formData.minimumStock}
                                        onChange={handleChange}
                                        placeholder="5"
                                        icon={Tag}
                                    />

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Unit
                                        </label>

                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-800 bg-[#07100D] px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                                        >
                                            <option value="piece">
                                                Piece
                                            </option>
                                            <option value="kg">
                                                Kilogram
                                            </option>
                                            <option value="gram">
                                                Gram
                                            </option>
                                            <option value="liter">
                                                Liter
                                            </option>
                                            <option value="meter">
                                                Meter
                                            </option>
                                            <option value="box">
                                                Box
                                            </option>
                                            <option value="pack">
                                                Pack
                                            </option>
                                            <option value="dozen">
                                                Dozen
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Product Preview */}
                            <section className="overflow-hidden rounded-[28px] border border-emerald-900/40 bg-gradient-to-br from-emerald-950/50 via-[#0B1712] to-[#07100D] p-6 shadow-2xl shadow-black/20">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                    Product Preview
                                </p>

                                <div className="rounded-2xl border border-emerald-900/30 bg-black/10 p-5">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                                        <PackagePlus
                                            size={25}
                                            className="text-emerald-400"
                                        />
                                    </div>

                                    <h3 className="truncate text-lg font-semibold">
                                        {formData.name || "Product Name"}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {formData.category ||
                                            "Product category"}
                                    </p>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-[#07100D] p-3">
                                            <p className="text-xs text-slate-500">
                                                Selling Price
                                            </p>
                                            <p className="mt-1 font-semibold text-emerald-400">
                                                ₹
                                                {formData.sellingPrice ||
                                                    "0"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-[#07100D] p-3">
                                            <p className="text-xs text-slate-500">
                                                Stock
                                            </p>
                                            <p className="mt-1 font-semibold text-teal-400">
                                                {formData.stock || "0"}{" "}
                                                {formData.unit}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-6 flex flex-col-reverse gap-3 rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/products")}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-6 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
                        >
                            <X size={17} />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 text-sm font-semibold text-[#06100B] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={17} />

                            {loading
                                ? "Adding Product..."
                                : "Add Product"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

/* =========================
   Reusable Input
========================= */

const InputField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    icon: Icon,
    required = false,
    min,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
                {label}

                {required && (
                    <span className="ml-1 text-emerald-400">
                        *
                    </span>
                )}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                )}

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    min={min}
                    required={required}
                    className={`w-full rounded-2xl border border-slate-800 bg-[#07100D] py-3.5 ${
                        Icon ? "pl-12" : "pl-4"
                    } pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10`}
                />
            </div>
        </div>
    );
};

export default AddProduct;