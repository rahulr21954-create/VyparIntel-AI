import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Brain,
    CheckCircle2,
    Clock3,
    Lightbulb,
    Package,
    RefreshCw,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet,
    Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";


// ==============================
// HELPERS
// ==============================

const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return "₹0";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
};


const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return "N/A";
    }

    const number = Number(value);

    return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
};


const cleanText = (text = "") => {
    return text
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/^#+\s*/, "")
        .replace(/^[-•]\s*/, "")
        .trim();
};


// ==============================
// STRUCTURED RECOMMENDATION PARSER
// ==============================

const parseRecommendations = (text) => {
    if (!text || typeof text !== "string") {
        return [];
    }

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const recommendations = [];

    let current = null;
    let currentField = null;


    const startRecommendation = () => {
        if (current) {
            recommendations.push(current);
        }

        current = {
            issue: "",
            evidence: "",
            action: "",
            reason: "",
            priority: "MEDIUM",
        };

        currentField = null;
    };


    const saveCurrent = () => {
        if (!current) return;

        const hasContent =
            current.issue ||
            current.evidence ||
            current.action ||
            current.reason;

        if (hasContent) {
            recommendations.push(current);
        }

        current = null;
        currentField = null;
    };


    for (let rawLine of lines) {

        let line = cleanText(rawLine);

        // Remove recommendation headings
        if (
            /^recommendation\s*\d*/i.test(line) ||
            /^recommendation$/i.test(line)
        ) {
            if (current && current.issue) {
                startRecommendation();
            } else if (!current) {
                current = {
                    issue: "",
                    evidence: "",
                    action: "",
                    reason: "",
                    priority: "MEDIUM",
                };
            }

            continue;
        }


        // Detect fields
        const match = line.match(
            /^(issue|evidence|recommended action|action|reason|priority)\s*:\s*(.*)$/i
        );


        if (match) {

            const field = match[1].toLowerCase();
            const value = match[2].trim();


            // A new Issue usually means a new recommendation
            if (
                field === "issue" &&
                current &&
                current.issue
            ) {
                startRecommendation();
            }


            if (!current) {
                current = {
                    issue: "",
                    evidence: "",
                    action: "",
                    reason: "",
                    priority: "MEDIUM",
                };
            }


            if (field === "issue") {
                current.issue = value;
                currentField = "issue";
            }

            else if (field === "evidence") {
                current.evidence = value;
                currentField = "evidence";
            }

            else if (
                field === "recommended action" ||
                field === "action"
            ) {
                current.action = value;
                currentField = "action";
            }

            else if (field === "reason") {
                current.reason = value;
                currentField = "reason";
            }

            else if (field === "priority") {

                const priority = value.toUpperCase();

                if (
                    priority.includes("HIGH")
                ) {
                    current.priority = "HIGH";
                }

                else if (
                    priority.includes("LOW")
                ) {
                    current.priority = "LOW";
                }

                else {
                    current.priority = "MEDIUM";
                }

                currentField = "priority";
            }

            continue;
        }


        // Handle numbered recommendation text
        if (
            /^\d+[\.\)]\s+/.test(line)
        ) {

            const numberedText =
                line.replace(
                    /^\d+[\.\)]\s+/,
                    ""
                );

            if (
                current &&
                current.issue
            ) {
                startRecommendation();
            }

            if (!current) {
                current = {
                    issue: "",
                    evidence: "",
                    action: "",
                    reason: "",
                    priority: "MEDIUM",
                };
            }

            if (!current.issue) {
                current.issue = numberedText;
                currentField = "issue";
            }

            continue;
        }


        // Continuation of previous field
        if (current && currentField) {

            if (
                currentField === "issue"
            ) {
                current.issue +=
                    ` ${line}`;
            }

            else if (
                currentField === "evidence"
            ) {
                current.evidence +=
                    ` ${line}`;
            }

            else if (
                currentField === "action"
            ) {
                current.action +=
                    ` ${line}`;
            }

            else if (
                currentField === "reason"
            ) {
                current.reason +=
                    ` ${line}`;
            }
        }
    }


    saveCurrent();


    // Remove empty recommendations
    const cleaned = recommendations.filter(
        (item) =>
            item.issue ||
            item.evidence ||
            item.action ||
            item.reason
    );


    // If structured parsing worked
    if (cleaned.length > 0) {
        return cleaned;
    }


    // ==============================
    // FALLBACK
    // ==============================

    return [
        {
            issue: "AI Business Recommendation",
            evidence: "",
            action: text.trim(),
            reason:
                "Generated by VyparIntel's Recommendation Engine based on the available business data.",
            priority: "MEDIUM",
        },
    ];
};


