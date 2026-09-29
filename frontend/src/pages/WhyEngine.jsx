import { useEffect, useMemo, useState } from "react";

import {
    Brain,
    RefreshCw,
    AlertCircle,
    Lightbulb,
    TrendingDown,
    TrendingUp,
    Activity,
    Sparkles,
    ShieldAlert,
    Database,
    CheckCircle2,
    CircleDollarSign,
    Wallet,
    Package,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Search,
} from "lucide-react";

import api from "../api/axios";
import Navbar from "../components/Navbar";

// ============================================================
// FORMATTERS
// ============================================================

const formatCurrency = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(number);
};

const formatNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return new Intl.NumberFormat("en-IN").format(number);
};

const formatPercent = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "No comparison";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return `${number > 0 ? "+" : ""}${number}%`;
};

const formatLabel = (value) => {
    return String(value)
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        )
        .trim();
};

// ============================================================
// API RESPONSE EXTRACTION
// ============================================================

const getEvidence = (result) => {
    return result?.evidence || {};
};

const getAIExplanation = (result) => {
    return (
        result?.vyparMind?.whyAnalysis ||
        ""
    );
};

// ============================================================
// AI TEXT PARSER
// ============================================================

const normalizeText = (text) => {
    return String(text)
        .toLowerCase()
        .replace(/[*#:_]/g, " ")
        .replace(/^\d+\s*[.)-]?\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
};

const getSectionType = (heading) => {
    const text = normalizeText(heading);

    if (
        text.includes("main change") ||
        text.includes("business summary") ||
        text.includes("what is happening")
    ) {
        return "main";
    }

    if (
        text.includes("evidence based reasons") ||
        text.includes("evidence based reason") ||
        text.includes("why it may be happening") ||
        text.includes("why this is happening") ||
        text.includes("possible explanation") ||
        text.includes("reasons")
    ) {
        return "why";
    }

    if (
        text.includes("important signals") ||
        text.includes("important signal") ||
        text === "signals"
    ) {
        return "signals";
    }

    if (
        text.includes("possible risks") ||
        text.includes("possible risk") ||
        text === "risks" ||
        text === "risk"
    ) {
        return "risk";
    }

    if (
        text.includes("business owner should review") ||
        text.includes("what to review") ||
        text.includes("recommended actions") ||
        text.includes("recommended action")
    ) {
        return "review";
    }

    return "other";
};

const cleanLine = (line) => {
    return String(line)
        .replace(/^\s*[-•]\s*/, "")
        .replace(/^\s*\d+\s*[.)-]\s*/, "")
        .replace(/\*\*/g, "")
        .trim();
};

const parseAISections = (text) => {
    if (!text) {
        return [];
    }

    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const sections = [];

    let current = null;

    for (const rawLine of lines) {
        const normalized = normalizeText(rawLine);

        const sectionType =
            getSectionType(normalized);

        const looksLikeHeading =
            [
                "main",
                "why",
                "signals",
                "risk",
                "review",
            ].includes(sectionType);

        if (looksLikeHeading) {
            if (
                current &&
                current.content.length > 0
            ) {
                sections.push(current);
            }

            current = {
                title: cleanLine(rawLine),
                type: sectionType,
                content: [],
            };

            continue;
        }

        if (!current) {
            current = {
                title: "VyparMind Explanation",
                type: "other",
                content: [],
            };
        }

        const cleaned = cleanLine(rawLine);

        if (cleaned) {
            current.content.push(cleaned);
        }
    }

    if (
        current &&
        current.content.length > 0
    ) {
        sections.push(current);
    }

    return sections;
};

// ============================================================
// SECTION ICON
// ============================================================

const SectionIcon = ({ type }) => {
    if (type === "main") {
        return (
            <Activity
                size={21}
                className="text-emerald-300"
            />
        );
    }

    if (type === "why") {
        return (
            <Lightbulb
                size={21}
                className="text-amber-300"
            />
        );
    }

    if (type === "signals") {
        return (
            <TrendingUp
                size={21}
                className="text-cyan-300"
            />
        );
    }

    if (type === "risk") {
        return (
            <ShieldAlert
                size={21}
                className="text-red-400"
            />
        );
    }

    if (type === "review") {
        return (
            <CheckCircle2
                size={21}
                className="text-emerald-300"
            />
        );
    }

    return (
        <Sparkles
            size={21}
            className="text-emerald-300"
        />
    );
};

// ============================================================
// AI SECTION CARD
// ============================================================

const AISection = ({ section }) => {
    const isRisk = section.type === "risk";
    const isWhy = section.type === "why";
    const isMain = section.type === "main";

    return (
        <section
            className={`overflow-hidden rounded-3xl border ${
                isRisk
                    ? "border-red-500/20 bg-red-500/[0.025]"
                    : isWhy
                    ? "border-amber-400/20 bg-amber-400/[0.025]"
                    : isMain
                    ? "border-emerald-400/20 bg-emerald-400/[0.025]"
                    : "border-white/10 bg-[#0B1712]"
            }`}
        >
            <div className="border-b border-white/5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div
                        className={`rounded-xl p-3 ${
                            isRisk
                                ? "bg-red-500/10"
                                : isWhy
                                ? "bg-amber-400/10"
                                : "bg-emerald-400/10"
                        }`}
                    >
                        <SectionIcon
                            type={section.type}
                        />
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            VyparMind Analysis
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-white">
                            {cleanLine(section.title)}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="space-y-3 p-5 sm:p-6">
                {section.content.map(
                    (item, index) => (
                        <div
                            key={index}
                            className={`flex gap-4 rounded-2xl border p-4 ${
                                isRisk
                                    ? "border-red-500/10 bg-red-500/5"
                                    : isWhy
                                    ? "border-amber-400/10 bg-amber-400/5"
                                    : "border-white/5 bg-[#0D1C15]"
                            }`}
                        >
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    isRisk
                                        ? "bg-red-500/10 text-red-400"
                                        : isWhy
                                        ? "bg-amber-400/10 text-amber-300"
                                        : "bg-emerald-400/10 text-emerald-300"
                                }`}
                            >
                                {isRisk ? (
                                    <ShieldAlert
                                        size={15}
                                    />
                                ) : (
                                    <span className="text-xs font-bold">
                                        {index + 1}
                                    </span>
                                )}
                            </div>

                            <p className="text-sm leading-7 text-slate-300">
                                {item}
                            </p>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

// ============================================================
// METRIC CARD
// ============================================================

const MetricCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    trend,
    danger = false,
}) => {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1712] p-5">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-400/5 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {label}
                    </p>

                    <p
                        className={`mt-2 text-2xl font-bold ${
                            danger
                                ? "text-red-400"
                                : "text-white"
                        }`}
                    >
                        {value}
                    </p>

                    {subValue && (
                        <p className="mt-2 text-xs text-slate-500">
                            {subValue}
                        </p>
                    )}
                </div>

                <div className="rounded-xl bg-emerald-400/10 p-3">
                    <Icon
                        size={20}
                        className={
                            danger
                                ? "text-red-400"
                                : "text-emerald-300"
                        }
                    />
                </div>
            </div>

            {trend !== undefined &&
                trend !== null && (
                    <div
                        className={`mt-4 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                            Number(trend) < 0
                                ? "bg-red-500/10 text-red-400"
                                : Number(trend) > 0
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-white/5 text-slate-400"
                        }`}
                    >
                        {Number(trend) < 0 ? (
                            <ArrowDownRight size={13} />
                        ) : (
                            <ArrowUpRight size={13} />
                        )}

                        {formatPercent(trend)}
                    </div>
                )}
        </div>
    );
};

// ============================================================
// REVENUE COMPARISON
// ============================================================

const RevenueComparison = ({ revenue }) => {
    if (!revenue) {
        return null;
    }

    const current = Number(revenue.current || 0);
    const previous = Number(
        revenue.previous || 0
    );

    const change =
        revenue.changePercent;

    return (
        <section className="rounded-3xl border border-white/10 bg-[#0B1712] p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-400/10 p-3">
                    <CircleDollarSign
                        size={20}
                        className="text-emerald-300"
                    />
                </div>

                <div>
                    <h2 className="font-semibold text-white">
                        Revenue Comparison
                    </h2>

                    <p className="text-xs text-slate-500">
                        Last 30 days vs previous 30 days
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-[#0D1C15] p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        Current Period
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                        {formatCurrency(current)}
                    </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0D1C15] p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        Previous Period
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                        {formatCurrency(previous)}
                    </p>
                </div>

                <div
                    className={`rounded-2xl border p-5 ${
                        Number(change) < 0
                            ? "border-red-500/15 bg-red-500/5"
                            : "border-emerald-400/15 bg-emerald-400/5"
                    }`}
                >
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        Change
                    </p>

                    <p
                        className={`mt-2 text-xl font-bold ${
                            Number(change) < 0
                                ? "text-red-400"
                                : "text-emerald-300"
                        }`}
                    >
                        {formatPercent(change)}
                    </p>
                </div>
            </div>
        </section>
    );
};

// ============================================================
// PRODUCT DECLINE
// ============================================================

const DecliningProducts = ({
    products,
}) => {
    if (
        !products ||
        products.length === 0
    ) {
        return null;
    }

    return (
        <section className="rounded-3xl border border-red-500/15 bg-[#0B1712]">
            <div className="border-b border-white/5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-500/10 p-3">
                        <Package
                            size={20}
                            className="text-red-400"
                        />
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Sales Signal
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-white">
                            Declining Products
                        </h2>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {products.map(
                    (product, index) => (
                        <div
                            key={`${product.productName}-${index}`}
                            className="flex items-center justify-between gap-4 p-5"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    {
                                        product.productName
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Previous:{" "}
                                    {formatNumber(
                                        product.previousQuantity
                                    )}{" "}
                                    units
                                    {" • "}
                                    Current:{" "}
                                    {formatNumber(
                                        product.currentQuantity
                                    )}{" "}
                                    units
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400">
                                <TrendingDown
                                    size={13}
                                />

                                {formatPercent(
                                    product.changePercent
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

// ============================================================
// INCREASING EXPENSES
// ============================================================

const IncreasingExpenses = ({
    expenses,
}) => {
    if (
        !expenses ||
        expenses.length === 0
    ) {
        return null;
    }

    return (
        <section className="rounded-3xl border border-amber-400/15 bg-[#0B1712]">
            <div className="border-b border-white/5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-400/10 p-3">
                        <Wallet
                            size={20}
                            className="text-amber-300"
                        />
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Expense Signal
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-white">
                            Increasing Expenses
                        </h2>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {expenses.map(
                    (expense, index) => (
                        <div
                            key={`${expense.category}-${index}`}
                            className="flex items-center justify-between gap-4 p-5"
                        >
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {
                                        expense.category
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Previous:{" "}
                                    {formatCurrency(
                                        expense.previousAmount
                                    )}
                                    {" • "}
                                    Current:{" "}
                                    {formatCurrency(
                                        expense.currentAmount
                                    )}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-400/10 px-2.5 py-1.5 text-xs font-bold text-amber-300">
                                <TrendingUp
                                    size={13}
                                />

                                {formatPercent(
                                    expense.changePercent
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

// ============================================================
// LOW STOCK
// ============================================================

const LowStockProducts = ({
    products,
}) => {
    if (
        !products ||
        products.length === 0
    ) {
        return (
            <section className="rounded-3xl border border-emerald-400/15 bg-[#0B1712] p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-400/10 p-3">
                        <Package
                            size={20}
                            className="text-emerald-300"
                        />
                    </div>

                    <div>
                        <h2 className="font-semibold text-white">
                            Inventory Signal
                        </h2>

                        <p className="mt-1 text-sm text-emerald-300">
                            No products are currently at or below minimum stock.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-3xl border border-amber-400/15 bg-[#0B1712]">
            <div className="border-b border-white/5 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-400/10 p-3">
                        <Package
                            size={20}
                            className="text-amber-300"
                        />
                    </div>

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Inventory Signal
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-white">
                            Low Stock Products
                        </h2>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {products.map(
                    (product, index) => (
                        <div
                            key={`${product.productName}-${index}`}
                            className="flex items-center justify-between gap-4 p-5"
                        >
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {
                                        product.productName
                                    }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Current stock:{" "}
                                    {formatNumber(
                                        product.stock
                                    )}
                                </p>
                            </div>

                            <div className="rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                                Minimum:{" "}
                                {formatNumber(
                                    product.minimumStock
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </section>
    );
};

// ============================================================
// SALES COUNT
// ============================================================

const SalesCount = ({ salesCount }) => {
    if (!salesCount) {
        return null;
    }

    return (
        <section className="rounded-3xl border border-white/10 bg-[#0B1712] p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-cyan-400/10 p-3">
                    <ShoppingCart
                        size={20}
                        className="text-cyan-300"
                    />
                </div>

                <div>
                    <h2 className="font-semibold text-white">
                        Sales Activity
                    </h2>

                    <p className="text-xs text-slate-500">
                        Transaction comparison
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-[#0D1C15] p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        Current Period
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {formatNumber(
                            salesCount.current
                        )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        transactions
                    </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#0D1C15] p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                        Previous Period
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {formatNumber(
                            salesCount.previous
                        )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        transactions
                    </p>
                </div>
            </div>
        </section>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const WhyEngine = () => {
    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    // ========================================================
    // FETCH
    // ========================================================

    const fetchWhyEngine = async (
        refresh = false
    ) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response =
                await api.get("/api/why", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            console.log(
                "WHY ENGINE RESPONSE:",
                response.data
            );

            setResult(response.data);
        } catch (err) {
            console.error(
                "WHY ENGINE ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to load Why Engine analysis."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWhyEngine();
    }, []);

    // ========================================================
    // DATA
    // ========================================================

    const evidence = useMemo(
        () => getEvidence(result),
        [result]
    );

    const aiText = useMemo(
        () => getAIExplanation(result),
        [result]
    );

    const sections = useMemo(
        () => parseAISections(aiText),
        [aiText]
    );

    const revenue =
        evidence.revenue || null;

    const decliningProducts =
        evidence.decliningProducts || [];

    const increasingExpenses =
        evidence.increasingExpenses || [];

    const lowStockProducts =
        evidence.lowStockProducts || [];

    const salesCount =
        evidence.salesCount || null;

    // ========================================================
    // FIND AI SECTIONS
    // ========================================================

    const mainSection =
        sections.find(
            (section) =>
                section.type === "main"
        );

    const whySection =
        sections.find(
            (section) =>
                section.type === "why"
        );

    const signalsSection =
        sections.find(
            (section) =>
                section.type === "signals"
        );

    const risksSection =
        sections.find(
            (section) =>
                section.type === "risk"
        );

    const reviewSection =
        sections.find(
            (section) =>
                section.type === "review"
        );

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <div className="flex min-h-[80vh] items-center justify-center px-6">
                    <div className="text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                            <Brain
                                size={30}
                                className="animate-pulse text-emerald-300"
                            />
                        </div>

                        <h2 className="text-xl font-semibold">
                            VyparMind is thinking...
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Analyzing sales,
                            expenses and
                            inventory evidence.
                        </p>
                    </div>
                </div>
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

                <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center px-6">
                    <div className="w-full rounded-3xl border border-red-500/20 bg-[#0B1712] p-8 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                            <AlertCircle
                                size={28}
                                className="text-red-400"
                            />
                        </div>

                        <h2 className="text-xl font-semibold">
                            Why Engine could not load
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                fetchWhyEngine(
                                    true
                                )
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#06100C] transition hover:bg-emerald-300"
                        >
                            <RefreshCw
                                size={16}
                            />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // PAGE
    // ========================================================

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#07100D] text-white">
            <Navbar />

            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

                <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-teal-400/5 blur-3xl" />
            </div>

            <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-300">
                            <Sparkles size={13} />
                            VyparMind Intelligence
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Why Engine
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                            Understand why your
                            business performance
                            is changing using
                            evidence from your
                            actual business data.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            fetchWhyEngine(true)
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0B1712] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/5 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh Analysis
                    </button>
                </div>

                {/* =================================================
                    PERIOD
                ================================================= */}

                <div className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B1712] px-4 py-3 text-sm text-slate-400">
                    <Search
                        size={16}
                        className="text-emerald-300"
                    />

                    Comparing{" "}
                    <span className="font-semibold text-white">
                        Last 30 days
                    </span>{" "}
                    with{" "}
                    <span className="font-semibold text-white">
                        Previous 30 days
                    </span>
                </div>

                {/* =================================================
                    REVENUE SNAPSHOT
                ================================================= */}

                {revenue && (
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <MetricCard
                            label="Current Revenue"
                            value={formatCurrency(
                                revenue.current
                            )}
                            icon={
                                CircleDollarSign
                            }
                        />

                        <MetricCard
                            label="Previous Revenue"
                            value={formatCurrency(
                                revenue.previous
                            )}
                            icon={Wallet}
                        />

                        <MetricCard
                            label="Revenue Change"
                            value={formatPercent(
                                revenue.changePercent
                            )}
                            icon={
                                Number(
                                    revenue.changePercent
                                ) < 0
                                    ? TrendingDown
                                    : TrendingUp
                            }
                            danger={
                                Number(
                                    revenue.changePercent
                                ) < 0
                            }
                            trend={
                                revenue.changePercent
                            }
                        />
                    </div>
                )}

                {/* =================================================
                    MAIN CHANGE
                ================================================= */}

                {mainSection && (
                    <div className="mb-6">
                        <AISection
                            section={
                                mainSection
                            }
                        />
                    </div>
                )}

                {/* =================================================
                    WHY
                ================================================= */}

                {whySection && (
                    <div className="mb-6">
                        <AISection
                            section={
                                whySection
                            }
                        />
                    </div>
                )}

                {/* =================================================
                    SIGNALS
                ================================================= */}

                {signalsSection && (
                    <div className="mb-6">
                        <AISection
                            section={
                                signalsSection
                            }
                        />
                    </div>
                )}

                {/* =================================================
                    RISKS
                ================================================= */}

                {risksSection && (
                    <div className="mb-6">
                        <AISection
                            section={
                                risksSection
                            }
                        />
                    </div>
                )}

                {/* =================================================
                    REVENUE COMPARISON
                ================================================= */}

                <div className="mb-6">
                    <RevenueComparison
                        revenue={revenue}
                    />
                </div>

                {/* =================================================
                    PRODUCT + EXPENSE ANALYSIS
                ================================================= */}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DecliningProducts
                        products={
                            decliningProducts
                        }
                    />

                    <IncreasingExpenses
                        expenses={
                            increasingExpenses
                        }
                    />
                </div>

                {/* =================================================
                    INVENTORY + SALES
                ================================================= */}

                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <LowStockProducts
                        products={
                            lowStockProducts
                        }
                    />

                    <SalesCount
                        salesCount={
                            salesCount
                        }
                    />
                </div>

                {/* =================================================
                    REVIEW
                ================================================= */}

                {reviewSection && (
                    <div className="mt-6">
                        <AISection
                            section={
                                reviewSection
                            }
                        />
                    </div>
                )}

                {/* =================================================
                    RAW AI RESPONSE
                ================================================= */}

                {aiText && (
                    <section className="mt-8 overflow-hidden rounded-3xl border border-emerald-400/15 bg-[#0B1712]">
                        <div className="border-b border-white/5 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-400/10 p-3">
                                    <Brain
                                        size={21}
                                        className="text-emerald-300"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                                        Full AI Explanation
                                    </p>

                                    <h2 className="mt-1 text-lg font-semibold text-white">
                                        VyparMind's Reasoning
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="rounded-2xl border border-white/5 bg-[#07100D] p-5">
                                {aiText
                                    .split("\n")
                                    .filter(
                                        (line) =>
                                            line.trim()
                                    )
                                    .map(
                                        (
                                            line,
                                            index
                                        ) => (
                                            <p
                                                key={
                                                    index
                                                }
                                                className="mb-3 text-sm leading-7 text-slate-300 last:mb-0"
                                            >
                                                {line}
                                            </p>
                                        )
                                    )}
                            </div>
                        </div>
                    </section>
                )}

                {/* =================================================
                    EVIDENCE
                ================================================= */}

                <section className="mt-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-cyan-400/10 p-2">
                            <Eye
                                size={18}
                                className="text-cyan-300"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-white">
                                Evidence Used
                            </h2>

                            <p className="text-xs text-slate-500">
                                These are the actual
                                signals provided to
                                VyparMind.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Revenue Evidence */}

                        {revenue && (
                            <div className="rounded-2xl border border-white/10 bg-[#0B1712] p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <CircleDollarSign
                                        size={17}
                                        className="text-emerald-300"
                                    />

                                    <h3 className="font-semibold">
                                        Revenue Evidence
                                    </h3>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Current
                                        </span>

                                        <span className="font-semibold text-white">
                                            {formatCurrency(
                                                revenue.current
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Previous
                                        </span>

                                        <span className="font-semibold text-white">
                                            {formatCurrency(
                                                revenue.previous
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-white/5 pt-3">
                                        <span className="text-slate-500">
                                            Change
                                        </span>

                                        <span
                                            className={`font-semibold ${
                                                Number(
                                                    revenue.changePercent
                                                ) <
                                                0
                                                    ? "text-red-400"
                                                    : "text-emerald-300"
                                            }`}
                                        >
                                            {formatPercent(
                                                revenue.changePercent
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sales Evidence */}

                        {salesCount && (
                            <div className="rounded-2xl border border-white/10 bg-[#0B1712] p-5">
                                <div className="mb-4 flex items-center gap-2">
                                    <ShoppingCart
                                        size={17}
                                        className="text-cyan-300"
                                    />

                                    <h3 className="font-semibold">
                                        Sales Evidence
                                    </h3>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Current period
                                        </span>

                                        <span className="font-semibold text-white">
                                            {formatNumber(
                                                salesCount.current
                                            )}{" "}
                                            sales
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-slate-500">
                                            Previous period
                                        </span>

                                        <span className="font-semibold text-white">
                                            {formatNumber(
                                                salesCount.previous
                                            )}{" "}
                                            sales
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="mt-10 border-t border-white/5 pt-6">
                    <div className="flex flex-col justify-between gap-3 text-xs text-slate-600 sm:flex-row">
                        <span>
                            VyparIntel • Why Engine
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Brain size={13} />
                            Evidence-first
                            intelligence by
                            VyparMind
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WhyEngine;