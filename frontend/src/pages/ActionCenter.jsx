import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    CircleAlert,
    Clock3,
    Lightbulb,
    RefreshCw,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    X,
    Zap,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const getTokenConfig = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

const priorityConfig = {
    HIGH: {
        label: "High Priority",
        className: "border-red-500/20 bg-red-500/10 text-red-300",
        icon: CircleAlert,
    },
    MEDIUM: {
        label: "Medium Priority",
        className: "border-amber-500/20 bg-amber-500/10 text-amber-300",
        icon: Clock3,
    },
    LOW: {
        label: "Low Priority",
        className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        icon: CheckCircle2,
    },
};

const engineMeta = {
    risk: {
        source: "Risk Engine",
        title: "Review business risks",
        description:
            "VyparMind has detected risk signals that may need attention.",
        priority: "HIGH",
        route: "/risk",
        icon: ShieldAlert,
    },

    recommendation: {
        source: "Recommendation Engine",
        title: "Review recommended actions",
        description:
            "VyparMind has generated actions based on your recent business data.",
        priority: "MEDIUM",
        route: "/recommendations",
        icon: Lightbulb,
    },

    why: {
        source: "Why Engine",
        title: "Investigate a business change",
        description:
            "Understand the evidence behind important changes in your business.",
        priority: "MEDIUM",
        route: "/why",
        icon: Target,
    },

    morning: {
        source: "Morning Brief",
        title: "Review today's business priorities",
        description:
            "Your latest business intelligence is ready for review.",
        priority: "LOW",
        route: "/morning-brief",
        icon: Sparkles,
    },
};

function extractText(value) {
    if (!value) return "";

    if (typeof value === "string") {
        return value.trim();
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => extractText(item))
            .filter(Boolean)
            .join(" ");
    }

    if (typeof value === "object") {
        return Object.values(value)
            .map((item) => extractText(item))
            .filter(Boolean)
            .join(" ");
    }

    return String(value);
}

function extractFirstUsefulText(data) {
    const candidates = [
        data?.vyparMind?.riskAnalysis,
        data?.vyparMind?.recommendations,
        data?.vyparMind?.whyAnalysis,
        data?.vyparMind?.morningBrief,
    ];

    for (const candidate of candidates) {
        const text = extractText(candidate);

        if (text) {
            return text;
        }
    }

    return "";
}

function createAction({
    id,
    type,
    title,
    description,
    priority,
    evidence,
}) {
    const meta = engineMeta[type];

    return {
        id,
        type,
        source: meta.source,
        title: title || meta.title,
        description: description || meta.description,
        priority: priority || meta.priority,
        route: meta.route,
        icon: meta.icon,
        evidence: evidence || "",
    };
}

