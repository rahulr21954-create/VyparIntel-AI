import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Plus,
    Search,
    RefreshCw,
    Eye,
    IndianRupee,
    TrendingUp,
    Receipt,
    CreditCard,
    X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const Sales = () => {
    const navigate = useNavigate();

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    // =========================
    // FETCH SALES
    // =========================

    const fetchSales = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get("/api/sales", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setSales(response.data.sales || []);
            }
        } catch (err) {
            console.error("Fetch Sales Error:", err);

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to load sales."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    // =========================
    // FILTER SALES
    // =========================

    const filteredSales = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return sales;
        }

        return sales.filter((sale) => {
            const invoice =
                sale.invoiceNumber?.toLowerCase() || "";

            const customer =
                sale.customerName?.toLowerCase() || "";

            const payment =
                sale.paymentMethod?.toLowerCase() || "";

            return (
                invoice.includes(query) ||
                customer.includes(query) ||
                payment.includes(query)
            );
        });
    }, [sales, search]);

    // =========================
    // SALES STATS
    // =========================

    const stats = useMemo(() => {
        const revenue = sales.reduce(
            (sum, sale) =>
                sum + Number(sale.totalAmount || 0),
            0
        );

        const profit = sales.reduce(
            (sum, sale) =>
                sum + Number(sale.profit || 0),
            0
        );

        const totalItems = sales.reduce(
            (sum, sale) =>
                sum +
                (sale.items || []).reduce(
                    (itemSum, item) =>
                        itemSum + Number(item.quantity || 0),
                    0
                ),
            0
        );

        return {
            transactions: sales.length,
            revenue,
            profit,
            totalItems,
        };
    }, [sales]);

    // =========================
    // FORMAT
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

    const getPaymentStyle = (method) => {
        const value = method?.toLowerCase();

        if (value === "cash") {
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        }

        if (value === "upi") {
            return "bg-teal-500/10 text-teal-400 border-teal-500/20";
        }

        if (value === "card") {
            return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }

        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    };

    return (
        <div className="min-h-screen bg-[#07100D] text-white">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-400/5 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                            Revenue Management
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Sales Intelligence
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Track transactions, revenue and profit
                            from one intelligent workspace.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/sales/create")
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100B] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                    >
                        <Plus size={18} />
                        Create Sale
                    </button>
                </div>

                {/* =========================
                    ERROR
                ========================= */}

                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        <span>{error}</span>

                        <button
                            onClick={() => setError("")}
                            className="text-red-300 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* =========================
                    STATS
                ========================= */}

                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                        title="Total Transactions"
                        value={stats.transactions.toLocaleString(
                            "en-IN"
                        )}
                        subtitle="All recorded sales"
                        icon={Receipt}
                        iconClass="text-emerald-400"
                        iconBg="bg-emerald-500/10"
                    />

                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.revenue)}
                        subtitle="Gross sales generated"
                        icon={IndianRupee}
                        iconClass="text-teal-400"
                        iconBg="bg-teal-500/10"
                    />

                    <StatCard
                        title="Total Profit"
                        value={formatCurrency(stats.profit)}
                        subtitle="Profit from sales"
                        icon={TrendingUp}
                        iconClass="text-lime-400"
                        iconBg="bg-lime-400/10"
                    />

                    <StatCard
                        title="Items Sold"
                        value={stats.totalItems.toLocaleString(
                            "en-IN"
                        )}
                        subtitle="Total units sold"
                        icon={ShoppingCart}
                        iconClass="text-sky-400"
                        iconBg="bg-sky-500/10"
                    />
                </div>

                {/* =========================
                    SALES PANEL
                ========================= */}

                <section className="overflow-hidden rounded-[28px] border border-emerald-900/40 bg-[#0B1712] shadow-2xl shadow-black/20">

                    {/* Toolbar */}

                    <div className="border-b border-emerald-900/30 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div>
                                <h2 className="text-lg font-semibold">
                                    Sales Transactions
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {filteredSales.length}{" "}
                                    transaction
                                    {filteredSales.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    shown
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">

                                {/* Search */}

                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                    />

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search invoice, customer..."
                                        className="w-full rounded-xl border border-slate-800 bg-[#07100D] py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50 sm:w-[280px]"
                                    />

                                    {search && (
                                        <button
                                            onClick={() =>
                                                setSearch("")
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Refresh */}

                                <button
                                    onClick={() =>
                                        fetchSales(true)
                                    }
                                    disabled={refreshing}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#07100D] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-800 hover:text-white disabled:opacity-50"
                                >
                                    <RefreshCw
                                        size={17}
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
                    </div>

                    {/* =========================
                        LOADING
                    ========================= */}

                    {loading ? (
                        <LoadingState />
                    ) : filteredSales.length === 0 ? (
                        <EmptyState
                            search={search}
                            onCreate={() =>
                                navigate("/sales/create")
                            }
                            onClear={() => setSearch("")}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px]">
                                <thead>
                                    <tr className="border-b border-emerald-900/30 bg-[#08130F] text-left">
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Invoice
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Items
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Payment
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Amount
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Profit
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSales.map(
                                        (sale) => {
                                            const itemCount =
                                                (
                                                    sale.items ||
                                                    []
                                                ).reduce(
                                                    (
                                                        total,
                                                        item
                                                    ) =>
                                                        total +
                                                        Number(
                                                            item.quantity ||
                                                                0
                                                        ),
                                                    0
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        sale._id
                                                    }
                                                    className="group border-b border-slate-800/70 transition hover:bg-emerald-950/20"
                                                >
                                                    {/* Invoice */}

                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                                                <Receipt
                                                                    size={
                                                                        17
                                                                    }
                                                                    className="text-emerald-400"
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-slate-200">
                                                                    {sale.invoiceNumber ||
                                                                        "No Invoice"}
                                                                </p>

                                                                <p className="text-xs text-slate-600">
                                                                    #
                                                                    {sale._id?.slice(
                                                                        -6
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Customer */}

                                                    <td className="px-6 py-5">
                                                        <p className="font-medium text-slate-300">
                                                            {sale.customerName ||
                                                                "Walk-in Customer"}
                                                        </p>
                                                    </td>

                                                    {/* Date */}

                                                    <td className="px-6 py-5">
                                                        <span className="text-sm text-slate-400">
                                                            {formatDate(
                                                                sale.saleDate ||
                                                                    sale.createdAt
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Items */}

                                                    <td className="px-6 py-5">
                                                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#07100D] px-3 py-1.5">
                                                            <ShoppingCart
                                                                size={
                                                                    14
                                                                }
                                                                className="text-slate-500"
                                                            />

                                                            <span className="text-sm font-medium text-slate-300">
                                                                {
                                                                    itemCount
                                                                }{" "}
                                                                units
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Payment */}

                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${getPaymentStyle(
                                                                sale.paymentMethod
                                                            )}`}
                                                        >
                                                            <CreditCard
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            {sale.paymentMethod ||
                                                                "Unknown"}
                                                        </span>
                                                    </td>

                                                    {/* Amount */}

                                                    <td className="px-6 py-5 text-right">
                                                        <p className="font-semibold text-slate-200">
                                                            {formatCurrency(
                                                                sale.totalAmount
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* Profit */}

                                                    <td className="px-6 py-5 text-right">
                                                        <p className="font-semibold text-emerald-400">
                                                            {formatCurrency(
                                                                sale.profit
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* Action */}

                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/sales/${sale._id}`
                                                                )
                                                            }
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#07100D] text-slate-400 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
                                                            title="View sale"
                                                        >
                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer */}

                    {!loading &&
                        filteredSales.length > 0 && (
                            <div className="border-t border-emerald-900/30 px-6 py-4">
                                <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                    <span>
                                        Showing{" "}
                                        <span className="text-slate-400">
                                            {
                                                filteredSales.length
                                            }
                                        </span>{" "}
                                        of{" "}
                                        <span className="text-slate-400">
                                            {sales.length}
                                        </span>{" "}
                                        sales
                                    </span>

                                    <span>
                                        Sales intelligence by{" "}
                                        <span className="text-emerald-500">
                                            VyparMind AI
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )}
                </section>
            </main>
        </div>
    );
};

/* =========================
   STAT CARD
========================= */

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass,
    iconBg,
}) => {
    return (
        <div className="group relative overflow-hidden rounded-[24px] border border-emerald-900/40 bg-[#0B1712] p-5 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-emerald-700/50">

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-slate-100">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}
                >
                    <Icon
                        size={20}
                        className={iconClass}
                    />
                </div>
            </div>

            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition group-hover:bg-emerald-500/10" />
        </div>
    );
};

/* =========================
   LOADING
========================= */

const LoadingState = () => {
    return (
        <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-900/40 bg-[#07100D]">
                    <RefreshCw
                        size={23}
                        className="animate-spin text-emerald-400"
                    />
                </div>

                <p className="text-sm text-slate-500">
                    Loading sales...
                </p>
            </div>
        </div>
    );
};

/* =========================
   EMPTY STATE
========================= */

const EmptyState = ({
    search,
    onCreate,
    onClear,
}) => {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] border border-emerald-900/40 bg-emerald-500/5">
                <ShoppingCart
                    size={32}
                    className="text-emerald-400"
                />
            </div>

            <h3 className="text-xl font-semibold text-slate-200">
                {search
                    ? "No matching sales"
                    : "No sales recorded yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                    ? "Try another invoice number, customer name or payment method."
                    : "Create your first sale to start tracking revenue and business performance."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {search ? (
                    <button
                        onClick={onClear}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
                    >
                        <X size={17} />
                        Clear Search
                    </button>
                ) : null}

                <button
                    onClick={onCreate}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100B] transition hover:bg-emerald-400"
                >
                    <Plus size={17} />
                    Create Sale
                </button>
            </div>
        </div>
    );
};

export default Sales;