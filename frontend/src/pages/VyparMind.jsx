import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ArrowUp,
    Brain,
    CheckCircle2,
    ChevronRight,
    CircleDollarSign,
    Database,
    Lightbulb,
    Loader2,
    MessageSquare,
    Package,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    X,
    Activity,
} from "lucide-react";

import api from "../api/axios";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "₹0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "₹0";
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
        return "0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    return number.toLocaleString("en-IN");
};

const formatPercent = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "0%";
    }

    const number = Number(value);

    return `${number >= 0 ? "+" : ""}${number.toFixed(1)}%`;
};

const formatTime = (date) => {
    try {
        return new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(date));
    } catch {
        return "";
    }
};

const normalizeArray = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    return [value];
};

/* =========================================================
   INITIAL MESSAGE
========================================================= */

const createWelcomeMessage = () => ({
    id: `welcome-${Date.now()}`,
    role: "assistant",
    createdAt: new Date(),
    data: {
        answer:
            "I'm VyparMind, your AI Business Brain. I can analyze your actual business data and help you understand what is happening, why it is happening, and what you should do next.",
        summary:
            "Your business intelligence is connected. Ask me about revenue, expenses, profit, products, sales, inventory, risks or your next action.",
        whatHappened: [],
        whyItHappened: [],
        whatToDoNext: [],
        importantSignals: [],
        followUpQuestions: [
            "Why did my profit decrease?",
            "Which product is performing the worst?",
            "Why are my expenses increasing?",
            "What should I do next?",
        ],
    },
});

/* =========================================================
   QUICK QUESTIONS
========================================================= */

const quickQuestions = [
    {
        title: "Business Health",
        question: "How is my business doing right now?",
        icon: Brain,
    },
    {
        title: "Profit Analysis",
        question: "Why did my profit decrease?",
        icon: TrendingDown,
    },
    {
        title: "Revenue",
        question: "What is my current revenue and how is it changing?",
        icon: TrendingUp,
    },
    {
        title: "Expenses",
        question: "Why are my expenses increasing?",
        icon: CircleDollarSign,
    },
    {
        title: "Products",
        question: "Which product is hurting my business the most?",
        icon: Package,
    },
    {
        title: "Next Action",
        question: "What should I do next to improve my business?",
        icon: Lightbulb,
    },
];

/* =========================================================
   INSIGHT CARD
========================================================= */

