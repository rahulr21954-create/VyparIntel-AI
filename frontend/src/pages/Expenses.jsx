import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowDownRight,
    CalendarDays,
    IndianRupee,
    Plus,
    Receipt,
    RefreshCw,
    Search,
    Trash2,
    Wallet,
    TrendingDown,
    X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const Expenses = () => {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // =========================
    // FETCH EXPENSES
    // =========================

    const fetchExpenses = async () => {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/api/expenses",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setExpenses(
                    response.data.expenses || []
                );
            }
        } catch (err) {
            console.error(
                "Fetch Expenses Error:",
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
                    "Failed to load expenses."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // =========================
    // DELETE EXPENSE
    // =========================

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);

            const token = localStorage.getItem("token");

            await api.delete(
                `/api/expenses/${deleteId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setExpenses((prev) =>
                prev.filter(
                    (expense) =>
                        expense._id !== deleteId
                )
            );

            setDeleteId(null);
        } catch (err) {
            console.error(
                "Delete Expense Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to delete expense."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =========================
    // FILTER
    // =========================

    const filteredExpenses = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return expenses;
        }

        return expenses.filter((expense) => {
            return (
                expense.category
                    ?.toLowerCase()
                    .includes(query) ||
                expense.description
                    ?.toLowerCase()
                    .includes(query) ||
                expense.paymentMethod
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [expenses, search]);

    // =========================
    // STATS
    // =========================

    const stats = useMemo(() => {
        const total = expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );

        const average =
            expenses.length > 0
                ? total / expenses.length
                : 0;

        const categories = new Set(
            expenses.map(
                (expense) => expense.category
            )
        ).size;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const thisMonth = expenses.reduce(
            (sum, expense) => {
                const date = new Date(
                    expense.expenseDate
                );

                if (
                    date.getMonth() ===
                        currentMonth &&
                    date.getFullYear() ===
                        currentYear
                ) {
                    return (
                        sum +
                        Number(
                            expense.amount || 0
                        )
                    );
                }

                return sum;
            },
            0
        );

        return {
            total,
            average,
            categories,
            thisMonth,
        };
    }, [expenses]);

    // =========================
    // FORMATTERS
    // =========================

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatPayment = (method) => {
        if (!method) return "—";

        const labels = {
            cash: "Cash",
            upi: "UPI",
            card: "Card",
            bank: "Bank Transfer",
            other: "Other",
        };

        return (
            labels[method] ||
            method
                .charAt(0)
                .toUpperCase() +
                method.slice(1)
        );
    };

    const getCategoryStyle = (category) => {
        const value =
            category?.toLowerCase();

        if (
            value?.includes("rent") ||
            value?.includes("salary")
        ) {
            return "bg-purple-500/10 text-purple-400 border-purple-500/10";
        }

        if (
            value?.includes("transport") ||
            value?.includes("fuel")
        ) {
            return "bg-blue-500/10 text-blue-400 border-blue-500/10";
        }

        if (
            value?.includes("marketing") ||
            value?.includes("advert")
        ) {
            return "bg-pink-500/10 text-pink-400 border-pink-500/10";
        }

        if (
            value?.includes("utility") ||
            value?.includes("electric")
        ) {
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/10";
        }

        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/10";
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

            <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

                {/* HEADER */}

                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                            Cost Management
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Expense Intelligence
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Track where your business money is going.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/expenses/create"
                            )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100B] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">

                        <span>{error}</span>

                        <button
                            onClick={() =>
                                setError("")
                            }
                            className="text-red-400 hover:text-red-300"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {/* STATS */}

                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        icon={Wallet}
                        label="Total Expenses"
                        value={formatCurrency(
                            stats.total
                        )}
                        accent="emerald"
                    />

                    <StatCard
                        icon={CalendarDays}
                        label="This Month"
                        value={formatCurrency(
                            stats.thisMonth
                        )}
                        accent="teal"
                    />

                    <StatCard
                        icon={TrendingDown}
                        label="Average Expense"
                        value={formatCurrency(
                            stats.average
                        )}
                        accent="lime"
                    />

                    <StatCard
                        icon={Receipt}
                        label="Categories"
                        value={stats.categories}
                        accent="purple"
                    />
                </div>

                {/* MAIN CARD */}

                <section className="overflow-hidden rounded-[28px] border border-emerald-900/40 bg-[#0B1712] shadow-2xl shadow-black/20">

                    {/* TOOLBAR */}

                    <div className="flex flex-col gap-4 border-b border-slate-800 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">

                        <div>
                            <h2 className="font-semibold text-slate-200">
                                Expense Records
                            </h2>

                            <p className="mt-1 text-xs text-slate-600">
                                {filteredExpenses.length} of{" "}
                                {expenses.length} records
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">

                            <div className="relative">

                                <Search
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search expenses..."
                                    className="w-full rounded-xl border border-slate-800 bg-[#07100D] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50 sm:w-72"
                                />
                            </div>

                            <button
                                onClick={() => {
                                    setRefreshing(
                                        true
                                    );
                                    fetchExpenses();
                                }}
                                disabled={
                                    refreshing
                                }
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#07100D] px-4 py-3 text-sm text-slate-400 transition hover:border-emerald-900/50 hover:text-white disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* TABLE */}

                    {loading ? (
                        <LoadingState />
                    ) : filteredExpenses.length ===
                      0 ? (
                        <EmptyState
                            hasSearch={
                                Boolean(
                                    search.trim()
                                )
                            }
                            onAdd={() =>
                                navigate(
                                    "/expenses/create"
                                )
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[850px]">

                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-600">

                                        <th className="px-6 py-4 font-medium">
                                            Category
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Description
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Date
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Payment
                                        </th>

                                        <th className="px-4 py-4 text-right font-medium">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4 text-right font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredExpenses.map(
                                        (expense) => (
                                            <tr
                                                key={
                                                    expense._id
                                                }
                                                className="border-b border-slate-800/70 transition hover:bg-emerald-500/[0.02] last:border-0"
                                            >
                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-medium ${getCategoryStyle(
                                                            expense.category
                                                        )}`}
                                                    >
                                                        {
                                                            expense.category
                                                        }
                                                    </span>
                                                </td>

                                                <td className="max-w-[280px] px-4 py-5">

                                                    <p className="truncate text-sm text-slate-300">
                                                        {expense.description ||
                                                            "No description"}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-5">

                                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                                        <CalendarDays
                                                            size={
                                                                14
                                                            }
                                                            className="text-slate-600"
                                                        />

                                                        {formatDate(
                                                            expense.expenseDate
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-5">

                                                    <span className="text-sm text-slate-400">
                                                        {formatPayment(
                                                            expense.paymentMethod
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-5 text-right">

                                                    <div className="flex items-center justify-end gap-1 text-sm font-semibold text-red-400">
                                                        <ArrowDownRight
                                                            size={
                                                                15
                                                            }
                                                        />

                                                        {formatCurrency(
                                                            expense.amount
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    <button
                                                        onClick={() =>
                                                            setDeleteId(
                                                                expense._id
                                                            )
                                                        }
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 transition hover:bg-red-500/10"
                                                        title="Delete expense"
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* FOOTER */}

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-700">
                    <TrendingDown size={13} />
                    Expense intelligence by VyparMind AI
                </div>
            </main>

            {/* DELETE MODAL */}

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-[28px] border border-red-500/20 bg-[#0B1712] p-7 shadow-2xl">

                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                            <Trash2
                                size={24}
                                className="text-red-400"
                            />
                        </div>

                        <h3 className="text-center text-xl font-semibold">
                            Delete Expense?
                        </h3>

                        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                            This expense record will be permanently
                            removed. This action cannot be undone.
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-3">

                            <button
                                onClick={() =>
                                    setDeleteId(null)
                                }
                                disabled={deleting}
                                className="rounded-xl border border-slate-800 bg-[#07100D] px-4 py-3 text-sm font-medium text-slate-400 transition hover:text-white"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={16}
                                        />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================
   STAT CARD
========================= */

const StatCard = ({
    icon: Icon,
    label,
    value,
    accent,
}) => {
    const styles = {
        emerald:
            "bg-emerald-500/10 text-emerald-400",
        teal: "bg-teal-500/10 text-teal-400",
        lime: "bg-lime-400/10 text-lime-400",
        purple:
            "bg-purple-500/10 text-purple-400",
    };

    return (
        <div className="rounded-2xl border border-emerald-900/40 bg-[#0B1712] p-5 transition hover:border-emerald-800/60">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
                        {value}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[accent]}`}
                >
                    <Icon size={19} />
                </div>
            </div>
        </div>
    );
};

/* =========================
   LOADING
========================= */

const LoadingState = () => {
    return (
        <div className="flex min-h-[350px] flex-col items-center justify-center">

            <RefreshCw
                size={28}
                className="animate-spin text-emerald-400"
            />

            <p className="mt-4 text-sm text-slate-600">
                Loading expenses...
            </p>
        </div>
    );
};

/* =========================
   EMPTY
========================= */

const EmptyState = ({
    hasSearch,
    onAdd,
}) => {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Wallet
                    size={27}
                    className="text-emerald-400"
                />
            </div>

            <h3 className="text-lg font-semibold text-slate-300">
                {hasSearch
                    ? "No matching expenses"
                    : "No expenses yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                {hasSearch
                    ? "Try a different category, description, or payment method."
                    : "Start recording your business expenses to understand your spending better."}
            </p>

            {!hasSearch && (
                <button
                    onClick={onAdd}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100B] transition hover:bg-emerald-400"
                >
                    <Plus size={17} />
                    Add First Expense
                </button>
            )}
        </div>
    );
};

export default Expenses;