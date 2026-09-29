import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    RefreshCw,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Receipt,
    IndianRupee,
    AlertTriangle,
    Sparkles,
    ArrowUpRight,
    Boxes,
    Activity,
    Plus,
    BarChart3,
    Brain,
    Search,
    ShieldAlert,
    Lightbulb,
    Sun,
    CheckCircle2,
    Zap,
    CircleAlert,
} from "lucide-react";

import api from "../api/axios";
import Navbar from "../components/Navbar";

const Dashboard = () => {
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);

    const [morningBrief, setMorningBrief] =
        useState("");

    const [whyAnalysis, setWhyAnalysis] =
        useState("");

    const [riskAnalysis, setRiskAnalysis] =
        useState("");

    const [recommendations, setRecommendations] =
        useState("");

    const [riskData, setRiskData] =
        useState(null);

    const [recommendationData, setRecommendationData] =
        useState(null);

    const [whyEvidence, setWhyEvidence] =
        useState(null);

    const [business, setBusiness] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    const fetchDashboard = async (
        isRefresh = false
    ) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login", {
                    replace: true,
                });

                return;
            }

            const config = {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            };

            const results =
                await Promise.allSettled([
                    api.get(
                        "/api/analytics/dashboard",
                        config
                    ),

                    api.get(
                        "/api/morning-brief",
                        config
                    ),

                    api.get(
                        "/api/business/my",
                        config
                    ),

                    api.get(
                        "/api/why",
                        config
                    ),

                    api.get(
                        "/api/risk",
                        config
                    ),

                    api.get(
                        "/api/recommendations",
                        config
                    ),
                ]);

            const [
                analyticsResult,
                briefResult,
                businessResult,
                whyResult,
                riskResult,
                recommendationResult,
            ] = results;

            // ==========================================
            // AUTHENTICATION
            // ==========================================

            const unauthorized =
                results.some(
                    (result) =>
                        result.status ===
                            "rejected" &&
                        result.reason?.response
                            ?.status === 401
                );

            if (unauthorized) {
                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            // ==========================================
            // ANALYTICS
            // ==========================================

            if (
                analyticsResult.status ===
                "fulfilled"
            ) {
                setAnalytics(
                    analyticsResult.value.data
                        ?.analytics || null
                );
            } else {
                console.error(
                    "Analytics Error:",
                    analyticsResult.reason
                );
            }

            // ==========================================
            // MORNING BRIEF
            // ==========================================

            if (
                briefResult.status ===
                "fulfilled"
            ) {
                const data =
                    briefResult.value.data;

                setMorningBrief(
                    data?.vyparMind
                        ?.morningBrief || ""
                );
            } else {
                console.error(
                    "Morning Brief Error:",
                    briefResult.reason
                );
            }

            // ==========================================
            // BUSINESS
            // ==========================================

            if (
                businessResult.status ===
                "fulfilled"
            ) {
                setBusiness(
                    businessResult.value.data
                        ?.business || null
                );
            } else {
                console.error(
                    "Business Error:",
                    businessResult.reason
                );
            }

            // ==========================================
            // WHY ENGINE
            // ==========================================

            if (
                whyResult.status ===
                "fulfilled"
            ) {
                const data =
                    whyResult.value.data;

                setWhyAnalysis(
                    data?.vyparMind
                        ?.whyAnalysis || ""
                );

                setWhyEvidence(
                    data?.evidence || null
                );
            } else {
                console.error(
                    "Why Engine Error:",
                    whyResult.reason
                );
            }

            // ==========================================
            // RISK ENGINE
            // ==========================================

            if (
                riskResult.status ===
                "fulfilled"
            ) {
                const data =
                    riskResult.value.data;

                setRiskAnalysis(
                    data?.vyparMind
                        ?.riskAnalysis || ""
                );

                setRiskData(
                    data?.riskData || null
                );
            } else {
                console.error(
                    "Risk Engine Error:",
                    riskResult.reason
                );
            }

            // ==========================================
            // RECOMMENDATION ENGINE
            // ==========================================

            if (
                recommendationResult.status ===
                "fulfilled"
            ) {
                const data =
                    recommendationResult
                        .value.data;

                setRecommendations(
                    data?.vyparMind
                        ?.recommendations || ""
                );

                setRecommendationData(
                    data?.recommendationData ||
                        null
                );
            } else {
                console.error(
                    "Recommendation Engine Error:",
                    recommendationResult.reason
                );
            }
        } catch (err) {
            console.error(
                "Dashboard Error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // ==========================================
    // FORMATTERS
    // ==========================================

    const formatCurrency = (
        value = 0
    ) => {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "₹0";
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(number);
    };

    const formatNumber = (
        value = 0
    ) => {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "0";
        }

        return number.toLocaleString(
            "en-IN"
        );
    };

    // ==========================================
    // AI DATA HELPERS
    // ==========================================

    const getRiskItems = () => {
        if (!riskData) {
            return [];
        }

        if (Array.isArray(riskData)) {
            return riskData;
        }

        if (
            Array.isArray(
                riskData.risks
            )
        ) {
            return riskData.risks;
        }

        if (
            Array.isArray(
                riskData.signals
            )
        ) {
            return riskData.signals;
        }

        return [];
    };

    const getRiskCount = () => {
        return getRiskItems().length;
    };

    const getHighRiskCount = () => {
        return getRiskItems().filter(
            (risk) =>
                String(
                    risk?.severity || ""
                ).toUpperCase() ===
                "HIGH"
        ).length;
    };

    const getRecommendationCount = () => {
        if (!recommendationData) {
            return recommendations ? 1 : 0;
        }

        if (
            Array.isArray(
                recommendationData
                    .recommendations
            )
        ) {
            return recommendationData
                .recommendations.length;
        }

        if (
            Array.isArray(
                recommendationData.signals
            )
        ) {
            return recommendationData
                .signals.length;
        }

        return recommendations ? 1 : 0;
    };

    const getWhySignalCount = () => {
        if (!whyEvidence) {
            return 0;
        }

        let count = 0;

        count +=
            whyEvidence
                .decliningProducts
                ?.length || 0;

        count +=
            whyEvidence
                .increasingExpenses
                ?.length || 0;

        count +=
            whyEvidence
                .lowStockProducts
                ?.length || 0;

        return count;
    };

    const getEngineStatus = ({
        hasData,
        attention = false,
    }) => {
        if (!hasData) {
            return {
                label: "Waiting",
                className:
                    "bg-slate-500/10 text-slate-500",
                dot: "bg-slate-500",
            };
        }

        if (attention) {
            return {
                label: "Attention",
                className:
                    "bg-amber-500/10 text-amber-400",
                dot: "bg-amber-400",
            };
        }

        return {
            label: "Live",
            className:
                "bg-emerald-500/10 text-emerald-400",
            dot: "bg-emerald-400",
        };
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-emerald-950 border-t-emerald-400" />

                        <p className="text-sm text-slate-400">
                            Preparing your business
                            intelligence...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center px-6">
                    <div className="w-full max-w-md rounded-3xl border border-red-900/40 bg-[#0C1814] p-8 text-center shadow-2xl">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                            <AlertTriangle className="h-7 w-7 text-red-400" />
                        </div>

                        <h2 className="text-xl font-bold">
                            Dashboard Error
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                fetchDashboard()
                            }
                            className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-[#06110D] transition hover:bg-emerald-400"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // DATA
    // ==========================================

    const revenue =
        analytics?.revenue || 0;

    const netProfit =
        analytics?.netProfit || 0;

    const totalSales =
        analytics?.totalSales || 0;

    const totalExpenses =
        analytics?.totalExpenses || 0;

    const profitMargin =
        analytics?.profitMargin || 0;

    const totalStockUnits =
        analytics?.totalStockUnits || 0;

    const lowStockProducts =
        analytics?.lowStockProducts || 0;

    const riskCount =
        getRiskCount();

    const highRiskCount =
        getHighRiskCount();

    const recommendationCount =
        getRecommendationCount();

    const whySignalCount =
        getWhySignalCount();

    const whyStatus =
        getEngineStatus({
            hasData: Boolean(
                whyAnalysis ||
                    whyEvidence
            ),
            attention:
                whySignalCount > 0,
        });

    const riskStatus =
        getEngineStatus({
            hasData: Boolean(
                riskAnalysis ||
                    riskData
            ),
            attention:
                highRiskCount > 0,
        });

    const recommendationStatus =
        getEngineStatus({
            hasData: Boolean(
                recommendations ||
                    recommendationData
            ),
        });

    const morningBriefStatus =
        getEngineStatus({
            hasData: Boolean(
                morningBrief
            ),
        });



    return (
        <div className="min-h-screen overflow-x-hidden bg-[#07100D] text-white">

            {/* ==========================================
                BACKGROUND ATMOSPHERE
            ========================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />

                <div className="absolute right-[-150px] top-[20%] h-[420px] w-[420px] rounded-full bg-teal-500/[0.06] blur-[120px]" />

                <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-lime-500/[0.035] blur-[120px]" />
            </div>

            <Navbar />

            <main className="relative mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            </span>

                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Business Command Center
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Good Morning
                            {business?.name
                                ? `, ${business.name}`
                                : ""}{" "}
                            <span>👋</span>
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Everything important about
                            your business, organized in
                            one intelligent workspace.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            fetchDashboard(true)
                        }
                        disabled={refreshing}
                        className="group flex w-fit items-center gap-2 rounded-2xl border border-emerald-900/50 bg-[#0C1814] px-5 py-3 text-sm font-medium text-slate-300 shadow-lg transition duration-300 hover:border-emerald-500/40 hover:bg-emerald-950/30 hover:text-emerald-300 disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 transition ${
                                refreshing
                                    ? "animate-spin"
                                    : "group-hover:rotate-180"
                            }`}
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh Data"}
                    </button>
                </section>

                {/* ==========================================
                    TOP KPI AREA
                ========================================== */}

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">

                    {/* REVENUE */}

                    <div className="group relative overflow-hidden rounded-[28px] border border-emerald-900/50 bg-[#0C1814] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40 lg:col-span-5">
                        <div className="absolute right-[-60px] top-[-60px] h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="relative">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Revenue
                                    </p>

                                    <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                                        {formatCurrency(
                                            revenue
                                        )}
                                    </h2>
                                </div>

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                    <IndianRupee className="h-7 w-7" />
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                    Business Revenue
                                </div>

                                <span className="text-xs text-slate-600">
                                    All time
                                </span>
                            </div>

                            <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-800">
                                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300" />
                            </div>
                        </div>
                    </div>

                    {/* PROFIT */}

                    <div className="group relative overflow-hidden rounded-[28px] border border-teal-900/50 bg-[#0C1814] p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-500/40 lg:col-span-3">
                        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

                        <div className="relative flex h-full flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className="rounded-2xl bg-teal-500/10 p-3.5 text-teal-400">
                                    <TrendingUp className="h-6 w-6" />
                                </div>

                                {netProfit >= 0 ? (
                                    <TrendingUp className="h-5 w-5 text-teal-400" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-red-400" />
                                )}
                            </div>

                            <div className="mt-8">
                                <p className="text-sm text-slate-500">
                                    Net Profit
                                </p>

                                <h2 className="mt-2 text-3xl font-bold">
                                    {formatCurrency(
                                        netProfit
                                    )}
                                </h2>

                                <p
                                    className={`mt-2 text-xs ${
                                        netProfit >= 0
                                            ? "text-teal-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    {netProfit >= 0
                                        ? "Positive business result"
                                        : "Needs attention"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SALES */}

                    <div className="group relative overflow-hidden rounded-[28px] border border-lime-900/40 bg-[#0C1814] p-6 transition duration-300 hover:-translate-y-1 hover:border-lime-500/40 lg:col-span-4">
                        <div className="absolute bottom-[-60px] right-[-50px] h-44 w-44 rounded-full bg-lime-500/[0.07] blur-3xl" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Sales
                                </p>

                                <h2 className="mt-4 text-4xl font-bold">
                                    {formatNumber(
                                        totalSales
                                    )}
                                </h2>

                                <p className="mt-2 text-xs text-lime-400">
                                    Transactions recorded
                                </p>
                            </div>

                            <div className="rounded-2xl bg-lime-500/10 p-4 text-lime-400">
                                <ShoppingCart className="h-7 w-7" />
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/sales")
                            }
                            className="relative mt-7 flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-lime-400"
                        >
                            View sales
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </section>

                {/* ==========================================
                    VYPARMIND
                ========================================== */}

                <section className="group relative mt-5 overflow-hidden rounded-[30px] border border-emerald-800/50 bg-gradient-to-br from-[#10251B] via-[#0C1814] to-[#08120F] shadow-[0_20px_80px_rgba(16,185,129,0.06)]">
                    <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-emerald-400/[0.08] blur-[90px]" />

                    <div className="absolute bottom-[-100px] left-[25%] h-56 w-56 rounded-full bg-teal-400/[0.05] blur-[90px]" />

                    <div className="relative p-6 sm:p-8 lg:p-9">
                        <div className="flex flex-col gap-7 lg:flex-row lg:items-center">

                            <div className="relative shrink-0">
                                <div className="absolute inset-0 animate-pulse rounded-[24px] bg-emerald-400/20 blur-xl" />

                                <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-inner">
                                    <Brain className="h-10 w-10" />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-xl font-bold sm:text-2xl">
                                        VyparMind
                                    </h2>

                                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                                        <Sparkles className="h-3 w-3" />
                                        AI Intelligence
                                    </span>
                                </div>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-[15px]">
                                    {morningBrief ||
                                        "VyparMind is analyzing your business data."}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/morning-brief"
                                    )
                                }
                                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                            >
                                Full Morning Brief
                                <ArrowUpRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    AI INTELLIGENCE CENTER
                ========================================== */}

                <section className="mt-5">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <Brain className="h-4 w-4" />
                                </div>

                                <h2 className="text-lg font-bold">
                                    AI Intelligence Center
                                </h2>
                            </div>

                            <p className="mt-1 text-xs text-slate-600">
                                A live view of VyparMind's business
                                intelligence engines.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                            </span>

                            VyparMind Active
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                        {/* ==================================
                            WHY ENGINE
                        ================================== */}

                        <button
                            onClick={() =>
                                navigate("/why")
                            }
                            className="group relative overflow-hidden rounded-[26px] border border-blue-900/40 bg-[#0C1814] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-500/40"
                        >
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/[0.06] blur-3xl" />

                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                                        <Search className="h-6 w-6" />
                                    </div>

                                    <span
                                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${whyStatus.className}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${whyStatus.dot}`}
                                        />

                                        {whyStatus.label}
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-bold">
                                    Why Engine
                                </h3>

                                <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-500">
                                    Understand the evidence behind
                                    important business changes.
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="text-xs text-slate-600">
                                        {whySignalCount > 0
                                            ? `${whySignalCount} signal${
                                                  whySignalCount !== 1
                                                      ? "s"
                                                      : ""
                                              } detected`
                                            : whyAnalysis
                                            ? "Analysis available"
                                            : "Awaiting analysis"}
                                    </span>

                                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 transition group-hover:text-blue-300">
                                        Explore
                                        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* ==================================
                            RISK ENGINE
                        ================================== */}

                        <button
                            onClick={() =>
                                navigate("/risk")
                            }
                            className="group relative overflow-hidden rounded-[26px] border border-amber-900/40 bg-[#0C1814] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-amber-500/40"
                        >
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/[0.06] blur-3xl" />

                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>

                                    <span
                                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${riskStatus.className}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${riskStatus.dot}`}
                                        />

                                        {riskStatus.label}
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-bold">
                                    Risk Engine
                                </h3>

                                <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-500">
                                    Monitor business signals that
                                    may require attention.
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="text-xs text-slate-600">
                                        {highRiskCount > 0
                                            ? `${highRiskCount} high-risk signal${
                                                  highRiskCount !== 1
                                                      ? "s"
                                                      : ""
                                              }`
                                            : riskCount > 0
                                            ? `${riskCount} signal${
                                                  riskCount !== 1
                                                      ? "s"
                                                      : ""
                                              }`
                                            : riskAnalysis
                                            ? "Analysis available"
                                            : "No signals shown"}
                                    </span>

                                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 transition group-hover:text-amber-300">
                                        Review
                                        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* ==================================
                            RECOMMENDATIONS
                        ================================== */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/recommendations"
                                )
                            }
                            className="group relative overflow-hidden rounded-[26px] border border-purple-900/40 bg-[#0C1814] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-purple-500/40"
                        >
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/[0.06] blur-3xl" />

                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                                        <Lightbulb className="h-6 w-6" />
                                    </div>

                                    <span
                                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${recommendationStatus.className}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${recommendationStatus.dot}`}
                                        />

                                        {recommendationStatus.label}
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-bold">
                                    Recommendations
                                </h3>

                                <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-500">
                                    Practical areas to review based
                                    on current business signals.
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="text-xs text-slate-600">
                                        {recommendationCount > 0
                                            ? `${recommendationCount} recommendation${
                                                  recommendationCount !== 1
                                                      ? "s"
                                                      : ""
                                              }`
                                            : recommendations
                                            ? "Action plan available"
                                            : "Awaiting recommendations"}
                                    </span>

                                    <span className="flex items-center gap-1 text-xs font-semibold text-purple-400 transition group-hover:text-purple-300">
                                        View
                                        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* ==================================
                            MORNING BRIEF
                        ================================== */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/morning-brief"
                                )
                            }
                            className="group relative overflow-hidden rounded-[26px] border border-emerald-900/40 bg-[#0C1814] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
                        >
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/[0.06] blur-3xl" />

                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                                        <Sun className="h-6 w-6" />
                                    </div>

                                    <span
                                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${morningBriefStatus.className}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${morningBriefStatus.dot}`}
                                        />

                                        {morningBriefStatus.label}
                                    </span>
                                </div>

                                <h3 className="mt-6 text-lg font-bold">
                                    Morning Brief
                                </h3>

                                <p className="mt-2 min-h-[48px] text-xs leading-5 text-slate-500">
                                    Your daily business summary,
                                    signals, and areas to review.
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                        {morningBrief ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <CircleAlert className="h-3.5 w-3.5 text-slate-600" />
                                        )}

                                        {morningBrief
                                            ? "Generated"
                                            : "Pending"}
                                    </span>

                                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition group-hover:text-emerald-300">
                                        Open
                                        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* ==========================================
                    AI SIGNAL SUMMARY
                ========================================== */}

                <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-900/40 bg-[#0C1814] px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Zap className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-600">
                                AI Engines
                            </p>

                            <p className="mt-1 text-lg font-bold">
                                4 Active
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-amber-900/40 bg-[#0C1814] px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                            <ShieldAlert className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-600">
                                Risk Signals
                            </p>

                            <p className="mt-1 text-lg font-bold">
                                {formatNumber(
                                    riskCount
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-blue-900/40 bg-[#0C1814] px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Search className="h-5 w-5" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-600">
                                Business Signals
                            </p>

                            <p className="mt-1 text-lg font-bold">
                                {formatNumber(
                                    whySignalCount
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    SECONDARY CARDS
                ========================================== */}

                <section className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    {/* EXPENSE */}

                    <div className="group rounded-[24px] border border-red-900/30 bg-[#0C1814] p-5 transition hover:-translate-y-1 hover:border-red-700/40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                                <Receipt className="h-5 w-5" />
                            </div>

                            <span className="text-xs text-slate-600">
                                Expenses
                            </span>
                        </div>

                        <p className="mt-6 text-sm text-slate-500">
                            Total Expenses
                        </p>

                        <h3 className="mt-1 text-2xl font-bold">
                            {formatCurrency(
                                totalExpenses
                            )}
                        </h3>
                    </div>

                    {/* MARGIN */}

                    <div className="group rounded-[24px] border border-emerald-900/40 bg-[#0C1814] p-5 transition hover:-translate-y-1 hover:border-emerald-500/40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Activity className="h-5 w-5" />
                            </div>

                            <span className="text-xs text-slate-600">
                                Performance
                            </span>
                        </div>

                        <p className="mt-6 text-sm text-slate-500">
                            Profit Margin
                        </p>

                        <h3
                            className={`mt-1 text-2xl font-bold ${
                                Number(
                                    profitMargin
                                ) >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                            }`}
                        >
                            {Number(
                                profitMargin
                            ).toFixed(1)}
                            %
                        </h3>
                    </div>

                    {/* INVENTORY */}

                    <div className="group rounded-[24px] border border-teal-900/40 bg-[#0C1814] p-5 transition hover:-translate-y-1 hover:border-teal-500/40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                                <Boxes className="h-5 w-5" />
                            </div>

                            <span className="text-xs text-slate-600">
                                Inventory
                            </span>
                        </div>

                        <p className="mt-6 text-sm text-slate-500">
                            Stock Units
                        </p>

                        <h3 className="mt-1 text-2xl font-bold">
                            {formatNumber(
                                totalStockUnits
                            )}
                        </h3>
                    </div>

                    {/* LOW STOCK */}

                    <div className="group rounded-[24px] border border-amber-900/40 bg-[#0C1814] p-5 transition hover:-translate-y-1 hover:border-amber-500/40">
                        <div className="flex items-center justify-between">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <span className="text-xs text-slate-600">
                                Attention
                            </span>
                        </div>

                        <p className="mt-6 text-sm text-slate-500">
                            Low Stock Products
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-amber-400">
                            {formatNumber(
                                lowStockProducts
                            )}
                        </h3>
                    </div>
                </section>

                {/* ==========================================
                    QUICK ACTIONS
                ========================================== */}

                <section className="mt-5 rounded-[28px] border border-slate-800/80 bg-[#0C1814] p-6 shadow-xl sm:p-7">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />

                                <h2 className="font-bold">
                                    Quick Actions
                                </h2>
                            </div>

                            <p className="mt-1 text-xs text-slate-600">
                                Frequently used business tools
                            </p>
                        </div>

                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {/* ADD PRODUCT */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/products/add"
                                )
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#08120F] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-950/20"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Plus className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    Add Product
                                </p>

                                <p className="mt-0.5 text-xs text-slate-600">
                                    Update inventory
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-700 transition group-hover:text-emerald-400" />
                        </button>

                        {/* SALES */}

                        <button
                            onClick={() =>
                                navigate("/sales")
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#08120F] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-teal-500/40 hover:bg-teal-950/20"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                                <ShoppingCart className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    Record Sale
                                </p>

                                <p className="mt-0.5 text-xs text-slate-600">
                                    Add transaction
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-700 transition group-hover:text-teal-400" />
                        </button>

                        {/* EXPENSE */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/expenses"
                                )
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#08120F] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-red-500/30 hover:bg-red-950/10"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                                <Receipt className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    Add Expense
                                </p>

                                <p className="mt-0.5 text-xs text-slate-600">
                                    Track spending
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-700 transition group-hover:text-red-400" />
                        </button>

                        {/* ANALYTICS */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/analytics"
                                )
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#08120F] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-lime-500/40 hover:bg-lime-950/10"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-500/10 text-lime-400">
                                <BarChart3 className="h-5 w-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-semibold">
                                    Analytics
                                </p>

                                <p className="mt-0.5 text-xs text-slate-600">
                                    Explore business
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-slate-700 transition group-hover:text-lime-400" />
                        </button>
                    </div>
                </section>

                {/* ==========================================
                    FOOTER
                ========================================== */}

                <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-emerald-950/50 py-6 text-xs text-slate-600 sm:flex-row">
                    <p>
                        ©{" "}
                        {new Date().getFullYear()}{" "}
                        VyparIntel
                    </p>

                    <p className="flex items-center gap-1.5">
                        Intelligence powered by

                        <span className="font-semibold text-emerald-500">
                            VyparMind AI
                        </span>
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;