const InsightCard = ({
    item,
    type = "default",
}) => {
    const data =
        typeof item === "string"
            ? {
                  title: item,
                  description: "",
                  evidence: "",
              }
            : item || {};

    const title =
        data.title ||
        data.reason ||
        data.action ||
        data.risk ||
        data.issue ||
        data.name ||
        "Business insight";

    const description =
        data.description ||
        data.reason ||
        data.details ||
        "";

    const evidence =
        data.evidence ||
        data.value ||
        "";

    const priority =
        data.priority ||
        "";

    const typeConfig = {
        default: {
            box: "border-white/5 bg-white/[0.025]",
            icon: "bg-white/5 text-slate-400",
            Icon: Sparkles,
        },
        why: {
            box: "border-blue-500/10 bg-blue-500/[0.035]",
            icon: "bg-blue-500/10 text-blue-400",
            Icon: Activity,
        },
        action: {
            box: "border-emerald-500/10 bg-emerald-500/[0.035]",
            icon: "bg-emerald-500/10 text-emerald-400",
            Icon: CheckCircle2,
        },
        risk: {
            box: "border-amber-500/10 bg-amber-500/[0.035]",
            icon: "bg-amber-500/10 text-amber-400",
            Icon: AlertTriangle,
        },
    };

    const config =
        typeConfig[type] ||
        typeConfig.default;

    const Icon = config.Icon;

    return (
        <div
            className={`rounded-2xl border p-3.5 ${config.box}`}
        >
            <div className="flex gap-3">
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.icon}`}
                >
                    <Icon size={15} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">
                            {title}
                        </p>

                        {priority && (
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                {priority}
                            </span>
                        )}
                    </div>

                    {description && (
                        <p className="mt-1.5 text-xs leading-5 text-slate-400">
                            {description}
                        </p>
                    )}

                    {evidence !== "" &&
                        evidence !== null &&
                        evidence !== undefined && (
                            <div className="mt-2 rounded-lg bg-black/20 px-2.5 py-2 text-[11px] text-slate-500">
                                <span className="font-semibold text-slate-400">
                                    Evidence:
                                </span>{" "}
                                {typeof evidence ===
                                "object"
                                    ? JSON.stringify(
                                          evidence
                                      )
                                    : evidence}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   AI MESSAGE
========================================================= */

const AssistantMessage = ({
    message,
    onFollowUp,
}) => {
    const data = message.data || {};

    const whatHappened =
        normalizeArray(
            data.whatHappened
        );

    const whyItHappened =
        normalizeArray(
            data.whyItHappened
        );

    const whatToDoNext =
        normalizeArray(
            data.whatToDoNext
        );

    const importantSignals =
        normalizeArray(
            data.importantSignals
        );

    const followUpQuestions =
        normalizeArray(
            data.followUpQuestions
        );

    return (
        <div className="flex gap-3">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <Brain size={17} />
            </div>

            <div className="min-w-0 max-w-[900px] flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">
                        VyparMind
                    </span>

                    <span className="text-[10px] text-slate-700">
                        {formatTime(
                            message.createdAt
                        )}
                    </span>
                </div>

                <div className="mt-2 rounded-2xl rounded-tl-md border border-emerald-500/10 bg-[#0D1914] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">
                        {data.answer}
                    </p>

                    {data.summary && (
                        <div className="mt-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.035] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-500/80">
                                Business Summary
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                {data.summary}
                            </p>
                        </div>
                    )}

                    {whatHappened.length >
                        0 && (
                        <div className="mt-5">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                                What Happened
                            </p>

                            <div className="space-y-2">
                                {whatHappened.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <InsightCard
                                            key={
                                                index
                                            }
                                            item={
                                                item
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {whyItHappened.length >
                        0 && (
                        <div className="mt-5">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                                Why It Happened
                            </p>

                            <div className="space-y-2">
                                {whyItHappened.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <InsightCard
                                            key={
                                                index
                                            }
                                            item={
                                                item
                                            }
                                            type="why"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {whatToDoNext.length >
                        0 && (
                        <div className="mt-5">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-500">
                                What To Do Next
                            </p>

                            <div className="space-y-2">
                                {whatToDoNext.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <InsightCard
                                            key={
                                                index
                                            }
                                            item={
                                                item
                                            }
                                            type="action"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {importantSignals.length >
                        0 && (
                        <div className="mt-5">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-500">
                                Important Signals
                            </p>

                            <div className="space-y-2">
                                {importantSignals.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <InsightCard
                                            key={
                                                index
                                            }
                                            item={
                                                item
                                            }
                                            type="risk"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {followUpQuestions.length >
                        0 && (
                        <div className="mt-5 border-t border-white/5 pt-4">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                                Continue analysis
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {followUpQuestions
                                    .slice(0, 4)
                                    .map(
                                        (
                                            question,
                                            index
                                        ) => (
                                            <button
                                                key={
                                                    index
                                                }
                                                onClick={() =>
                                                    onFollowUp(
                                                        question
                                                    )
                                                }
                                                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.035] px-3 py-2 text-[11px] text-slate-400 transition hover:border-emerald-400/20 hover:bg-emerald-500/10 hover:text-emerald-300"
                                            >
                                                {
                                                    question
                                                }

                                                <ChevronRight
                                                    size={
                                                        12
                                                    }
                                                />
                                            </button>
                                        )
                                    )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   USER MESSAGE
========================================================= */

const UserMessage = ({
    message,
}) => {
    return (
        <div className="flex justify-end gap-3">
            <div className="max-w-[760px]">
                <div className="mb-1 flex justify-end">
                    <span className="text-[10px] text-slate-700">
                        {formatTime(
                            message.createdAt
                        )}
                    </span>
                </div>

                <div className="rounded-2xl rounded-tr-md bg-emerald-500 px-4 py-3.5">
                    <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-[#06100B]">
                        {message.content}
                    </p>
                </div>
            </div>

            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs font-bold text-emerald-400">
                U
            </div>
        </div>
    );
};

/* =========================================================
   BUSINESS SNAPSHOT
========================================================= */

const BusinessSnapshot = ({
    business,
    refreshing,
    onRefresh,
}) => {
    const revenue =
        business?.revenue?.current ??
        business?.revenue ??
        0;

    const expenses =
        business?.expenses?.current ??
        business?.expenses ??
        0;

    const netProfit =
        business?.profit?.netProfit ??
        business?.netProfit ??
        (Number(revenue) -
            Number(expenses));

    const grossProfit =
        business?.profit?.grossProfit ??
        business?.grossProfit ??
        0;

    const totalSales =
        business?.salesCount?.current ??
        business?.totalSales ??
        business?.sales ??
        0;

    const totalProducts =
        business?.inventory?.totalProducts ??
        business?.totalProducts ??
        0;

    const lowStock =
        business?.inventory?.lowStockCount ??
        business?.lowStockCount ??
        0;

    const outOfStock =
        business?.inventory?.outOfStockCount ??
        business?.outOfStockCount ??
        0;

    const revenueChange =
        business?.revenue?.changePercent;

    const expenseChange =
        business?.expenses?.changePercent;

    const profitChange =
        business?.profit?.changePercent;

    return (
        <div className="border-b border-emerald-950/50 bg-[#07110D]/70">
            <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Database
                                size={14}
                                className="text-emerald-400"
                            />

                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                Live Business Intelligence
                            </p>
                        </div>

                        <p className="mt-1 text-xs text-slate-700">
                            VyparMind is connected to your business data
                        </p>
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-[10px] font-semibold text-slate-500 transition hover:border-emerald-500/20 hover:text-emerald-300 disabled:opacity-40"
                    >
                        <RefreshCw
                            size={12}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
                    <Metric
                        label="Revenue"
                        value={formatCurrency(
                            revenue
                        )}
                        change={
                            revenueChange
                        }
                        icon={TrendingUp}
                    />

                    <Metric
                        label="Expenses"
                        value={formatCurrency(
                            expenses
                        )}
                        change={
                            expenseChange
                        }
                        negative
                        icon={CircleDollarSign}
                    />

                    <Metric
                        label="Net Profit"
                        value={formatCurrency(
                            netProfit
                        )}
                        change={profitChange}
                        negative={
                            Number(
                                netProfit
                            ) < 0
                        }
                        icon={TrendingUp}
                    />

                    <Metric
                        label="Gross Profit"
                        value={formatCurrency(
                            grossProfit
                        )}
                        icon={TrendingUp}
                    />

                    <Metric
                        label="Sales"
                        value={formatNumber(
                            totalSales
                        )}
                        icon={Activity}
                    />

                    <Metric
                        label="Products"
                        value={formatNumber(
                            totalProducts
                        )}
                        icon={Package}
                    />

                    <Metric
                        label="Low Stock"
                        value={formatNumber(
                            lowStock
                        )}
                        warning={
                            Number(lowStock) >
                            0
                        }
                        icon={
                            AlertTriangle
                        }
                    />

                    <Metric
                        label="Out of Stock"
                        value={formatNumber(
                            outOfStock
                        )}
                        warning={
                            Number(
                                outOfStock
                            ) > 0
                        }
                        icon={
                            AlertTriangle
                        }
                    />
                </div>
            </div>
        </div>
    );
};

/* =========================================================
   METRIC
========================================================= */

const Metric = ({
    label,
    value,
    change,
    icon: Icon,
    negative = false,
    warning = false,
}) => {
    return (
        <div
            className={`rounded-xl border p-3 ${
                warning
                    ? "border-amber-500/10 bg-amber-500/[0.025]"
                    : negative &&
                      String(value).includes(
                          "-"
                      )
                    ? "border-red-500/10 bg-red-500/[0.025]"
                    : "border-white/5 bg-white/[0.015]"
            }`}
        >
            <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                    {label}
                </p>

                <Icon
                    size={12}
                    className={
                        warning
                            ? "text-amber-400"
                            : "text-emerald-500/70"
                    }
                />
            </div>

            <p
                className={`mt-1 text-sm font-bold ${
                    String(value).includes(
                        "-"
                    )
                        ? "text-red-400"
                        : "text-slate-200"
                }`}
            >
                {value}
            </p>

            {change !== undefined &&
                change !== null && (
                    <p
                        className={`mt-0.5 text-[9px] ${
                            Number(change) >=
                            0
                                ? "text-emerald-500"
                                : "text-red-400"
                        }`}
                    >
                        {formatPercent(
                            change
                        )}
                    </p>
                )}
        </div>
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const VyparMind = () => {
    const [messages, setMessages] =
        useState([
            createWelcomeMessage(),
        ]);

    const [input, setInput] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [businessLoading, setBusinessLoading] =
        useState(true);

    const [business, setBusiness] =
        useState(null);

    const [morningBrief, setMorningBrief] =
        useState(null);

    const [error, setError] =
        useState("");

    const textareaRef =
        useRef(null);

    const messagesEndRef =
        useRef(null);

    /* =====================================================
       LOAD BUSINESS DATA
    ===================================================== */

    const loadBusinessData =
        async () => {
            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                setError(
                    "Please login to access your business intelligence."
                );

                setBusinessLoading(
                    false
                );

                return;
            }

            setBusinessLoading(true);
            setError("");

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            try {
                const results =
                    await Promise.allSettled(
                        [
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
                        ]
                    );

                const [
                    analyticsResult,
                    briefResult,
                    businessResult,
                ] = results;

                /* -----------------------------------------
                   ANALYTICS
                ----------------------------------------- */

                let analytics =
                    {};

                if (
                    analyticsResult.status ===
                    "fulfilled"
                ) {
                    analytics =
                        analyticsResult
                            .value?.data
                            ?.data ||
                        analyticsResult
                            .value?.data ||
                        {};
                }

                /* -----------------------------------------
                   MORNING BRIEF
                ----------------------------------------- */

                let brief = {};

                if (
                    briefResult.status ===
                    "fulfilled"
                ) {
                    brief =
                        briefResult
                            .value?.data
                            ?.briefData ||
                        briefResult
                            .value?.data
                            ?.data ||
                        {};
                }

                setMorningBrief(
                    brief
                );

                /* -----------------------------------------
                   BUSINESS
                ----------------------------------------- */

                let businessProfile =
                    {};

                if (
                    businessResult.status ===
                    "fulfilled"
                ) {
                    businessProfile =
                        businessResult
                            .value?.data
                            ?.business ||
                        businessResult
                            .value?.data
                            ?.data ||
                        businessResult
                            .value?.data ||
                        {};
                }

                /*
                 * Morning brief already contains
                 * normalized business intelligence.
                 * Prefer it over dashboard when available.
                 */

                const combined = {
                    ...analytics,
                    ...businessProfile,
                    ...brief,

                    revenue:
                        brief?.revenue ||
                        analytics?.revenue ||
                        {},
                    expenses:
                        brief?.expenses ||
                        analytics?.expenses ||
                        {},
                    profit:
                        brief?.profit ||
                        analytics?.profit ||
                        {},
                    inventory:
                        brief?.inventory ||
                        analytics?.inventory ||
                        {},
                    salesCount:
                        analytics?.salesCount ||
                        brief?.salesCount ||
                        {},
                };

                setBusiness(
                    combined
                );

                /* -----------------------------------------
                   CHECK FAILED REQUESTS
                ----------------------------------------- */

                const failed =
                    results.filter(
                        (result) =>
                            result.status ===
                            "rejected"
                    );

                if (
                    failed.length ===
                        results.length
                ) {
                    setError(
                        "Unable to load your business data. Please check that the backend is running."
                    );
                }
            } catch (err) {
                console.error(
                    "Business Intelligence Error:",
                    err
                );

                setError(
                    err?.response?.data
                        ?.message ||
                        "Unable to load business intelligence."
                );
            } finally {
                setBusinessLoading(
                    false
                );
            }
        };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        loadBusinessData();

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 300);
    }, []);

    /* =====================================================
       AUTO SCROLL
    ===================================================== */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView(
            {
                behavior: "smooth",
                block: "end",
            }
        );
    }, [
        messages,
        loading,
    ]);

    /* =====================================================
       SEND CHAT
    ===================================================== */

    const sendMessage =
        async (
            customQuestion = null
        ) => {
            const question = (
                customQuestion ??
                input
            ).trim();

            if (
                !question ||
                loading
            ) {
                return;
            }

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }

            setError("");

            const userMessage = {
                id:
                    Date.now() +
                    "-user",
                role: "user",
                content:
                    question,
                createdAt:
                    new Date(),
            };

            setMessages(
                (previous) => [
                    ...previous,
                    userMessage,
                ]
            );

            setInput("");
            setLoading(true);

            try {
                /*
                 * IMPORTANT:
                 * We do not manually send all business
                 * data to Groq from the frontend.
                 *
                 * The backend Business Copilot retrieves
                 * the user's actual DB data securely.
                 */

                const response =
                    await api.post(
                        "/api/vyparmind/chat",
                        {
                            question,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                const result =
                    response?.data
                        ?.data;

                if (!result) {
                    throw new Error(
                        "VyparMind returned an empty response."
                    );
                }

                const assistantMessage =
                    {
                        id:
                            Date.now() +
                            "-assistant",
                        role: "assistant",
                        createdAt:
                            new Date(),
                        data: result,
                    };

                setMessages(
                    (previous) => [
                        ...previous,
                        assistantMessage,
                    ]
                );
            } catch (err) {
                console.error(
                    "VyparMind Chat Error:",
                    err
                );

                setError(
                    err?.response
                        ?.data
                        ?.message ||
                        err?.message ||
                        "VyparMind could not process your question."
                );
            } finally {
                setLoading(
                    false
                );

                setTimeout(
                    () =>
                        textareaRef.current?.focus(),
                    100
                );
            }
        };

    /* =====================================================
       KEYBOARD
    ===================================================== */

    const handleKeyDown =
        (event) => {
            if (
                event.key ===
                    "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                sendMessage();
            }
        };

    /* =====================================================
       NEW CONVERSATION
    ===================================================== */

    const newConversation =
        () => {
            if (loading) return;

            setMessages([
                createWelcomeMessage(),
            ]);

            setInput("");
            setError("");

            setTimeout(
                () =>
                    textareaRef.current?.focus(),
                100
            );
        };

    /* =====================================================
       BUSINESS SIGNALS
    ===================================================== */

    const signals =
        useMemo(() => {
            const result =
                [];

            if (!business) {
                return result;
            }

            const revenueChange =
                Number(
                    business
                        ?.revenue
                        ?.changePercent
                );

            const expenseChange =
                Number(
                    business
                        ?.expenses
                        ?.changePercent
                );

            const netProfit =
                Number(
                    business
                        ?.profit
                        ?.netProfit ??
                        0
                );

            const lowStock =
                Number(
                    business
                        ?.inventory
                        ?.lowStockCount ??
                        0
                );

            const outOfStock =
                Number(
                    business
                        ?.inventory
                        ?.outOfStockCount ??
                        0
                );

            if (
                revenueChange <
                -10
            ) {
                result.push({
                    type: "warning",
                    text: `Revenue is down ${Math.abs(
                        revenueChange
                    ).toFixed(
                        1
                    )}% compared with the previous period.`,
                });
            }

            if (
                expenseChange >
                10
            ) {
                result.push({
                    type: "warning",
                    text: `Expenses increased by ${expenseChange.toFixed(
                        1
                    )}%.`,
                });
            }

            if (
                netProfit <
                0
            ) {
                result.push({
                    type: "danger",
                    text: "Your current net profit is negative.",
                });
            }

            if (
                lowStock >
                0
            ) {
                result.push({
                    type: "warning",
                    text: `${lowStock} product(s) have low stock.`,
                });
            }

            if (
                outOfStock >
                0
            ) {
                result.push({
                    type: "danger",
                    text: `${outOfStock} product(s) are out of stock.`,
                });
            }

            return result;
        }, [business]);

    return (
        <div className="min-h-[calc(100vh-74px)] bg-[#050C09] text-white">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b border-emerald-950/50 bg-[#07110D]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-400">
                            <Brain size={22} />

                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white sm:text-lg">
                                    VyparMind
                                </h1>

                                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                                    Business Brain
                                </span>
                            </div>

                            <p className="text-[10px] text-slate-600 sm:text-xs">
                                Your business. Understood.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] px-3 py-2 sm:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                            <span className="text-[10px] text-emerald-400">
                                Data Connected
                            </span>
                        </div>

                        <button
                            onClick={
                                newConversation
                            }
                            disabled={
                                loading
                            }
                            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-emerald-500/20 hover:text-emerald-300 disabled:opacity-40"
                        >
                            <MessageSquare
                                size={14}
                            />

                            <span className="hidden sm:inline">
                                New Chat
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* =================================================
                LIVE BUSINESS SNAPSHOT
            ================================================= */}

            {businessLoading ? (
                <div className="border-b border-emerald-950/50 bg-[#07110D]/60">
                    <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
                        <Loader2
                            size={16}
                            className="animate-spin text-emerald-400"
                        />

                        <span className="text-xs text-slate-500">
                            Loading your business intelligence...
                        </span>
                    </div>
                </div>
            ) : (
                <BusinessSnapshot
                    business={
                        business
                    }
                    refreshing={
                        businessLoading
                    }
                    onRefresh={
                        loadBusinessData
                    }
                />
            )}

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="mx-auto flex max-w-[1500px]">

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside className="hidden w-[280px] shrink-0 border-r border-emerald-950/50 px-5 py-6 lg:block">

                    <div className="rounded-2xl border border-emerald-500/10 bg-[#09140F] p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Brain size={17} />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-white">
                                    Business Brain
                                </p>

                                <p className="text-[10px] text-slate-600">
                                    Live business context
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2.5">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <CheckCircle2
                                    size={12}
                                    className="text-emerald-400"
                                />
                                Revenue
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <CheckCircle2
                                    size={12}
                                    className="text-emerald-400"
                                />
                                Expenses
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <CheckCircle2
                                    size={12}
                                    className="text-emerald-400"
                                />
                                Profit & Loss
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <CheckCircle2
                                    size={12}
                                    className="text-emerald-400"
                                />
                                Products & Inventory
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <CheckCircle2
                                    size={12}
                                    className="text-emerald-400"
                                />
                                Sales signals
                            </div>
                        </div>
                    </div>

                    {/* SIGNALS */}

                    {signals.length >
                        0 && (
                        <div className="mt-5">
                            <div className="mb-3 flex items-center gap-2">
                                <AlertTriangle
                                    size={13}
                                    className="text-amber-400"
                                />

                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                    Detected Signals
                                </p>
                            </div>

                            <div className="space-y-2">
                                {signals.map(
                                    (
                                        signal,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className={`rounded-xl border p-3 ${
                                                signal.type ===
                                                "danger"
                                                    ? "border-red-500/10 bg-red-500/[0.035]"
                                                    : "border-amber-500/10 bg-amber-500/[0.035]"
                                            }`}
                                        >
                                            <p className="text-[10px] leading-4 text-slate-500">
                                                {
                                                    signal.text
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* QUICK QUESTIONS */}

                    <div className="mt-6">
                        <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            Ask VyparMind
                        </p>

                        <div className="space-y-1">
                            {quickQuestions.map(
                                (
                                    item
                                ) => {
                                    const Icon =
                                        item.icon;

                                    return (
                                        <button
                                            key={
                                                item.title
                                            }
                                            onClick={() =>
                                                sendMessage(
                                                    item.question
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-500/5 disabled:opacity-40"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.025] text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400">
                                                <Icon
                                                    size={
                                                        15
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-slate-400 group-hover:text-emerald-300">
                                                    {
                                                        item.title
                                                    }
                                                </p>

                                                <p className="mt-0.5 truncate text-[9px] text-slate-700">
                                                    {
                                                        item.question
                                                    }
                                                </p>
                                            </div>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </aside>

                {/* =================================================
                    CHAT
                ================================================= */}

                <main className="flex min-h-[calc(100vh-240px)] min-w-0 flex-1 flex-col">

                    <div className="flex-1">
                        <div className="mx-auto max-w-[980px] px-4 py-7 sm:px-6 lg:px-8">

                            {/* WELCOME */}

                            {messages.length ===
                                1 && (
                                <div className="mb-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                                        <Brain
                                            size={
                                                29
                                            }
                                        />
                                    </div>

                                    <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        Ask your business anything.
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                        VyparMind has access to your business intelligence and can explain your numbers instead of simply displaying them.
                                    </p>
                                </div>
                            )}

                            {/* MOBILE QUESTIONS */}

                            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                                {quickQuestions
                                    .slice(
                                        0,
                                        4
                                    )
                                    .map(
                                        (
                                            item
                                        ) => (
                                            <button
                                                key={
                                                    item.title
                                                }
                                                onClick={() =>
                                                    sendMessage(
                                                        item.question
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                                className="shrink-0 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-[10px] text-slate-500"
                                            >
                                                {
                                                    item.title
                                                }
                                            </button>
                                        )
                                    )}
                            </div>

                            {/* MESSAGES */}

                            <div className="space-y-7">
                                {messages.map(
                                    (
                                        message
                                    ) =>
                                        message.role ===
                                        "user" ? (
                                            <UserMessage
                                                key={
                                                    message.id
                                                }
                                                message={
                                                    message
                                                }
                                            />
                                        ) : (
                                            <AssistantMessage
                                                key={
                                                    message.id
                                                }
                                                message={
                                                    message
                                                }
                                                onFollowUp={
                                                    sendMessage
                                                }
                                            />
                                        )
                                )}

                                {loading && (
                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                                            <Brain
                                                size={
                                                    17
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-emerald-500/10 bg-[#0D1914] px-4 py-3.5">
                                            <Loader2
                                                size={
                                                    15
                                                }
                                                className="animate-spin text-emerald-400"
                                            />

                                            <span className="text-xs text-slate-500">
                                                Analyzing your business data...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div
                                    ref={
                                        messagesEndRef
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        INPUT
                    ================================================= */}

                    <div className="sticky bottom-0 border-t border-emerald-950/50 bg-[#050C09]/95 px-3 pb-4 pt-3 backdrop-blur-xl sm:px-5 lg:px-8">
                        <div className="mx-auto max-w-[980px]">

                            {error && (
                                <div className="mb-3 flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/[0.04] px-3 py-2.5">
                                    <p className="text-[11px] text-red-400">
                                        {error}
                                    </p>

                                    <button
                                        onClick={() =>
                                            setError(
                                                ""
                                            )
                                        }
                                        className="text-slate-600 hover:text-white"
                                    >
                                        <X
                                            size={
                                                13
                                            }
                                        />
                                    </button>
                                </div>
                            )}

                            <div className="rounded-2xl border border-emerald-900/60 bg-[#0A1510] shadow-2xl focus-within:border-emerald-500/30">
                                <textarea
                                    ref={
                                        textareaRef
                                    }
                                    value={
                                        input
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setInput(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    disabled={
                                        loading
                                    }
                                    rows={
                                        1
                                    }
                                    placeholder="Ask VyparMind anything about your business..."
                                    className="max-h-36 min-h-[54px] w-full resize-none bg-transparent px-4 pt-4 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-700"
                                />

                                <div className="flex items-center justify-between px-3 pb-3">
                                    <div className="hidden items-center gap-2 text-[10px] text-slate-700 sm:flex">
                                        <Database
                                            size={
                                                11
                                            }
                                        />

                                        Connected to business intelligence
                                    </div>

                                    <button
                                        onClick={() =>
                                            sendMessage()
                                        }
                                        disabled={
                                            !input.trim() ||
                                            loading
                                        }
                                        className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-[#06100B] shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-950 disabled:text-slate-700"
                                    >
                                        {loading ? (
                                            <Loader2
                                                size={
                                                    18
                                                }
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <ArrowUp
                                                size={
                                                    18
                                                }
                                            />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="mt-2 text-center text-[9px] text-slate-700">
                                VyparMind uses your business data to answer questions, explain causes and recommend next actions.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VyparMind;