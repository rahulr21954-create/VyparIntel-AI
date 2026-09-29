import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Brain,
    CheckCircle2,
    Clock3,
    Lightbulb,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Wallet,
    Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";


// ========================================
// HELPERS
// ========================================

const formatCurrency = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "₹0";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
};


const formatPercent = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "N/A";
    }

    const number = Number(value);

    return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
};


// ========================================
// MAIN COMPONENT
// ========================================

const MorningBrief = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ========================================
    // FETCH MORNING BRIEF
    // ========================================

    const fetchMorningBrief = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await api.get(
                "/api/morning-brief",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Morning Brief API Response:",
                response.data
            );

            if (
                !response.data ||
                response.data.success === false
            ) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load morning brief."
                );
            }

            setData(response.data);

        } catch (err) {
            console.error(
                "Morning Brief Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load morning brief."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMorningBrief();
    }, []);


    // ========================================
    // EXTRACT DATA SAFELY
    // ========================================

    const briefData =
        data?.briefData ||
        data?.morningBriefData ||
        {};

    const revenue =
        briefData.revenue || {};

    const expenses =
        briefData.expenses || {};

    const profit =
        briefData.profit || {};

    const signals =
        briefData.signals || [];

    const aiBrief =
        data?.vyparMind?.morningBrief ||
        data?.vyparMind?.brief ||
        data?.morningBrief ||
        "";


    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">

                <Navbar />

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

                            <Brain
                                size={28}
                                className="animate-pulse text-emerald-400"
                            />

                        </div>

                        <h2 className="text-lg font-semibold">
                            Preparing your Morning Brief
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            VyparMind is reviewing your business data...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================
    // ERROR
    // ========================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">

                <Navbar />

                <main className="mx-auto max-w-4xl px-6 py-16">

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

                        <AlertTriangle
                            size={40}
                            className="mx-auto mb-4 text-red-400"
                        />

                        <h2 className="text-xl font-semibold">
                            Morning Brief unavailable
                        </h2>

                        <p className="mt-2 text-sm text-gray-400">
                            {error}
                        </p>

                        <button
                            onClick={fetchMorningBrief}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-black transition hover:bg-emerald-400"
                        >
                            <RefreshCw size={17} />

                            Try Again
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // ========================================
    // UI
    // ========================================

    return (
        <div className="min-h-screen bg-[#07100D] text-white">

            <Navbar />

            <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">

                {/* ========================================
                    HEADER
                ======================================== */}

                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                        <div className="mb-3 flex items-center gap-2">

                            <div className="rounded-xl bg-emerald-500/10 p-2.5">

                                <Sparkles
                                    size={20}
                                    className="text-emerald-400"
                                />

                            </div>

                            <span className="text-sm font-medium text-emerald-400">
                                VyparMind Daily Intelligence
                            </span>

                        </div>


                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Morning Brief
                        </h1>


                        <p className="mt-2 max-w-2xl text-gray-400">
                            A quick view of what happened, what needs
                            attention, and what you should review today.
                        </p>

                    </div>


                    <button
                        onClick={fetchMorningBrief}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition hover:bg-white/[0.06]"
                    >
                        <RefreshCw size={16} />

                        Refresh Brief
                    </button>

                </div>


                {/* ========================================
                    AI SUMMARY
                ======================================== */}

                <section className="mb-8 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent">

                    <div className="p-6 md:p-8">

                        <div className="mb-5 flex items-center gap-3">

                            <div className="rounded-xl bg-emerald-500/10 p-3">

                                <Brain
                                    size={22}
                                    className="text-emerald-400"
                                />

                            </div>

                            <div>

                                <p className="text-xs uppercase tracking-wider text-emerald-400">
                                    VyparMind
                                </p>

                                <h2 className="text-xl font-semibold">
                                    Today's Business Summary
                                </h2>

                            </div>

                        </div>


                        {aiBrief ? (
                            <div className="whitespace-pre-line text-sm leading-7 text-gray-300 md:text-base">
                                {aiBrief}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No AI summary was returned by the
                                Morning Brief service.
                            </p>
                        )}

                    </div>

                </section>


                {/* ========================================
                    KEY METRICS
                ======================================== */}

                <section className="mb-8">

                    <div className="mb-4">

                        <h2 className="text-xl font-semibold">
                            Business Snapshot
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Key numbers currently available to VyparMind.
                        </p>

                    </div>


                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <SnapshotCard
                            title="Revenue"
                            value={formatCurrency(
                                revenue.current
                            )}
                            change={
                                revenue.changePercent
                            }
                            icon={Wallet}
                        />


                        <SnapshotCard
                            title="Expenses"
                            value={formatCurrency(
                                expenses.current
                            )}
                            change={
                                expenses.changePercent
                            }
                            icon={ArrowUpRight}
                            negativeChange
                        />


                        <SnapshotCard
                            title="Gross Profit"
                            value={formatCurrency(
                                profit.grossProfit
                            )}
                            icon={TrendingUp}
                        />


                        <SnapshotCard
                            title="Net Profit"
                            value={formatCurrency(
                                profit.netProfit
                            )}
                            icon={profit.netProfit < 0
                                ? TrendingDown
                                : TrendingUp}
                            negative={
                                Number(
                                    profit.netProfit || 0
                                ) < 0
                            }
                        />

                    </div>

                </section>


                {/* ========================================
                    TODAY'S ATTENTION
                ======================================== */}

                <section className="mb-8">

                    <div className="mb-4 flex items-center gap-3">

                        <div className="rounded-xl bg-yellow-500/10 p-3">

                            <ShieldAlert
                                size={20}
                                className="text-yellow-400"
                            />

                        </div>

                        <div>

                            <h2 className="text-xl font-semibold">
                                What Needs Attention
                            </h2>

                            <p className="text-sm text-gray-500">
                                Business signals that deserve review today.
                            </p>

                        </div>

                    </div>


                    {signals.length === 0 ? (

                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

                            <div className="flex items-center gap-3">

                                <CheckCircle2
                                    size={22}
                                    className="text-emerald-400"
                                />

                                <div>

                                    <h3 className="font-semibold">
                                        No major signals detected
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        There are currently no recorded
                                        business signals requiring attention.
                                    </p>

                                </div>

                            </div>

                        </div>

                    ) : (

                        <div className="grid gap-4 md:grid-cols-2">

                            {signals.map(
                                (signal, index) => (

                                    <SignalCard
                                        key={index}
                                        signal={signal}
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ========================================
                    QUICK ACTIONS
                ======================================== */}

                <section className="mb-8">

                    <div className="mb-4 flex items-center gap-3">

                        <div className="rounded-xl bg-blue-500/10 p-3">

                            <Lightbulb
                                size={20}
                                className="text-blue-400"
                            />

                        </div>

                        <div>

                            <h2 className="text-xl font-semibold">
                                Today's Focus
                            </h2>

                            <p className="text-sm text-gray-500">
                                Areas worth reviewing before making business decisions.
                            </p>

                        </div>

                    </div>


                    <div className="grid gap-4 md:grid-cols-3">

                        <FocusCard
                            icon={TrendingDown}
                            title="Review Sales"
                            description="Check products or periods where sales performance has changed."
                        />

                        <FocusCard
                            icon={Wallet}
                            title="Review Expenses"
                            description="Look at expense categories that have increased significantly."
                        />

                        <FocusCard
                            icon={Zap}
                            title="Review Inventory"
                            description="Check products approaching or reaching minimum stock."
                        />

                    </div>

                </section>


                {/* ========================================
                    FOOTER
                ======================================== */}

                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5">

                    <Clock3
                        size={17}
                        className="mt-0.5 shrink-0 text-gray-500"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                        Morning Brief summarizes available business data
                        and AI-generated insights. Review the underlying
                        numbers before taking important business actions.
                    </p>

                </div>

            </main>

        </div>
    );
};


// ========================================
// SNAPSHOT CARD
// ========================================

const SnapshotCard = ({
    title,
    value,
    change,
    icon: Icon,
    negative = false,
    negativeChange = false,
}) => {

    return (
        <div className="rounded-2xl border border-white/10 bg-[#0B1712] p-5">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <p
                        className={`mt-2 text-2xl font-bold ${
                            negative
                                ? "text-red-400"
                                : "text-white"
                        }`}
                    >
                        {value}
                    </p>

                </div>


                <div className="rounded-xl bg-white/[0.04] p-3">

                    <Icon
                        size={19}
                        className={
                            negative
                                ? "text-red-400"
                                : "text-emerald-400"
                        }
                    />

                </div>

            </div>


            {change !== undefined &&
                change !== null && (

                    <div className="mt-4 flex items-center gap-2 text-xs">

                        {Number(change) >= 0 ? (
                            <ArrowUpRight
                                size={14}
                                className={
                                    negativeChange
                                        ? "text-red-400"
                                        : "text-emerald-400"
                                }
                            />
                        ) : (
                            <ArrowDownRight
                                size={14}
                                className={
                                    negativeChange
                                        ? "text-emerald-400"
                                        : "text-red-400"
                                }
                            />
                        )}


                        <span
                            className={
                                (
                                    negativeChange
                                        ? Number(change) <= 0
                                        : Number(change) >= 0
                                )
                                    ? "text-emerald-400"
                                    : "text-red-400"
                            }
                        >
                            {formatPercent(change)}
                        </span>


                        <span className="text-gray-600">
                            vs previous period
                        </span>

                    </div>

                )}

        </div>
    );
};


// ========================================
// SIGNAL CARD
// ========================================

const SignalCard = ({ signal }) => {

    const type =
        signal?.type || "";


    const Icon =
        type === "DECLINING_REVENUE"
            ? TrendingDown
            : type === "RISING_EXPENSES"
            ? ArrowUpRight
            : type === "NEGATIVE_NET_PROFIT"
            ? AlertTriangle
            : type === "LOW_STOCK"
            ? Zap
            : type === "OUT_OF_STOCK"
            ? AlertTriangle
            : ShieldAlert;


    const title =
        type === "DECLINING_REVENUE"
            ? "Declining Revenue"
            : type === "RISING_EXPENSES"
            ? "Rising Expenses"
            : type === "NEGATIVE_NET_PROFIT"
            ? "Negative Net Profit"
            : type === "LOW_STOCK"
            ? "Low Stock"
            : type === "OUT_OF_STOCK"
            ? "Out of Stock"
            : "Business Signal";


    const severity =
        signal?.severity || "MEDIUM";


    const severityClass =
        severity === "HIGH"
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : severity === "LOW"
            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";


    return (
        <div className="rounded-2xl border border-white/10 bg-[#0B1712] p-5">

            <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3">

                    <div className="rounded-xl bg-yellow-500/10 p-3">

                        <Icon
                            size={19}
                            className="text-yellow-400"
                        />

                    </div>


                    <div>

                        <h3 className="font-semibold">
                            {title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            {signal?.recommendation ||
                                "Review this signal."}
                        </p>

                    </div>

                </div>


                <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityClass}`}
                >
                    {severity}
                </span>

            </div>


            {signal?.value !== undefined && (

                <div className="mt-4 border-t border-white/5 pt-4">

                    <span className="text-xs text-gray-500">
                        Signal value
                    </span>

                    <p className="mt-1 font-semibold">
                        {typeof signal.value === "number"
                            ? type.includes("REVENUE") ||
                              type.includes("EXPENSE")
                                ? formatPercent(
                                      signal.value
                                  )
                                : formatCurrency(
                                      signal.value
                                  )
                            : signal.value}
                    </p>

                </div>

            )}

        </div>
    );
};


// ========================================
// FOCUS CARD
// ========================================

const FocusCard = ({
    icon: Icon,
    title,
    description,
}) => {

    return (
        <div className="rounded-2xl border border-white/10 bg-[#0B1712] p-5 transition hover:border-emerald-500/20">

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

                <Icon
                    size={19}
                    className="text-emerald-400"
                />

            </div>


            <h3 className="font-semibold">
                {title}
            </h3>


            <p className="mt-2 text-sm leading-6 text-gray-500">
                {description}
            </p>

        </div>
    );
};


export default MorningBrief;