function ActionCard({ action, onComplete, onOpen }) {
    const config =
        priorityConfig[action.priority] || priorityConfig.MEDIUM;

    const PriorityIcon = config.icon;
    const ActionIcon = action.icon || Zap;

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.055]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl transition group-hover:bg-emerald-400/10" />

            <div className="relative">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10">
                        <ActionIcon className="h-5 w-5 text-emerald-300" />
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
                    >
                        <PriorityIcon className="h-3.5 w-3.5" />
                        {config.label}
                    </span>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                    {action.source}
                </p>

                <h3 className="mt-2 text-lg font-semibold text-white">
                    {action.title}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                    {action.description}
                </p>

                {action.evidence && (
                    <div className="mt-4 rounded-xl border border-white/5 bg-black/10 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-slate-600">
                            AI Evidence
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {action.evidence}
                        </p>
                    </div>
                )}

                <div className="mt-5 flex gap-2">
                    <button
                        onClick={() => onOpen(action)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    >
                        Take Action
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => onComplete(action.id)}
                        title="Mark complete"
                        className="rounded-xl border border-white/10 px-3 text-slate-400 transition hover:border-emerald-400/20 hover:text-emerald-300"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ActionCenter() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [morningData, setMorningData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);
    const [whyData, setWhyData] = useState(null);

    const [completed, setCompleted] = useState([]);
    const [selectedAction, setSelectedAction] = useState(null);

    const fetchIntelligence = useCallback(
        async (refresh = false) => {
            try {
                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login", { replace: true });
                    return;
                }

                const config = getTokenConfig();

                const results = await Promise.allSettled([
                    api.get("/api/morning-brief", config),
                    api.get("/api/risk", config),
                    api.get("/api/recommendations", config),
                    api.get("/api/why", config),
                ]);

                const [
                    morningResult,
                    riskResult,
                    recommendationResult,
                    whyResult,
                ] = results;

                if (morningResult.status === "fulfilled") {
                    setMorningData(morningResult.value.data);
                }

                if (riskResult.status === "fulfilled") {
                    setRiskData(riskResult.value.data);
                }

                if (recommendationResult.status === "fulfilled") {
                    setRecommendationData(
                        recommendationResult.value.data
                    );
                }

                if (whyResult.status === "fulfilled") {
                    setWhyData(whyResult.value.data);
                }

                const unauthorized = results.some(
                    (result) =>
                        result.status === "rejected" &&
                        result.reason?.response?.status === 401
                );

                if (unauthorized) {
                    localStorage.removeItem("token");
                    navigate("/login", { replace: true });
                }
            } catch (error) {
                console.error(
                    "Action Center intelligence error:",
                    error
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [navigate]
    );

    useEffect(() => {
        fetchIntelligence();
    }, [fetchIntelligence]);

    const actions = useMemo(() => {
        const generated = [];

        /*
         * RISK
         */
        if (riskData?.success) {
            const evidence =
                extractFirstUsefulText(riskData) ||
                "Risk Engine analysis is available.";

            generated.push(
                createAction({
                    id: "risk-engine",
                    type: "risk",
                    title: "Review your current risk signals",
                    description:
                        "VyparMind has analyzed your business for signals that could require attention.",
                    priority: "HIGH",
                    evidence,
                })
            );
        }

        /*
         * RECOMMENDATIONS
         */
        if (recommendationData?.success) {
            const evidence =
                extractFirstUsefulText(recommendationData) ||
                "Recommendation Engine has generated new recommendations.";

            generated.push(
                createAction({
                    id: "recommendation-engine",
                    type: "recommendation",
                    title: "Review VyparMind recommendations",
                    description:
                        "Your business data has produced actionable recommendations for the next decisions.",
                    priority: "MEDIUM",
                    evidence,
                })
            );
        }

        /*
         * WHY ENGINE
         */
        if (whyData?.success) {
            const evidence =
                extractFirstUsefulText(whyData) ||
                "Why Engine analysis is available.";

            generated.push(
                createAction({
                    id: "why-engine",
                    type: "why",
                    title: "Investigate what changed",
                    description:
                        "VyparMind can explain the evidence behind recent revenue, expense and inventory movements.",
                    priority: "MEDIUM",
                    evidence,
                })
            );
        }

        /*
         * MORNING BRIEF
         */
        if (morningData?.success) {
            const evidence =
                extractFirstUsefulText(morningData) ||
                "Your latest business brief is available.";

            generated.push(
                createAction({
                    id: "morning-brief",
                    type: "morning",
                    title: "Review today's business priorities",
                    description:
                        "Start with the latest snapshot of your business and the issues that deserve attention.",
                    priority: "LOW",
                    evidence,
                })
            );
        }

        /*
         * BUSINESS SIGNAL BASED ACTIONS
         */
        const brief = morningData?.briefData;

        const revenueChange = Number(
            brief?.revenue?.changePercent || 0
        );

        const expenseChange = Number(
            brief?.expenses?.changePercent || 0
        );

        const lowStock = Number(
            brief?.inventory?.lowStockCount || 0
        );

        if (revenueChange < -10) {
            generated.unshift(
                createAction({
                    id: "revenue-decline",
                    type: "why",
                    title: "Investigate revenue decline",
                    description:
                        "Revenue is showing a significant negative movement compared with the previous period.",
                    priority: "HIGH",
                    evidence: `Revenue changed by ${revenueChange.toFixed(
                        1
                    )}% compared with the previous period.`,
                })
            );
        }

        if (expenseChange > 15) {
            generated.unshift(
                createAction({
                    id: "expense-spike",
                    type: "risk",
                    title: "Investigate rising expenses",
                    description:
                        "Expenses are increasing faster than usual. Review the underlying categories before they reduce profitability.",
                    priority: "HIGH",
                    evidence: `Expenses changed by +${expenseChange.toFixed(
                        1
                    )}% compared with the previous period.`,
                })
            );
        }

        if (lowStock > 0) {
            generated.push(
                createAction({
                    id: "inventory-risk",
                    type: "recommendation",
                    title: "Review low-stock products",
                    description:
                        "Some products are approaching low stock. Review inventory before potential stock-outs affect sales.",
                    priority: lowStock >= 5 ? "HIGH" : "MEDIUM",
                    evidence: `${lowStock} product${
                        lowStock === 1 ? "" : "s"
                    } currently require stock attention.`,
                })
            );
        }

        return generated;
    }, [
        morningData,
        riskData,
        recommendationData,
        whyData,
    ]);

    const activeActions = useMemo(
        () =>
            actions.filter(
                (action) => !completed.includes(action.id)
            ),
        [actions, completed]
    );

    const highPriorityCount = activeActions.filter(
        (action) => action.priority === "HIGH"
    ).length;

    const brief = morningData?.briefData;

    const revenueChange = Number(
        brief?.revenue?.changePercent || 0
    );

    const expenseChange = Number(
        brief?.expenses?.changePercent || 0
    );

    const profit = Number(
        brief?.profit?.netProfit || 0
    );

    const lowStock = Number(
        brief?.inventory?.lowStockCount || 0
    );

    const completeAction = (id) => {
        setCompleted((previous) => [...previous, id]);
    };

    const openAction = (action) => {
        if (action.route) {
            navigate(action.route);
        }
    };

    return (
        <div className="min-h-screen bg-[#06100d] text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/10 bg-gradient-to-br from-emerald-500/[0.12] via-white/[0.025] to-transparent p-6 sm:p-8 lg:p-10">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                <Brain className="h-4 w-4" />
                                VYPARMIND ACTION CENTER
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Don't just know.
                                <span className="block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                                    Take action.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                                VyparIntel continuously connects your
                                business signals with the AI engines that
                                explain, detect and recommend what deserves
                                your attention.
                            </p>
                        </div>

                        <button
                            onClick={() => fetchIntelligence(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/20 hover:bg-white/[0.08]"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />
                            Refresh Intelligence
                        </button>
                    </div>
                </section>

                {/* SIGNALS */}
                <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Revenue Trend
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            {revenueChange >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-400" />
                            )}

                            <span className="text-xl font-bold">
                                {revenueChange >= 0 ? "+" : ""}
                                {revenueChange.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Expense Trend
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            {expenseChange <= 0 ? (
                                <TrendingDown className="h-5 w-5 text-emerald-400" />
                            ) : (
                                <TrendingUp className="h-5 w-5 text-amber-400" />
                            )}

                            <span className="text-xl font-bold">
                                {expenseChange >= 0 ? "+" : ""}
                                {expenseChange.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Net Profit
                        </p>

                        <p className="mt-2 text-xl font-bold text-emerald-300">
                            {formatCurrency(profit)}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Actions
                        </p>

                        <p className="mt-2 text-xl font-bold">
                            {activeActions.length}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            {highPriorityCount} high priority
                        </p>
                    </div>
                </section>

                {/* ACTION QUEUE */}
                <section className="mt-10">
                    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold">
                                    Your Action Queue
                                </h2>

                                {highPriorityCount > 0 && (
                                    <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300">
                                        {highPriorityCount} urgent
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Generated from your existing VyparIntel AI
                                intelligence.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Zap className="h-4 w-4 text-emerald-400" />
                            Live business intelligence
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-5 md:grid-cols-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]"
                                />
                            ))}
                        </div>
                    ) : activeActions.length === 0 ? (
                        <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.06] p-10 text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />

                            <h3 className="mt-4 text-xl font-semibold">
                                Your action queue is clear
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                VyparMind currently has no unreviewed actions.
                                Refresh intelligence whenever you want a new
                                analysis.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            {activeActions.map((action) => (
                                <ActionCard
                                    key={action.id}
                                    action={action}
                                    onComplete={completeAction}
                                    onOpen={setSelectedAction}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* INTELLIGENCE PIPELINE */}
                <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10">
                            <Sparkles className="h-5 w-5 text-emerald-300" />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                VyparIntel Intelligence Loop
                            </h2>

                            <p className="text-sm text-slate-500">
                                Your business data becomes a decision workflow.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 grid gap-3 md:grid-cols-5">
                        {[
                            ["01", "Observe", "Business data"],
                            ["02", "Understand", "Why it changed"],
                            ["03", "Detect", "Risk & opportunity"],
                            ["04", "Recommend", "Next action"],
                            ["05", "Act", "Owner decision"],
                        ].map(([number, title, description], index) => (
                            <div
                                key={number}
                                className="relative rounded-2xl border border-white/10 bg-black/10 p-4"
                            >
                                <span className="text-xs font-bold text-emerald-400">
                                    {number}
                                </span>

                                <h3 className="mt-2 font-semibold">
                                    {title}
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {description}
                                </p>

                                {index < 4 && (
                                    <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-emerald-400/50 md:block">
                                        →
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* ACTION DETAIL */}
            {selectedAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1713] p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-emerald-300">
                                    {selectedAction.source}
                                </p>

                                <h2 className="mt-2 text-xl font-bold">
                                    {selectedAction.title}
                                </h2>
                            </div>

                            <button
                                onClick={() => setSelectedAction(null)}
                                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mt-5 text-sm leading-7 text-slate-400">
                            {selectedAction.description}
                        </p>

                        {selectedAction.evidence && (
                            <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                    Intelligence behind this action
                                </p>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {selectedAction.evidence}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                const action = selectedAction;

                                setSelectedAction(null);
                                openAction(action);
                            }}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
                        >
                            Open {selectedAction.source}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}