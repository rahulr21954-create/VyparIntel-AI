 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    CreditCard,
    IndianRupee,
    Receipt,
    Save,
    Wallet,
    Loader2,
    TrendingDown,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const AddExpense = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        description: "",
        paymentMethod: "cash",
        expenseDate:
            new Date().toISOString().split("T")[0],
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const amount = Number(formData.amount);

        if (!formData.category.trim()) {
            setError(
                "Please enter an expense category."
            );
            return;
        }

        if (!amount || amount <= 0) {
            setError(
                "Expense amount must be greater than 0."
            );
            return;
        }

        try {
            setSaving(true);

            const token =
                localStorage.getItem("token");

            const payload = {
                category:
                    formData.category.trim(),

                amount,

                description:
                    formData.description.trim(),

                paymentMethod:
                    formData.paymentMethod,

                expenseDate:
                    formData.expenseDate,
            };

            const response = await api.post(
                "/api/expenses",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSuccess(
                    "Expense added successfully."
                );

                setTimeout(() => {
                    navigate("/expenses");
                }, 800);
            }
        } catch (err) {
            console.error(
                "Create Expense Error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to create expense."
            );
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;
    };

    return (
        <div className="min-h-screen bg-[#07100D] text-white">

            {/* Background */}

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-400/5 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

                {/* HEADER */}

                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/expenses")
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-900/50 bg-[#0B1712] text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Cost Management
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Add Expense
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Record a new business expense.
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-3 rounded-2xl border border-emerald-900/40 bg-[#0B1712] px-4 py-3 md:flex">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
                            <TrendingDown
                                size={18}
                                className="text-red-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-600">
                                Expense Tracking
                            </p>

                            <p className="text-sm font-semibold text-slate-200">
                                VyparMind AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* ALERTS */}

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

                <form onSubmit={handleSubmit}>

                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* FORM */}

                        <section className="rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:col-span-2">

                            <div className="mb-8 flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                                    <Receipt
                                        size={22}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Expense Information
                                    </h2>

                                    <p className="text-sm text-slate-600">
                                        Enter the details of your expense.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">

                                {/* Category */}

                                <InputField
                                    label="Category"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Rent, Salary, Marketing"
                                    icon={Receipt}
                                    required
                                />

                                {/* Amount */}

                                <InputField
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        formData.amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="0.00"
                                    icon={IndianRupee}
                                    required
                                />

                                {/* Payment */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Payment Method
                                    </label>

                                    <div className="relative">
                                        <CreditCard
                                            size={17}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <select
                                            name="paymentMethod"
                                            value={
                                                formData.paymentMethod
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="w-full appearance-none rounded-2xl border border-slate-800 bg-[#07100D] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                                        >
                                            <option value="cash">
                                                Cash
                                            </option>

                                            <option value="upi">
                                                UPI
                                            </option>

                                            <option value="card">
                                                Card
                                            </option>

                                            <option value="bank">
                                                Bank Transfer
                                            </option>

                                            <option value="other">
                                                Other
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Date */}

                                <InputField
                                    label="Expense Date"
                                    name="expenseDate"
                                    type="date"
                                    value={
                                        formData.expenseDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    icon={CalendarDays}
                                    required
                                />

                                {/* Description */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="5"
                                        placeholder="Add notes about this expense..."
                                        className="w-full resize-none rounded-2xl border border-slate-800 bg-[#07100D] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* PREVIEW */}

                        <section className="h-fit rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20">

                            <div className="mb-7 flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                                    <Wallet
                                        size={22}
                                        className="text-red-400"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Expense Preview
                                    </h2>

                                    <p className="text-sm text-slate-600">
                                        Review before saving
                                    </p>
                                </div>
                            </div>

                            {/* Amount */}

                            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5">

                                <p className="text-xs uppercase tracking-wider text-slate-600">
                                    Expense Amount
                                </p>

                                <p className="mt-2 text-3xl font-bold text-red-400">
                                    {formatCurrency(
                                        formData.amount
                                    )}
                                </p>
                            </div>

                            {/* Preview Details */}

                            <div className="mt-6 space-y-4">

                                <PreviewRow
                                    label="Category"
                                    value={
                                        formData.category ||
                                        "Not specified"
                                    }
                                />

                                <PreviewRow
                                    label="Payment"
                                    value={
                                        formData.paymentMethod ===
                                        "upi"
                                            ? "UPI"
                                            : formData.paymentMethod ===
                                              "card"
                                            ? "Card"
                                            : formData.paymentMethod ===
                                              "bank"
                                            ? "Bank Transfer"
                                            : formData.paymentMethod ===
                                              "other"
                                            ? "Other"
                                            : "Cash"
                                    }
                                />

                                <PreviewRow
                                    label="Date"
                                    value={
                                        formData.expenseDate
                                            ? new Date(
                                                  formData.expenseDate
                                              ).toLocaleDateString(
                                                  "en-IN",
                                                  {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                  }
                                              )
                                            : "Not specified"
                                    }
                                />
                            </div>

                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-[#06100B] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={17} />
                                        Save Expense
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/expenses"
                                    )
                                }
                                className="mt-3 w-full rounded-xl border border-slate-800 bg-[#07100D] px-5 py-3.5 text-sm font-medium text-slate-400 transition hover:text-white"
                            >
                                Cancel
                            </button>

                            <p className="mt-5 text-center text-xs leading-5 text-slate-700">
                                Expense data will be included in
                                your business profitability analysis.
                            </p>
                        </section>
                    </div>
                </form>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-700">
                    <TrendingDown size={13} />
                    Expense intelligence by VyparMind AI
                </div>
            </main>
        </div>
    );
};

/* =========================
   INPUT
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
    step,
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
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                )}

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    step={step}
                    className={`w-full rounded-2xl border border-slate-800 bg-[#07100D] py-3.5 ${
                        Icon
                            ? "pl-11"
                            : "pl-4"
                    } pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10`}
                />
            </div>
        </div>
    );
};

/* =========================
   PREVIEW ROW
========================= */

const PreviewRow = ({
    label,
    value,
}) => {
    return (
        <div className="flex items-center justify-between gap-4">

            <span className="text-sm text-slate-600">
                {label}
            </span>

            <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-300">
                {value}
            </span>
        </div>
    );
};

export default AddExpense;