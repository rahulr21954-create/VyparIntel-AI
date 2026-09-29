import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Boxes,
    CircleDollarSign,
    Loader2,
    Package,
    Percent,
    RefreshCw,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Wallet,
    AlertTriangle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";


// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
};

const formatNumber = (value = 0) => {
    return new Intl.NumberFormat("en-IN").format(
        Number(value) || 0
    );
};


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    danger = false,
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                danger
                    ? "border-red-500/20 bg-red-500/[0.05] hover:border-red-400/30"
                    : "border-emerald-500/10 bg-[#0b1712] hover:border-emerald-400/20"
            }`}
        >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/[0.04] blur-2xl" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {title}
                    </p>

                    <h3
                        className={`mt-2 text-2xl font-bold ${
                            danger
                                ? "text-red-300"
                                : "text-white"
                        }`}
                    >
                        {value}
                    </h3>

                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        danger
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                    }`}
                >
                    <Icon size={20} />
                </div>
            </div>

            {trend !== undefined && (
                <div
                    className={`mt-4 flex items-center gap-1 text-xs font-medium ${
                        trend >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                    }`}
                >
                    {trend >= 0 ? (
                        <ArrowUpRight size={14} />
                    ) : (
                        <ArrowDownRight size={14} />
                    )}

                    {Math.abs(trend).toFixed(1)}%
                    <span className="ml-1 text-slate-600">
                        margin indicator
                    </span>
                </div>
            )}
        </div>
    );
}


// ============================================================
// PERFORMANCE BAR
// ============================================================