// ==============================
// PRIORITY
// ==============================

const getPriorityStyle = (priority) => {

    switch (priority) {

        case "HIGH":
            return {
                bg: "bg-red-500/10",
                border: "border-red-500/30",
                text: "text-red-400",
                icon: AlertTriangle,
            };

        case "LOW":
            return {
                bg: "bg-blue-500/10",
                border: "border-blue-500/30",
                text: "text-blue-400",
                icon: CheckCircle2,
            };

        default:
            return {
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/30",
                text: "text-yellow-400",
                icon: Clock3,
            };
    }
};


// ==============================
// SIGNAL ICON
// ==============================

const getSignalIcon = (type) => {

    switch (type) {

        case "DECLINING_REVENUE":
            return TrendingDown;

        case "RISING_EXPENSES":
            return ArrowUpRight;

        case "NEGATIVE_NET_PROFIT":
            return Wallet;

        case "LOW_STOCK":
            return Package;

        case "OUT_OF_STOCK":
            return AlertTriangle;

        default:
            return Zap;
    }
};


// ==============================
// SIGNAL TITLE
// ==============================

const getSignalTitle = (type) => {

    switch (type) {

        case "DECLINING_REVENUE":
            return "Declining Revenue";

        case "RISING_EXPENSES":
            return "Rising Expenses";

        case "NEGATIVE_NET_PROFIT":
            return "Negative Net Profit";

        case "LOW_STOCK":
            return "Low Stock";

        case "OUT_OF_STOCK":
            return "Out of Stock";

        default:
            return "Business Signal";
    }
};


// ==============================
// MAIN COMPONENT
// ==============================

