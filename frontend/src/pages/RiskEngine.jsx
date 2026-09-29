import { useEffect, useMemo, useState } from "react";

import {
    ShieldAlert,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Activity,
    TrendingDown,
    TrendingUp,
    Wallet,
    Package,
    Database,
    Brain,
    Eye,
    Search,
    Sparkles,
    CircleAlert,
} from "lucide-react";

import api from "../api/axios";
import Navbar from "../components/Navbar";

// ============================================================
// FORMATTERS
// ============================================================

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return `₹${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
};

const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
};

// ============================================================
// RISK STYLES
// ============================================================

const getRiskStyle = (severity) => {
    const level = String(severity || "").toUpperCase();

    switch (level) {
        case "CRITICAL":
            return {
                text: "text-red-300",
                bg: "bg-red-500/10",
                border: "border-red-500/25",
                icon: CircleAlert,
            };

        case "HIGH":
            return {
                text: "text-orange-300",
                bg: "bg-orange-500/10",
                border: "border-orange-500/25",
                icon: AlertTriangle,
            };

        case "MEDIUM":
            return {
                text: "text-yellow-300",
                bg: "bg-yellow-500/10",
                border: "border-yellow-500/25",
                icon: AlertTriangle,
            };

        case "LOW":
            return {
                text: "text-emerald-300",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/25",
                icon: CheckCircle2,
            };

        default:
            return {
                text: "text-cyan-300",
                bg: "bg-cyan-500/10",
                border: "border-cyan-500/25",
                icon: Eye,
            };
    }
};

// ============================================================
// RISK TYPE HELPERS
// ============================================================

const formatRiskType = (type) => {
    if (!type) return "Business Risk";

    return String(type)
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getRiskIcon = (type) => {
    const normalized = String(type || "").toLowerCase();

    if (
        normalized.includes("profit") ||
        normalized.includes("sales") ||
        normalized.includes("revenue")
    ) {
        return TrendingDown;
    }

    if (
        normalized.includes("expense") ||
        normalized.includes("cost")
    ) {
        return Wallet;
    }

    if (
        normalized.includes("stock") ||
        normalized.includes("inventory")
    ) {
        return Package;
    }

    if (normalized.includes("growth")) {
        return TrendingUp;
    }

    return ShieldAlert;
};

// ============================================================
// AI SECTION PARSER
// ============================================================

const parseAISections = (text) => {
    if (!text || typeof text !== "string") {
        return [];
    }

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const sections = [];
    let current = null;

    const isHeading = (line) => {
        const clean = line
            .replace(/^#+\s*/, "")
            .replace(/^\d+[\.\):\-]\s*/, "")
            .replace(/\*\*/g, "")
            .replace(/:$/, "")
            .trim();

        if (!clean || clean.length > 100) {
            return false;
        }

        return (
            line.startsWith("#") ||
            /^\d+[\.\):\-]/.test(line) ||
            /^(main|risk|important|possible|what|business|recommended|action|warning|signal|review|summary|explanation)/i.test(
                clean
            )
        );
    };

    lines.forEach((line) => {
        if (isHeading(line)) {
            if (current) {
                sections.push(current);
            }

            const title = line
                .replace(/^#+\s*/, "")
                .replace(/^\d+[\.\):\-]\s*/, "")
                .replace(/\*\*/g, "")
                .replace(/:$/, "")
                .trim();

            current = {
                title,
                items: [],
            };

            return;
        }

        const cleanLine = line
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+[\.\)]\s*/, "")
            .replace(/\*\*/g, "")
            .trim();

        if (!current) {
            current = {
                title: "Risk Analysis",
                items: [],
            };
        }

        current.items.push(cleanLine);
    });

    if (current) {
        sections.push(current);
    }

    return sections;
};

// ============================================================
// SECTION ICON
// ============================================================

const getSectionIcon = (title) => {
    const normalized = String(title || "").toLowerCase();

    if (
        normalized.includes("risk") ||
        normalized.includes("warning")
    ) {
        return ShieldAlert;
    }

    if (
        normalized.includes("signal") ||
        normalized.includes("monitor")
    ) {
        return Activity;
    }

    if (
        normalized.includes("reason") ||
        normalized.includes("cause") ||
        normalized.includes("explanation")
    ) {
        return Search;
    }

    if (
        normalized.includes("action") ||
        normalized.includes("recommend")
    ) {
        return Sparkles;
    }

    if (
        normalized.includes("summary") ||
        normalized.includes("change")
    ) {
        return Brain;
    }

    return Eye;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RiskEngine = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // ========================================================
    // FETCH RISK DATA
    // ========================================================

    const fetchRiskAnalysis = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response = await api.get("/api/risk", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(
                "RISK ENGINE RESPONSE:",
                response.data
            );

            setResult(response.data);
        } catch (err) {
            console.error("Risk Engine Error:", err);

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to load Risk Engine."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRiskAnalysis();
    }, []);

    // ========================================================
    // BACKEND DATA
    // ========================================================

    const riskData = useMemo(() => {
        return result?.riskData || {};
    }, [result]);

    const risks = useMemo(() => {
        return Array.isArray(riskData.risks)
            ? riskData.risks
            : [];
    }, [riskData]);

    const aiText = useMemo(() => {
        return (
            result?.vyparMind?.riskAnalysis || ""
        );
    }, [result]);

    const sections = useMemo(() => {
        return parseAISections(aiText);
    }, [aiText]);

    // ========================================================
    // OVERALL RISK
    // ========================================================

    const overallRisk = useMemo(() => {
        if (!risks.length) {
            return "LOW";
        }

        const severityRank = {
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3,
            CRITICAL: 4,
        };

        const highest = risks.reduce(
            (currentHighest, currentRisk) => {
                const currentRank =
                    severityRank[
                        String(
                            currentRisk.severity
                        ).toUpperCase()
                    ] || 0;

                const highestRank =
                    severityRank[
                        String(
                            currentHighest.severity
                        ).toUpperCase()
                    ] || 0;

                return currentRank > highestRank
                    ? currentRisk
                    : currentHighest;
            },
            risks[0]
        );

        return (
            String(highest.severity || "LOW").toUpperCase()
        );
    }, [risks]);

    const overviewStyle =
        getRiskStyle(overallRisk);

    const OverviewIcon =
        overviewStyle.icon;

    // ========================================================
    // EVIDENCE METRICS
    // ========================================================

    const evidenceMetrics = useMemo(() => {
        const metrics = [];

        // Revenue
        if (riskData.revenue) {
            metrics.push({
                key: "Current Revenue",
                value: riskData.revenue.current,
                type: "currency",
                icon: TrendingUp,
            });

            metrics.push({
                key: "Previous Revenue",
                value: riskData.revenue.previous,
                type: "currency",
                icon: Wallet,
            });

            if (
                riskData.revenue.changePercent !== null &&
                riskData.revenue.changePercent !== undefined
            ) {
                metrics.push({
                    key: "Revenue Change",
                    value:
                        riskData.revenue.changePercent,
                    type: "percent",
                    icon:
                        riskData.revenue.changePercent < 0
                            ? TrendingDown
                            : TrendingUp,
                });
            }
        }

        // Profit
        if (riskData.profit) {
            metrics.push({
                key: "Gross Profit",
                value:
                    riskData.profit.grossProfit,
                type: "currency",
                icon: TrendingUp,
            });

            metrics.push({
                key: "Expenses",
                value:
                    riskData.profit.expenses,
                type: "currency",
                icon: Wallet,
            });

            metrics.push({
                key: "Net Profit",
                value:
                    riskData.profit.netProfit,
                type: "currency",
                icon:
                    riskData.profit.netProfit < 0
                        ? TrendingDown
                        : TrendingUp,
            });
        }

        // Expense change
        if (
            riskData.expenseChangePercent !== null &&
            riskData.expenseChangePercent !== undefined
        ) {
            metrics.push({
                key: "Expense Change",
                value:
                    riskData.expenseChangePercent,
                type: "percent",
                icon: Wallet,
            });
        }

        // Sales count
        if (riskData.salesCount) {
            metrics.push({
                key: "Current Sales",
                value:
                    riskData.salesCount.current,
                type: "number",
                icon: Activity,
            });

            metrics.push({
                key: "Previous Sales",
                value:
                    riskData.salesCount.previous,
                type: "number",
                icon: Database,
            });
        }

        return metrics;
    }, [riskData]);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <main className="mx-auto max-w-7xl px-6 py-12">
                    <div className="animate-pulse space-y-8">
                        <div className="h-10 w-80 rounded-xl bg-white/5" />

                        <div className="h-40 rounded-3xl bg-white/5" />

                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-32 rounded-2xl bg-white/5"
                                />
                            ))}
                        </div>

                        <div className="h-80 rounded-3xl bg-white/5" />
                    </div>
                </main>
            </div>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <main className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center px-6">
                    <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                            <ShieldAlert className="h-8 w-8 text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold">
                            Risk Engine unavailable
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                fetchRiskAnalysis(true)
                            }
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100C] transition hover:bg-emerald-400"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // ========================================================
    // MAIN UI
    // ========================================================

    return (
        <div className="min-h-screen overflow-hidden bg-[#07100D] text-white">
            <Navbar />

            <main className="relative">
                {/* Background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-red-500/5 blur-3xl" />

                    <div className="absolute right-[-100px] top-[400px] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />

                    <div className="absolute left-[40%] top-[700px] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">

                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <section className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/10 bg-red-400/5 px-3 py-1.5 text-xs font-medium text-red-300">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Risk Intelligence Active
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Business Risk
                                <span className="ml-2 text-emerald-400">
                                    Intelligence
                                </span>
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                                VyparMind examines recent business
                                evidence and identifies risk
                                signals that may require your
                                attention.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                fetchRiskAnalysis(true)
                            }
                            disabled={refreshing}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            {refreshing
                                ? "Analyzing..."
                                : "Refresh Analysis"}
                        </button>
                    </section>

                    {/* ==================================================
                        OVERALL RISK
                    ================================================== */}

                    <section
                        className={`relative mb-8 overflow-hidden rounded-3xl border ${overviewStyle.border} ${overviewStyle.bg} p-7`}
                    >
                        <div className="absolute right-[-50px] top-[-80px] h-64 w-64 rounded-full bg-white/[0.02] blur-3xl" />

                        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-5">
                                <div
                                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border ${overviewStyle.border} ${overviewStyle.bg}`}
                                >
                                    <OverviewIcon
                                        className={`h-8 w-8 ${overviewStyle.text}`}
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                        Overall Risk Level
                                    </p>

                                    <h2
                                        className={`mt-1 text-3xl font-bold ${overviewStyle.text}`}
                                    >
                                        {overallRisk}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Based on detected business
                                        risk signals.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-slate-300">
                                <Activity className="h-4 w-4 text-emerald-400" />

                                {risks.length} risk
                                {risks.length === 1
                                    ? ""
                                    : "s"}{" "}
                                detected
                            </div>
                        </div>
                    </section>

                    {/* ==================================================
                        DETECTED RISKS
                    ================================================== */}

                    <section className="mb-10">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
                                    Detected Risks
                                </p>

                                <h2 className="mt-1 text-xl font-bold">
                                    Issues requiring attention
                                </h2>
                            </div>

                            <ShieldAlert className="hidden h-5 w-5 text-red-400 sm:block" />
                        </div>

                        {risks.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                {risks.map((risk, index) => {
                                    const style =
                                        getRiskStyle(
                                            risk.severity
                                        );

                                    const RiskIcon =
                                        getRiskIcon(
                                            risk.type
                                        );

                                    return (
                                        <article
                                            key={`${risk.type}-${index}`}
                                            className={`rounded-3xl border ${style.border} ${style.bg} p-6 transition hover:-translate-y-0.5`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.bg}`}
                                                >
                                                    <RiskIcon
                                                        className={`h-6 w-6 ${style.text}`}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-slate-100">
                                                            {formatRiskType(
                                                                risk.type
                                                            )}
                                                        </h3>

                                                        <span
                                                            className={`rounded-full border ${style.border} ${style.bg} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.text}`}
                                                        >
                                                            {
                                                                risk.severity
                                                            }
                                                        </span>
                                                    </div>

                                                    <p className="mt-3 text-sm leading-6 text-slate-300">
                                                        {
                                                            risk.message
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Detected Value */}
                                            {risk.value !==
                                                undefined && (
                                                <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Detected Value
                                                    </p>

                                                    <p
                                                        className={`mt-1 text-2xl font-bold ${style.text}`}
                                                    >
                                                        {String(
                                                            risk.type
                                                        ).toUpperCase() ===
                                                        "NEGATIVE_PROFIT"
                                                            ? formatCurrency(
                                                                  risk.value
                                                              )
                                                            : formatNumber(
                                                                  risk.value
                                                              )}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Count */}
                                            {risk.count !==
                                                undefined && (
                                                <div className="mt-5 rounded-2xl border border-white/5 bg-black/10 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Affected Items
                                                    </p>

                                                    <p
                                                        className={`mt-1 text-2xl font-bold ${style.text}`}
                                                    >
                                                        {formatNumber(
                                                            risk.count
                                                        )}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Affected Products */}
                                            {Array.isArray(
                                                risk.products
                                            ) &&
                                                risk.products
                                                    .length >
                                                    0 && (
                                                    <div className="mt-5 space-y-2">
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Affected
                                                            Products
                                                        </p>

                                                        {risk.products.map(
                                                            (
                                                                product,
                                                                productIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        productIndex
                                                                    }
                                                                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 px-3 py-2.5"
                                                                >
                                                                    <span className="text-sm text-slate-300">
                                                                        {
                                                                            product.productName
                                                                        }
                                                                    </span>

                                                                    <span className="text-xs text-slate-500">
                                                                        Stock:{" "}
                                                                        {
                                                                            product.stock
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            No significant risks detected
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-400">
                                            VyparMind did not detect
                                            any configured risk
                                            signals for the current
                                            analysis period.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ==================================================
                        BUSINESS EVIDENCE
                    ================================================== */}

                    {evidenceMetrics.length > 0 && (
                        <section className="mb-10">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                                        Business Evidence
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold">
                                        Numbers behind the risk signals
                                    </h2>
                                </div>

                                <Database className="hidden h-5 w-5 text-slate-600 sm:block" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {evidenceMetrics.map(
                                    (metric, index) => {
                                        const MetricIcon =
                                            metric.icon;

                                        const numericValue =
                                            Number(
                                                metric.value
                                            );

                                        const negative =
                                            !Number.isNaN(
                                                numericValue
                                            ) &&
                                            numericValue < 0;

                                        return (
                                            <div
                                                key={`${metric.key}-${index}`}
                                                className={`rounded-2xl border ${
                                                    negative
                                                        ? "border-red-500/20"
                                                        : "border-white/10"
                                                } bg-white/[0.025] p-5`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            {
                                                                metric.key
                                                            }
                                                        </p>

                                                        <p
                                                            className={`mt-2 text-xl font-bold ${
                                                                negative
                                                                    ? "text-red-400"
                                                                    : "text-slate-100"
                                                            }`}
                                                        >
                                                            {metric.type ===
                                                            "currency"
                                                                ? formatCurrency(
                                                                      metric.value
                                                                  )
                                                                : metric.type ===
                                                                  "percent"
                                                                ? `${formatNumber(
                                                                      metric.value
                                                                  )}%`
                                                                : formatNumber(
                                                                      metric.value
                                                                  )}
                                                        </p>
                                                    </div>

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                                                        <MetricIcon
                                                            className={`h-5 w-5 ${
                                                                negative
                                                                    ? "text-red-400"
                                                                    : "text-emerald-400"
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </section>
                    )}

                    {/* ==================================================
                        AI RISK EXPLANATION
                    ================================================== */}

                    <section>
                        <div className="mb-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                                VyparMind Risk Analysis
                            </p>

                            <h2 className="mt-1 text-xl font-bold">
                                Why these risks matter
                            </h2>
                        </div>

                        {sections.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                {sections.map(
                                    (section, index) => {
                                        const Icon =
                                            getSectionIcon(
                                                section.title
                                            );

                                        return (
                                            <article
                                                key={`${section.title}-${index}`}
                                                className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:bg-white/[0.04]"
                                            >
                                                <div className="mb-5 flex items-start gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                                                        <Icon className="h-5 w-5 text-cyan-400" />
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold text-slate-100">
                                                            {
                                                                section.title
                                                            }
                                                        </h3>

                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            VyparMind
                                                            evidence-based
                                                            analysis
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {section.items.map(
                                                        (
                                                            item,
                                                            itemIndex
                                                        ) => (
                                                            <div
                                                                key={
                                                                    itemIndex
                                                                }
                                                                className="flex gap-3"
                                                            >
                                                                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />

                                                                <p className="text-sm leading-6 text-slate-300">
                                                                    {
                                                                        item
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                                        <Brain className="h-6 w-6 text-cyan-400" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold">
                                            Risk analysis
                                        </h3>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                                            {aiText ||
                                                "No AI risk explanation was returned by the Risk Engine."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-600 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Risk Engine
                        </div>

                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                            Powered by VyparMind AI
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RiskEngine;