function PerformanceBar({
    label,
    value,
    max,
    icon: Icon,
    description,
}) {
    const percentage =
        max > 0
            ? Math.min((Math.abs(value) / max) * 100, 100)
            : 0;

    return (
        <div className="rounded-2xl border border-emerald-500/10 bg-[#0b1712] p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Icon size={18} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-white">
                            {label}
                        </p>

                        <p className="text-xs text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                <span className="text-sm font-semibold text-slate-200">
                    {formatCurrency(value)}
                </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}


// ============================================================
// LOADING
// ============================================================

function LoadingState() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2
                    size={32}
                    className="animate-spin text-emerald-400"
                />

                <p className="text-sm text-slate-500">
                    Loading business intelligence...
                </p>
            </div>
        </div>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchAnalytics = async (isRefresh = false) => {
        try {
            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/api/analytics/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            /*
             * Backend response can be:
             *
             * {
             *   data: {...}
             * }
             *
             * or
             *
             * {
             *   analytics: {...}
             * }
             *
             * This keeps the UI resilient.
             */
            const result =
                response.data?.analytics ||
                response.data?.data ||
                response.data;

            setAnalytics(result);
        } catch (err) {
            console.error(
                "Analytics Fetch Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load analytics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);


    // ========================================================
    // NORMALIZED DATA
    // ========================================================

    const data = useMemo(() => {
        return {
            revenue:
                Number(analytics?.revenue) || 0,

            totalCost:
                Number(analytics?.totalCost) || 0,

            grossProfit:
                Number(analytics?.grossProfit) || 0,

            totalExpenses:
                Number(analytics?.totalExpenses) || 0,

            netProfit:
                Number(analytics?.netProfit) || 0,

            profitMargin:
                Number(analytics?.profitMargin) || 0,

            totalSales:
                Number(analytics?.totalSales) || 0,

            totalExpensesCount:
                Number(
                    analytics?.totalExpensesCount
                ) || 0,

            totalProducts:
                Number(analytics?.totalProducts) || 0,

            totalStockUnits:
                Number(analytics?.totalStockUnits) || 0,

            lowStockProducts:
                Number(
                    analytics?.lowStockProducts
                ) || 0,
        };
    }, [analytics]);


    const maxFinancialValue = Math.max(
        data.revenue,
        data.grossProfit,
        data.totalExpenses,
        data.netProfit,
        1
    );


    if (loading) {
        return (
            <div className="min-h-screen bg-[#07100d] text-white">
                <Navbar />
                <LoadingState />
            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#07100d] text-white">
                <Navbar />

                <main className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
                    <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0b1712] p-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                            <AlertTriangle size={26} />
                        </div>

                        <h2 className="mt-5 text-xl font-bold">
                            Analytics unavailable
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                fetchAnalytics()
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div className="min-h-screen overflow-x-hidden bg-[#07100d] text-white">
            <Navbar />

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute left-[15%] top-[10%] h-72 w-72 rounded-full bg-emerald-500/[0.04] blur-[120px]" />

                <div className="absolute right-[10%] top-[45%] h-80 w-80 rounded-full bg-teal-500/[0.03] blur-[130px]" />
            </div>


            <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <BarChart3
                                size={15}
                                className="text-emerald-400"
                            />

                            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                                Business Intelligence
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Analytics
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-500">
                            Understand your business performance
                            through revenue, profit, expenses and
                            inventory signals.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            fetchAnalytics(true)
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-[#0b1712] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-emerald-400/30 hover:text-white disabled:opacity-50"
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


                {/* ==================================================
                    KPI GRID
                ================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(
                            data.revenue
                        )}
                        subtitle="All recorded sales"
                        icon={CircleDollarSign}
                    />

                    <StatCard
                        title="Gross Profit"
                        value={formatCurrency(
                            data.grossProfit
                        )}
                        subtitle="Revenue minus product cost"
                        icon={TrendingUp}
                    />

                    <StatCard
                        title="Net Profit"
                        value={formatCurrency(
                            data.netProfit
                        )}
                        subtitle="After business expenses"
                        icon={Wallet}
                    />

                    <StatCard
                        title="Profit Margin"
                        value={`${data.profitMargin.toFixed(
                            1
                        )}%`}
                        subtitle="Net profitability"
                        icon={Percent}
                        trend={data.profitMargin}
                    />

                </div>


                {/* ==================================================
                    SECONDARY METRICS
                ================================================== */}

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        title="Total Sales"
                        value={formatNumber(
                            data.totalSales
                        )}
                        subtitle="Completed transactions"
                        icon={ShoppingCart}
                    />

                    <StatCard
                        title="Total Expenses"
                        value={formatCurrency(
                            data.totalExpenses
                        )}
                        subtitle={`${formatNumber(
                            data.totalExpensesCount
                        )} expense records`}
                        icon={TrendingDown}
                    />

                    <StatCard
                        title="Products"
                        value={formatNumber(
                            data.totalProducts
                        )}
                        subtitle={`${formatNumber(
                            data.totalStockUnits
                        )} units in stock`}
                        icon={Package}
                    />

                    <StatCard
                        title="Low Stock"
                        value={formatNumber(
                            data.lowStockProducts
                        )}
                        subtitle="Products needing attention"
                        icon={AlertTriangle}
                        danger={
                            data.lowStockProducts > 0
                        }
                    />

                </div>


                {/* ==================================================
                    FINANCIAL PERFORMANCE
                ================================================== */}

                <section className="mt-8">

                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Activity size={18} />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Financial Performance
                            </h2>

                            <p className="text-xs text-slate-500">
                                Current aggregate business performance
                            </p>
                        </div>
                    </div>


                    <div className="grid gap-4 lg:grid-cols-2">

                        <PerformanceBar
                            label="Revenue"
                            value={data.revenue}
                            max={maxFinancialValue}
                            icon={CircleDollarSign}
                            description="Total sales generated"
                        />

                        <PerformanceBar
                            label="Gross Profit"
                            value={data.grossProfit}
                            max={maxFinancialValue}
                            icon={TrendingUp}
                            description="Profit before operating expenses"
                        />

                        <PerformanceBar
                            label="Business Expenses"
                            value={data.totalExpenses}
                            max={maxFinancialValue}
                            icon={TrendingDown}
                            description="Recorded operating expenses"
                        />

                        <PerformanceBar
                            label="Net Profit"
                            value={data.netProfit}
                            max={maxFinancialValue}
                            icon={Wallet}
                            description="Final profit after expenses"
                        />

                    </div>
                </section>


                {/* ==================================================
                    BUSINESS HEALTH
                ================================================== */}

                <section className="mt-8 grid gap-4 lg:grid-cols-3">

                    {/* Profitability */}
                    <div className="rounded-2xl border border-emerald-500/10 bg-[#0b1712] p-6">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                <TrendingUp size={19} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Profitability
                                </h3>

                                <p className="text-xs text-slate-500">
                                    Net business performance
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-3xl font-bold">
                                {data.profitMargin.toFixed(
                                    1
                                )}
                                <span className="text-lg text-slate-500">
                                    %
                                </span>
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                Current net profit margin based
                                on recorded transactions.
                            </p>
                        </div>

                    </div>


                    {/* Inventory */}
                    <div className="rounded-2xl border border-emerald-500/10 bg-[#0b1712] p-6">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                                <Boxes size={19} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Inventory
                                </h3>

                                <p className="text-xs text-slate-500">
                                    Stock overview
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold">
                                    {formatNumber(
                                        data.totalStockUnits
                                    )}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    total stock units
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-xl font-bold text-amber-300">
                                    {formatNumber(
                                        data.lowStockProducts
                                    )}
                                </p>

                                <p className="text-xs text-slate-500">
                                    low stock
                                </p>
                            </div>
                        </div>

                    </div>


                    {/* Sales Activity */}
                    <div className="rounded-2xl border border-emerald-500/10 bg-[#0b1712] p-6">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/10 text-lime-400">
                                <ShoppingCart size={19} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Sales Activity
                                </h3>

                                <p className="text-xs text-slate-500">
                                    Transaction overview
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-3xl font-bold">
                                {formatNumber(
                                    data.totalSales
                                )}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                completed sales recorded in
                                your business.
                            </p>
                        </div>

                    </div>

                </section>


                {/* ==================================================
                    VYPARMIND INSIGHT TEASER
                ================================================== */}

                <section className="relative mt-8 overflow-hidden rounded-3xl border border-emerald-400/10 bg-gradient-to-br from-[#0c1d15] via-[#0b1712] to-[#09130f] p-6 sm:p-8">

                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/[0.06] blur-[90px]" />

                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div className="max-w-2xl">

                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-black">
                                    <Activity size={16} />
                                </div>

                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                    VyparMind Intelligence
                                </span>
                            </div>

                            <h2 className="text-xl font-bold sm:text-2xl">
                                Analytics tells you what happened.
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                VyparMind will use these business
                                signals to explain why they happened,
                                identify risks and suggest what you
                                should focus on next.
                            </p>

                        </div>

                        <div className="shrink-0 rounded-xl border border-emerald-500/10 bg-black/20 px-5 py-4">
                            <p className="text-xs text-slate-500">
                                Intelligence layer
                            </p>

                            <p className="mt-1 font-semibold text-emerald-400">
                                Analytics → VyparMind
                            </p>
                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="py-8 text-center">
                    <p className="text-xs text-slate-600">
                        Business analytics powered by VyparIntel
                    </p>
                </div>

            </main>
        </div>
    );
}