const RecommendationEngine = () => {

    const [data, setData] = useState(null);

    const [recommendations, setRecommendations] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==============================
    // FETCH DATA
    // ==============================

    const fetchRecommendations = async () => {

        try {

            setLoading(true);
            setError("");


            const token =
                localStorage.getItem("token");


            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }


            const response =
                await api.get(
                    "/api/recommendations",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            console.log(
                "Recommendation API Response:",
                response.data
            );


            if (
                !response.data ||
                response.data.success === false
            ) {
                throw new Error(
                    response.data?.message ||
                    "Failed to load recommendations."
                );
            }


            setData(response.data);


            // ==============================
            // GET AI RESPONSE
            // ==============================

            const aiText =
                response.data?.vyparMind
                    ?.recommendations;


            console.log(
                "AI Recommendation Text:",
                aiText
            );


            if (
                typeof aiText === "string" &&
                aiText.trim()
            ) {

                const parsed =
                    parseRecommendations(
                        aiText
                    );

                console.log(
                    "Parsed Recommendations:",
                    parsed
                );

                setRecommendations(parsed);

            } else {

                setRecommendations([]);

            }

        } catch (err) {

            console.error(
                "Recommendation Engine Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load recommendations."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchRecommendations();

    }, []);


    // ==============================
    // DATA
    // ==============================

    const recommendationData =
        data?.recommendationData || {};


    const revenue =
        recommendationData.revenue || {};


    const expenses =
        recommendationData.expenses || {};


    const profit =
        recommendationData.profit || {};


    const signals =
        recommendationData.signals || [];


    const netProfit =
        Number(profit.netProfit || 0);


    // ==============================
    // STATUS
    // ==============================

    const businessStatus =
        netProfit < 0
            ? {
                title: "Attention Required",
                description:
                    "The current business data contains financial signals that should be reviewed.",
                icon: AlertTriangle,
                style:
                    "border-red-500/30 bg-red-500/5",
                text:
                    "text-red-400",
            }
            : {
                title: "Business Stable",
                description:
                    "No negative net-profit condition is currently detected.",
                icon: CheckCircle2,
                style:
                    "border-emerald-500/30 bg-emerald-500/5",
                text:
                    "text-emerald-400",
            };


    const StatusIcon =
        businessStatus.icon;


    // ==============================
    // LOADING
    // ==============================

    if (loading) {

        return (
            <div className="min-h-screen bg-[#07100D] text-white">

                <Navbar />

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div className="text-center">

                        <RefreshCw
                            className="mx-auto mb-4 animate-spin text-emerald-400"
                            size={32}
                        />

                        <p className="text-gray-400">
                            VyparMind is analyzing your business...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==============================
    // ERROR
    // ==============================

    if (error) {

        return (
            <div className="min-h-screen bg-[#07100D] text-white">

                <Navbar />

                <div className="mx-auto max-w-4xl px-6 py-16">

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

                        <AlertTriangle
                            className="mx-auto mb-4 text-red-400"
                            size={40}
                        />

                        <h2 className="mb-2 text-xl font-semibold">
                            Recommendation Engine unavailable
                        </h2>

                        <p className="mb-6 text-gray-400">
                            {error}
                        </p>

                        <button
                            onClick={fetchRecommendations}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-medium text-black transition hover:bg-emerald-400"
                        >
                            <RefreshCw size={17} />

                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ==============================
    // UI
    // ==============================

    return (
        <div className="min-h-screen bg-[#07100D] text-white">

            <Navbar />


            <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">

                {/* ==============================
                    HEADER
                ============================== */}

                <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

                    <div>

                        <div className="mb-3 flex items-center gap-2">

                            <div className="rounded-lg bg-emerald-500/10 p-2">

                                <Brain
                                    size={20}
                                    className="text-emerald-400"
                                />

                            </div>

                            <span className="text-sm font-medium text-emerald-400">
                                VyparMind
                            </span>

                        </div>


                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Recommendation Engine
                        </h1>


                        <p className="mt-2 max-w-2xl text-gray-400">
                            Practical business actions generated from your
                            recent sales, expenses, profit and inventory signals.
                        </p>

                    </div>


                    <button
                        onClick={fetchRecommendations}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition hover:bg-white/[0.06]"
                    >
                        <RefreshCw size={16} />

                        Refresh Analysis
                    </button>

                </div>


                {/* ==============================
                    BUSINESS STATUS
                ============================== */}

                <div
                    className={`mb-8 rounded-2xl border p-6 ${businessStatus.style}`}
                >

                    <div className="flex items-start gap-4">

                        <div className="rounded-xl bg-white/5 p-3">

                            <StatusIcon
                                size={24}
                                className={
                                    businessStatus.text
                                }
                            />

                        </div>


                        <div>

                            <p className="text-xs uppercase tracking-wider text-gray-500">
                                Current Business Status
                            </p>

                            <h2
                                className={`mt-1 text-xl font-semibold ${businessStatus.text}`}
                            >
                                {businessStatus.title}
                            </h2>

                            <p className="mt-2 text-sm text-gray-400">
                                {businessStatus.description}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==============================
                    METRICS
                ============================== */}

                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    <MetricCard
                        title="Revenue"
                        value={formatCurrency(
                            revenue.current
                        )}
                        change={
                            revenue.changePercent
                        }
                        icon={Wallet}
                    />


                    <MetricCard
                        title="Expenses"
                        value={formatCurrency(
                            expenses.current
                        )}
                        change={
                            expenses.changePercent
                        }
                        icon={ArrowUpRight}
                    />


                    <MetricCard
                        title="Gross Profit"
                        value={formatCurrency(
                            profit.grossProfit
                        )}
                        icon={TrendingUp}
                    />


                    <MetricCard
                        title="Net Profit"
                        value={formatCurrency(
                            profit.netProfit
                        )}
                        icon={Target}
                        negative={
                            netProfit < 0
                        }
                    />

                </div>


                {/* ==============================
                    SIGNALS
                ============================== */}

                {signals.length > 0 && (

                    <section className="mb-10">

                        <div className="mb-4">

                            <h2 className="text-xl font-semibold">
                                Business Signals
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Signals detected from your recent business data.
                            </p>

                        </div>


                        <div className="grid gap-4 md:grid-cols-2">

                            {signals.map(
                                (signal, index) => {

                                    const Icon =
                                        getSignalIcon(
                                            signal.type
                                        );


                                    return (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-white/10 bg-[#0B1712] p-5"
                                        >

                                            <div className="flex items-start justify-between gap-4">

                                                <div className="flex items-start gap-3">

                                                    <div className="rounded-xl bg-emerald-500/10 p-3">

                                                        <Icon
                                                            size={20}
                                                            className="text-emerald-400"
                                                        />

                                                    </div>


                                                    <div>

                                                        <h3 className="font-semibold">
                                                            {getSignalTitle(
                                                                signal.type
                                                            )}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {signal.recommendation ||
                                                                "Review this business signal."}
                                                        </p>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        signal.severity ===
                                                        "HIGH"
                                                            ? "bg-red-500/10 text-red-400"
                                                            : signal.severity ===
                                                              "MEDIUM"
                                                            ? "bg-yellow-500/10 text-yellow-400"
                                                            : "bg-blue-500/10 text-blue-400"
                                                    }`}
                                                >
                                                    {signal.severity ||
                                                        "INFO"}
                                                </span>

                                            </div>


                                            {signal.value !==
                                                undefined && (

                                                <div className="mt-4 border-t border-white/5 pt-4">

                                                    <span className="text-xs text-gray-500">
                                                        Signal Value
                                                    </span>

                                                    <p className="mt-1 text-lg font-semibold">
                                                        {typeof signal.value ===
                                                        "number"
                                                            ? signal.type?.includes(
                                                                  "REVENUE"
                                                              ) ||
                                                              signal.type?.includes(
                                                                  "EXPENSE"
                                                              )
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
                                }
                            )}

                        </div>

                    </section>

                )}


                {/* ==============================
                    AI RECOMMENDATIONS
                ============================== */}

                <section>

                    <div className="mb-5 flex items-center gap-3">

                        <div className="rounded-xl bg-emerald-500/10 p-3">

                            <Lightbulb
                                size={22}
                                className="text-emerald-400"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-semibold">
                                AI Action Plan
                            </h2>

                            <p className="text-sm text-gray-500">
                                What VyparMind recommends you review next.
                            </p>

                        </div>

                    </div>


                    {recommendations.length === 0 ? (

                        <div className="rounded-2xl border border-white/10 bg-[#0B1712] p-8 text-center">

                            <Brain
                                size={36}
                                className="mx-auto mb-4 text-gray-600"
                            />

                            <h3 className="font-semibold text-gray-300">
                                No recommendation generated
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                The Recommendation Engine did not return
                                an AI recommendation.
                            </p>

                            <button
                                onClick={fetchRecommendations}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black hover:bg-emerald-400"
                            >
                                <RefreshCw size={16} />

                                Generate Again
                            </button>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {recommendations.map(
                                (recommendation, index) => {

                                    const priority =
                                        getPriorityStyle(
                                            recommendation.priority
                                        );

                                    const PriorityIcon =
                                        priority.icon;


                                    return (
                                        <div
                                            key={index}
                                            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1712]"
                                        >

                                            {/* CARD HEADER */}

                                            <div className="flex flex-col gap-4 border-b border-white/5 p-6 md:flex-row md:items-center md:justify-between">

                                                <div className="flex items-start gap-4">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-400">

                                                        {index + 1}

                                                    </div>


                                                    <div>

                                                        <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                                                            Issue
                                                        </p>

                                                        <h3 className="text-lg font-semibold text-white">
                                                            {recommendation.issue ||
                                                                "Business issue identified"}
                                                        </h3>

                                                    </div>

                                                </div>


                                                <div
                                                    className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${priority.bg} ${priority.border} ${priority.text}`}
                                                >

                                                    <PriorityIcon
                                                        size={14}
                                                    />

                                                    {recommendation.priority ||
                                                        "MEDIUM"}

                                                </div>

                                            </div>


                                            {/* CARD BODY */}

                                            <div className="grid gap-0 md:grid-cols-3">

                                                {/* EVIDENCE */}

                                                <div className="border-b border-white/5 p-6 md:border-b-0 md:border-r">

                                                    <div className="mb-3 flex items-center gap-2">

                                                        <div className="rounded-lg bg-blue-500/10 p-2">

                                                            <TrendingDown
                                                                size={16}
                                                                className="text-blue-400"
                                                            />

                                                        </div>

                                                        <span className="text-sm font-semibold">
                                                            Evidence
                                                        </span>

                                                    </div>


                                                    <p className="text-sm leading-6 text-gray-400">
                                                        {recommendation.evidence ||
                                                            "The recommendation is based on the business signals currently available to VyparMind."}
                                                    </p>

                                                </div>


                                                {/* ACTION */}

                                                <div className="border-b border-white/5 p-6 md:border-b-0 md:border-r">

                                                    <div className="mb-3 flex items-center gap-2">

                                                        <div className="rounded-lg bg-emerald-500/10 p-2">

                                                            <Zap
                                                                size={16}
                                                                className="text-emerald-400"
                                                            />

                                                        </div>

                                                        <span className="text-sm font-semibold">
                                                            Recommended Action
                                                        </span>

                                                    </div>


                                                    <p className="text-sm leading-6 text-gray-300">
                                                        {recommendation.action ||
                                                            "Review the identified issue using the available business data."}
                                                    </p>

                                                </div>


                                                {/* REASON */}

                                                <div className="p-6">

                                                    <div className="mb-3 flex items-center gap-2">

                                                        <div className="rounded-lg bg-yellow-500/10 p-2">

                                                            <Lightbulb
                                                                size={16}
                                                                className="text-yellow-400"
                                                            />

                                                        </div>

                                                        <span className="text-sm font-semibold">
                                                            Why
                                                        </span>

                                                    </div>


                                                    <p className="text-sm leading-6 text-gray-400">
                                                        {recommendation.reason ||
                                                            "This recommendation is intended to help the owner investigate the underlying business signal."}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==============================
                    FOOTER
                ============================== */}

                <div className="mt-10 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5">

                    <Brain
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                        VyparMind generates recommendations from the
                        business evidence available to the system.
                        Recommendations are suggestions for review,
                        not guaranteed outcomes.
                    </p>

                </div>

            </main>

        </div>
    );
};


// ==============================
// METRIC CARD
// ==============================

const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    negative = false,
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


            {change !== undefined && (
                <div className="mt-4 flex items-center gap-2 text-xs">

                    {Number(change) >= 0 ? (
                        <ArrowUpRight
                            size={14}
                            className="text-emerald-400"
                        />
                    ) : (
                        <ArrowDownRight
                            size={14}
                            className="text-red-400"
                        />
                    )}


                    <span
                        className={
                            Number(change) >= 0
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


export default RecommendationEngine;