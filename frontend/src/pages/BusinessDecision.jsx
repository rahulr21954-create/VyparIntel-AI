import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Brain,
    CheckCircle2,
    CircleAlert,
    Clock3,
    Lightbulb,
    RefreshCw,
    Search,
    ShieldAlert,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    XCircle,
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

const formatPercent = (value) => {
    const number = Number(value || 0);

    return `${number >= 0 ? "+" : ""}${number.toFixed(1)}%`;
};

const priorityConfig = {
    HIGH: {
        label: "High Priority",
        className:
            "border-red-400/20 bg-red-400/10 text-red-300",
        icon: CircleAlert,
    },

    MEDIUM: {
        label: "Medium Priority",
        className:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",
        icon: Clock3,
    },

    LOW: {
        label: "Low Priority",
        className:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        icon: CheckCircle2,
    },
};

const statusConfig = {
    HEALTHY: {
        label: "Business looks stable",
        className:
            "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        icon: CheckCircle2,
    },

    NEEDS_ATTENTION: {
        label: "Business needs attention",
        className:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",
        icon: AlertTriangle,
    },

    CRITICAL: {
        label: "Immediate attention required",
        className:
            "border-red-400/20 bg-red-400/10 text-red-300",
        icon: ShieldAlert,
    },
};

function MetricCard({
    title,
    value,
    change,
    positiveIsGood = true,
    icon: Icon,
}) {
    const number = Number(change || 0);

    const isPositive = number >= 0;

    const trendIsGood = positiveIsGood
        ? isPositive
        : !isPositive;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {title}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                    <Icon className="h-4 w-4 text-emerald-300" />
                </div>
            </div>

            <p className="mt-4 text-2xl font-bold text-white">
                {value}
            </p>

            <div
                className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                    trendIsGood
                        ? "text-emerald-300"
                        : "text-red-300"
                }`}
            >
                {isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                )}

                {formatPercent(number)} vs previous period
            </div>
        </div>
    );
}

function SectionHeader({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
                <Icon className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
                <h2 className="text-xl font-bold text-white">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function PriorityBadge({ priority }) {
    const config =
        priorityConfig[priority] ||
        priorityConfig.MEDIUM;

    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}

export default function BusinessDecision() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [data, setData] = useState(null);

    const fetchDecision = useCallback(
        async (refresh = false) => {
            try {
                setError("");

                if (refresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    navigate("/login", {
                        replace: true,
                    });
                    return;
                }

                const response = await api.get(
                    "/api/business-ai/decision",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data?.success) {
                    setData(response.data);
                } else {
                    setError(
                        response.data?.message ||
                            "Unable to generate business decision."
                    );
                }
            } catch (err) {
                console.error(
                    "Business Decision Error:",
                    err
                );

                if (
                    err.response?.status === 401
                ) {
                    localStorage.removeItem("token");

                    navigate("/login", {
                        replace: true,
                    });

                    return;
                }

                setError(
                    err.response?.data?.message ||
                        "VyparMind could not generate the business decision."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [navigate]
    );

    useEffect(() => {
        fetchDecision();
    }, [fetchDecision]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#06100d] text-white">
                <Navbar />

                <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-64 rounded-[2rem] border border-white/10 bg-white/[0.03]" />

                        <div className="grid gap-4 md:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-36 rounded-2xl border border-white/10 bg-white/[0.03]"
                                />
                            ))}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {[1, 2].map((item) => (
                                <div
                                    key={item}
                                    className="h-72 rounded-3xl border border-white/10 bg-white/[0.03]"
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#06100d] text-white">
                <Navbar />

                <main className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6">
                    <div className="rounded-3xl border border-red-400/20 bg-red-400/[0.06] p-8 text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-400" />

                        <h1 className="mt-4 text-2xl font-bold">
                            VyparMind could not analyze your business
                        </h1>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                fetchDecision(true)
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const businessData =
        data?.businessData || {};

    const decision = data?.decision || {};

    const revenue =
        businessData.revenue || {};

    const expenses =
        businessData.expenses || {};

    const profit =
        businessData.profit || {};

    const inventory =
        businessData.inventory || {};

    const status =
        statusConfig[
            decision.businessStatus
        ] || statusConfig.NEEDS_ATTENTION;

    const StatusIcon = status.icon;

    const whatHappened =
        Array.isArray(decision.whatHappened)
            ? decision.whatHappened
            : [];

    const whyItHappened =
        Array.isArray(decision.whyItHappened)
            ? decision.whyItHappened
            : [];

    const risks =
        Array.isArray(decision.risks)
            ? decision.risks
            : [];

    const recommendedActions =
        Array.isArray(
            decision.recommendedActions
        )
            ? decision.recommendedActions
            : [];

    const investigateNext =
        Array.isArray(decision.investigateNext)
            ? decision.investigateNext
            : [];

    return (
        <div className="min-h-screen bg-[#06100d] text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
                {/* HERO */}
                <section className="relative overflow-hidden rounded-[2rem] border border-emerald-400/10 bg-gradient-to-br from-emerald-500/[0.13] via-white/[0.025] to-transparent p-6 sm:p-8 lg:p-10">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/[0.04] blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
                                <Brain className="h-4 w-4" />
                                VYPARMIND BUSINESS DECISION AI
                            </div>

                            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Don't just know.
                                <span className="block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                                    Understand your business.
                                </span>
                            </h1>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                                VyparMind analyzes your actual business
                                data to explain what changed, why it
                                changed, what risks exist, and what you
                                should investigate next.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                                >
                                    <StatusIcon className="h-4 w-4" />
                                    {status.label}
                                </span>

                                <span className="text-xs text-slate-500">
                                    Last 30 days vs previous 30 days
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                fetchDecision(true)
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/20 hover:bg-white/[0.08]"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            Refresh Intelligence
                        </button>
                    </div>
                </section>

                {/* HEADLINE */}
                <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10">
                            <Sparkles className="h-6 w-6 text-emerald-300" />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                                VyparMind's conclusion
                            </p>

                            <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                                {decision.headline ||
                                    "Your business intelligence is ready."}
                            </h2>
                        </div>
                    </div>
                </section>

                {/* BUSINESS SNAPSHOT */}
                <section className="mt-8">
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold">
                            Business Snapshot
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            The numbers behind the AI's reasoning.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <MetricCard
                            title="Revenue"
                            value={formatCurrency(
                                revenue.current
                            )}
                            change={
                                revenue.changePercent
                            }
                            icon={TrendingUp}
                        />

                        <MetricCard
                            title="Expenses"
                            value={formatCurrency(
                                expenses.current
                            )}
                            change={
                                expenses.changePercent
                            }
                            positiveIsGood={false}
                            icon={Activity}
                        />

                        <MetricCard
                            title="Net Profit"
                            value={formatCurrency(
                                profit.current
                            )}
                            change={
                                profit.changePercent
                            }
                            icon={Target}
                        />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                            <p className="text-xs text-slate-500">
                                Sales
                            </p>

                            <p className="mt-2 text-lg font-bold">
                                {businessData.sales
                                    ?.currentCount || 0}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                transactions
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                            <p className="text-xs text-slate-500">
                                Low Stock
                            </p>

                            <p className="mt-2 text-lg font-bold text-amber-300">
                                {inventory.lowStockCount ||
                                    0}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                products need attention
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                            <p className="text-xs text-slate-500">
                                Out of Stock
                            </p>

                            <p className="mt-2 text-lg font-bold text-red-300">
                                {inventory.outOfStockCount ||
                                    0}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                products unavailable
                            </p>
                        </div>
                    </div>
                </section>

                {/* WHAT + WHY */}
                <section className="mt-10 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-7">
                        <SectionHeader
                            icon={TrendingDown}
                            title="What Happened?"
                            description="The important changes detected in your business."
                        />

                        <div className="space-y-4">
                            {whatHappened.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-500">
                                    No major changes were detected from
                                    the available evidence.
                                </div>
                            ) : (
                                whatHappened.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-white/10 bg-black/10 p-4"
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-xs font-bold text-emerald-300">
                                                    {index + 1}
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold">
                                                        {item.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                                        {
                                                            item.description
                                                        }
                                                    </p>

                                                    {item.evidence && (
                                                        <p className="mt-2 text-xs leading-5 text-slate-600">
                                                            Evidence:{" "}
                                                            {
                                                                item.evidence
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-7">
                        <SectionHeader
                            icon={Search}
                            title="Why Did It Happen?"
                            description="Evidence-based explanations from your business data."
                        />

                        <div className="space-y-4">
                            {whyItHappened.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-500">
                                    VyparMind could not determine a
                                    strong cause from the available
                                    data.
                                </div>
                            ) : (
                                whyItHappened.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border border-white/10 bg-black/10 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                                                        <Search className="h-4 w-4 text-cyan-300" />
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {
                                                                item.reason
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-sm leading-6 text-slate-400">
                                                            {
                                                                item.evidence
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {item.confidence && (
                                                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        {
                                                            item.confidence
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* RISKS */}
                <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-7">
                    <SectionHeader
                        icon={ShieldAlert}
                        title="What Could Go Wrong?"
                        description="Potential business risks supported by the current evidence."
                    />

                    {risks.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-5 text-sm text-slate-400">
                            No significant risks were identified from
                            the available business data.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {risks.map((risk, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-red-400/10 bg-red-400/[0.035] p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

                                            <div>
                                                <h3 className="font-semibold">
                                                    {risk.risk}
                                                </h3>

                                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                                    {
                                                        risk.evidence
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <PriorityBadge
                                            priority={
                                                risk.priority
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ACTIONS */}
                <section className="mt-8 rounded-3xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.07] to-transparent p-6 sm:p-7">
                    <SectionHeader
                        icon={Zap}
                        title="What Should You Do Next?"
                        description="Practical actions generated from the evidence."
                    />

                    {recommendedActions.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-slate-500">
                            No specific actions were generated.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recommendedActions.map(
                                (action, index) => (
                                    <div
                                        key={index}
                                        className="group rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:border-emerald-400/20 hover:bg-black/20"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-sm font-bold text-emerald-300">
                                                    {index + 1}
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {
                                                            action.action
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                                        {
                                                            action.reason
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <PriorityBadge
                                                    priority={
                                                        action.priority
                                                    }
                                                />

                                                <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </section>

                {/* INVESTIGATE NEXT */}
                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-7">
                        <SectionHeader
                            icon={Lightbulb}
                            title="Investigate Next"
                            description="Questions where more evidence could improve the decision."
                        />

                        {investigateNext.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                No additional investigation was
                                suggested.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {investigateNext.map(
                                    (question, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-4"
                                        >
                                            <Search className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />

                                            <p className="text-sm leading-6 text-slate-400">
                                                {question}
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.04] p-6 sm:p-7">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

                        <div className="relative">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10">
                                <Brain className="h-5 w-5 text-emerald-300" />
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
                                This is VyparMind's core idea.
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-400">
                                Traditional business software tells
                                you what happened. VyparMind connects
                                the evidence to explain why it happened
                                and helps you identify what deserves
                                attention next.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                {[
                                    "Observe",
                                    "Understand",
                                    "Detect",
                                    "Recommend",
                                    "Act",
                                ].map(
                                    (step, index) => (
                                        <div
                                            key={step}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-emerald-300">
                                                {step}
                                            </span>

                                            {index <
                                                4 && (
                                                <ArrowRight className="h-3.5 w-3.5 text-emerald-400/40" />
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}