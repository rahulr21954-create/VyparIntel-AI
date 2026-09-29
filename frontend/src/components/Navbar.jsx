import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
    Brain,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Receipt,
    BarChart3,
    Bell,
    Menu,
    X,
    LogOut,
    Settings,
    ChevronDown,
    Sun,
    Search,
    ShieldAlert,
    Lightbulb,
    MessageSquare,
    Sparkles,
} from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);

    const storedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
        user = null;
    }

    // ==========================================
    // MAIN NAVIGATION
    // ==========================================

    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Products",
            path: "/products",
            icon: Package,
        },
        {
            name: "Sales",
            path: "/sales",
            icon: ShoppingCart,
        },
        {
            name: "Expenses",
            path: "/expenses",
            icon: Receipt,
        },
        {
            name: "Analytics",
            path: "/analytics",
            icon: BarChart3,
        },
    ];

    // ==========================================
    // VYPARMIND AI NAVIGATION
    // ==========================================

    const aiItems = [
        {
            name: "VyparMind Business Brain",
            description: "Ask anything about your business",
            path: "/vyparmind",
            icon: Brain,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            primary: true,
        },
        {
            name: "Morning Brief",
            description: "Daily business intelligence",
            path: "/morning-brief",
            icon: Sun,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            name: "Why Engine",
            description: "Understand business changes",
            path: "/why",
            icon: Search,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            name: "Risk Engine",
            description: "Monitor important signals",
            path: "/risk",
            icon: ShieldAlert,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            name: "Recommendations",
            description: "Review suggested actions",
            path: "/recommendations",
            icon: Lightbulb,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
    ];

    // ==========================================
    // CHECK ACTIVE AI ROUTE
    // ==========================================

    const isAIActive = aiItems.some(
        (item) => location.pathname === item.path
    );

    const isVyparMindActive =
        location.pathname === "/vyparmind";

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setProfileOpen(false);
        setAiOpen(false);
        setMobileOpen(false);

        navigate("/login", {
            replace: true,
        });
    };

    // ==========================================
    // NAVIGATION HELPERS
    // ==========================================

    const closeMobileMenu = () => {
        setMobileOpen(false);
        setAiOpen(false);
        setProfileOpen(false);
    };

    const openProfile = () => {
        setProfileOpen((previous) => !previous);
        setAiOpen(false);
    };

    const openAI = () => {
        setAiOpen((previous) => !previous);
        setProfileOpen(false);
    };

    const openVyparMind = () => {
        setAiOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);

        navigate("/vyparmind");
    };

    // ==========================================
    // USER INITIAL
    // ==========================================

    const userInitial =
        user?.fullName?.charAt(0)?.toUpperCase() || "U";

    return (
        <nav className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#07110D]/95 backdrop-blur-xl">
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                <div className="flex h-[74px] items-center justify-between">

                    {/* ==========================================
                        LOGO
                    ========================================== */}

                    <button
                        onClick={() => {
                            closeMobileMenu();
                            navigate("/dashboard");
                        }}
                        className="group flex items-center gap-3"
                    >
                        <div className="relative">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-lg shadow-emerald-900/40 transition-all duration-300 group-hover:shadow-emerald-500/30">
                                <Brain
                                    size={23}
                                    className="text-white"
                                    strokeWidth={2.2}
                                />
                            </div>

                            <div className="absolute inset-0 -z-10 rounded-2xl bg-emerald-400/10 blur-xl" />
                        </div>

                        <div className="hidden text-left sm:block">
                            <h1 className="text-[19px] font-bold tracking-tight text-white">
                                Vypar
                                <span className="text-emerald-400">
                                    Intel
                                </span>
                            </h1>

                            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-emerald-500/80">
                                Business Intelligence
                            </p>
                        </div>
                    </button>

                    {/* ==========================================
                        DESKTOP NAVIGATION
                    ========================================== */}

                    <div className="hidden items-center lg:flex">
                        <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-950/80 bg-[#0B1712] p-1.5 shadow-inner">

                            {/* MAIN NAV */}

                            {navItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `
                                            relative
                                            flex items-center gap-2
                                            rounded-xl
                                            px-4 py-2.5
                                            text-sm font-medium
                                            transition-all duration-200
                                            ${
                                                isActive
                                                    ? "bg-emerald-500 text-[#06100B] shadow-lg shadow-emerald-900/30"
                                                    : "text-slate-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                                            }
                                            `
                                        }
                                    >
                                        <Icon size={16} />
                                        <span>{item.name}</span>
                                    </NavLink>
                                );
                            })}

                            {/* ==================================
                                VYPARMIND
                            ================================== */}

                            <div className="relative">
                                <button
                                    onClick={openAI}
                                    className={`
                                        relative
                                        flex items-center gap-2
                                        rounded-xl
                                        px-4 py-2.5
                                        text-sm font-semibold
                                        transition-all duration-200
                                        ${
                                            aiOpen || isAIActive
                                                ? "bg-emerald-500 text-[#06100B] shadow-lg shadow-emerald-900/30"
                                                : "text-emerald-300 hover:bg-emerald-950/50"
                                        }
                                    `}
                                >
                                    <Brain size={16} />

                                    <span>VyparMind</span>

                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform ${
                                            aiOpen
                                                ? "rotate-180"
                                                : ""
                                        }`}
                                    />

                                    {/* AI ACTIVE DOT */}

                                    {isVyparMindActive && !aiOpen && (
                                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#07110D]" />
                                    )}
                                </button>

                                {/* AI DROPDOWN */}

                                {aiOpen && (
                                    <div className="absolute right-0 top-[54px] w-[330px] overflow-hidden rounded-2xl border border-emerald-900/60 bg-[#0B1712] shadow-2xl shadow-black/50">

                                        {/* HEADER */}

                                        <div className="border-b border-emerald-900/50 bg-gradient-to-r from-emerald-950/30 to-transparent p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                                    <Brain size={20} />

                                                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-bold text-white">
                                                        VyparMind
                                                    </p>

                                                    <p className="text-[11px] text-slate-500">
                                                        AI Business Intelligence
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BUSINESS BRAIN FEATURE */}

                                        <div className="p-2 pb-1">
                                            <button
                                                onClick={openVyparMind}
                                                className={`
                                                    group relative flex w-full
                                                    items-center gap-3
                                                    overflow-hidden
                                                    rounded-xl
                                                    border
                                                    p-3
                                                    text-left
                                                    transition-all duration-200
                                                    ${
                                                        isVyparMindActive
                                                            ? "border-emerald-400/30 bg-emerald-500/10"
                                                            : "border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-400/20 hover:bg-emerald-500/10"
                                                    }
                                                `}
                                            >
                                                {/* Glow */}

                                                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20" />

                                                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                                                    <MessageSquare size={19} />

                                                    <Sparkles
                                                        size={10}
                                                        className="absolute -right-1 -top-1 text-emerald-300"
                                                    />
                                                </div>

                                                <div className="relative min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-white">
                                                            Business Brain
                                                        </p>

                                                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                                                            AI
                                                        </span>
                                                    </div>

                                                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                                        Ask anything about your business
                                                    </p>
                                                </div>

                                                <div className="relative text-emerald-400 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100">
                                                    →
                                                </div>
                                            </button>
                                        </div>

                                        {/* AI ITEMS */}

                                        <div className="p-2">
                                            {aiItems
                                                .filter(
                                                    (item) =>
                                                        !item.primary
                                                )
                                                .map((item) => {
                                                    const Icon =
                                                        item.icon;

                                                    return (
                                                        <NavLink
                                                            key={item.name}
                                                            to={item.path}
                                                            onClick={() =>
                                                                setAiOpen(
                                                                    false
                                                                )
                                                            }
                                                            className={({ isActive }) =>
                                                                `
                                                                group
                                                                flex items-center gap-3
                                                                rounded-xl
                                                                p-3
                                                                transition
                                                                ${
                                                                    isActive
                                                                        ? "bg-emerald-500/10"
                                                                        : "hover:bg-emerald-950/40"
                                                                }
                                                                `
                                                            }
                                                        >
                                                            <div
                                                                className={`
                                                                    flex h-10 w-10 shrink-0
                                                                    items-center justify-center
                                                                    rounded-xl
                                                                    ${item.bg}
                                                                    ${item.color}
                                                                `}
                                                            >
                                                                <Icon
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-white">
                                                                    {
                                                                        item.name
                                                                    }
                                                                </p>

                                                                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-0 transition group-hover:opacity-100" />
                                                        </NavLink>
                                                    );
                                                })}
                                        </div>

                                        {/* FOOTER */}

                                        <div className="border-t border-emerald-900/50 p-3">
                                            <button
                                                onClick={() => {
                                                    setAiOpen(false);
                                                    navigate(
                                                        "/dashboard#ai-intelligence"
                                                    );
                                                }}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                                            >
                                                <Brain size={14} />

                                                Open AI Intelligence Center
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                        RIGHT SIDE
                    ========================================== */}

                    <div className="flex items-center gap-2">

                        {/* NOTIFICATION */}

                        <button
                            className="
                                relative
                                flex h-10 w-10
                                items-center justify-center
                                rounded-xl
                                text-slate-400
                                transition-all
                                hover:bg-emerald-950/50
                                hover:text-emerald-300
                            "
                            title="Notifications"
                        >
                            <Bell size={19} />

                            <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#07110D]" />
                        </button>

                        <div className="hidden h-8 w-px bg-emerald-950 sm:block" />

                        {/* PROFILE */}

                        <div className="relative">
                            <button
                                onClick={openProfile}
                                className="
                                    flex items-center gap-2
                                    rounded-xl
                                    px-2 py-1.5
                                    transition-all
                                    hover:bg-emerald-950/50
                                "
                            >
                                <div
                                    className="
                                        flex h-9 w-9
                                        items-center justify-center
                                        rounded-xl
                                        border border-emerald-500/25
                                        bg-emerald-500/10
                                        font-semibold
                                        text-emerald-400
                                    "
                                >
                                    {userInitial}
                                </div>

                                <div className="hidden text-left md:block">
                                    <p className="max-w-28 truncate text-sm font-medium text-white">
                                        {user?.fullName || "User"}
                                    </p>

                                    <p className="text-[10px] text-emerald-500/70">
                                        Business Owner
                                    </p>
                                </div>

                                <ChevronDown
                                    size={15}
                                    className={`
                                        hidden text-slate-500
                                        transition-transform md:block
                                        ${
                                            profileOpen
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                />
                            </button>

                            {/* PROFILE DROPDOWN */}

                            {profileOpen && (
                                <div
                                    className="
                                        absolute
                                        right-0 top-14
                                        w-60
                                        overflow-hidden
                                        rounded-2xl
                                        border border-emerald-900/60
                                        bg-[#0B1712]
                                        shadow-2xl
                                        shadow-black/50
                                    "
                                >
                                    <div className="border-b border-emerald-900/40 bg-emerald-950/20 p-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="
                                                    flex h-10 w-10
                                                    items-center justify-center
                                                    rounded-xl
                                                    border border-emerald-500/20
                                                    bg-emerald-500/15
                                                    font-semibold
                                                    text-emerald-400
                                                "
                                            >
                                                {userInitial}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-white">
                                                    {user?.fullName ||
                                                        "User"}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {user?.email || ""}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setProfileOpen(false);
                                            navigate("/settings");
                                        }}
                                        className="
                                            flex w-full items-center gap-3
                                            px-4 py-3
                                            text-sm text-slate-400
                                            transition
                                            hover:bg-emerald-950/40
                                            hover:text-emerald-300
                                        "
                                    >
                                        <Settings size={17} />

                                        Settings
                                    </button>

                                    <button
                                        onClick={logout}
                                        className="
                                            flex w-full items-center gap-3
                                            border-t border-emerald-950/60
                                            px-4 py-3
                                            text-sm text-red-400
                                            transition
                                            hover:bg-red-500/10
                                            hover:text-red-300
                                        "
                                    >
                                        <LogOut size={17} />

                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* MOBILE MENU */}

                        <button
                            onClick={() => {
                                setMobileOpen(
                                    (previous) => !previous
                                );
                                setProfileOpen(false);
                            }}
                            className="
                                flex h-10 w-10
                                items-center justify-center
                                rounded-xl
                                text-slate-400
                                transition
                                hover:bg-emerald-950/50
                                hover:text-emerald-300
                                lg:hidden
                            "
                        >
                            {mobileOpen ? (
                                <X size={22} />
                            ) : (
                                <Menu size={22} />
                            )}
                        </button>
                    </div>
                </div>

                {/* ==========================================
                    MOBILE NAVIGATION
                ========================================== */}

                {mobileOpen && (
                    <div className="pb-4 lg:hidden">
                        <div
                            className="
                                rounded-2xl
                                border border-emerald-900/50
                                bg-[#0B1712]
                                p-2
                            "
                        >

                            {/* MAIN ITEMS */}

                            {navItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            `
                                            flex items-center gap-3
                                            rounded-xl
                                            px-4 py-3
                                            text-sm font-medium
                                            transition
                                            ${
                                                isActive
                                                    ? "bg-emerald-500 text-[#06100B]"
                                                    : "text-slate-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                                            }
                                            `
                                        }
                                    >
                                        <Icon size={18} />

                                        {item.name}
                                    </NavLink>
                                );
                            })}

                            {/* VYPARMIND */}

                            <div className="mt-2 border-t border-emerald-950/60 pt-2">

                                <div className="mb-2 flex items-center gap-2 px-4 py-2">
                                    <Brain
                                        size={17}
                                        className="text-emerald-400"
                                    />

                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                                        VyparMind AI
                                    </span>
                                </div>

                                {/* BUSINESS BRAIN MOBILE */}

                                <button
                                    onClick={openVyparMind}
                                    className={`
                                        mb-1 flex w-full items-center gap-3
                                        rounded-xl
                                        border
                                        px-4 py-3
                                        text-left
                                        transition
                                        ${
                                            isVyparMindActive
                                                ? "border-emerald-400/20 bg-emerald-500/10"
                                                : "border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-950/40"
                                        }
                                    `}
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <MessageSquare size={17} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-white">
                                                Business Brain
                                            </p>

                                            <span className="rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase text-emerald-400">
                                                AI
                                            </span>
                                        </div>

                                        <p className="text-[10px] text-slate-600">
                                            Ask anything about your business
                                        </p>
                                    </div>
                                </button>

                                {/* OTHER AI ITEMS */}

                                {aiItems
                                    .filter(
                                        (item) =>
                                            !item.primary
                                    )
                                    .map((item) => {
                                        const Icon =
                                            item.icon;

                                        return (
                                            <NavLink
                                                key={item.name}
                                                to={item.path}
                                                onClick={
                                                    closeMobileMenu
                                                }
                                                className={({ isActive }) =>
                                                    `
                                                    flex items-center gap-3
                                                    rounded-xl
                                                    px-4 py-3
                                                    text-sm
                                                    transition
                                                    ${
                                                        isActive
                                                            ? "bg-emerald-500/10 text-emerald-300"
                                                            : "text-slate-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                                                    }
                                                    `
                                                }
                                            >
                                                <div
                                                    className={`
                                                        flex h-9 w-9
                                                        items-center justify-center
                                                        rounded-lg
                                                        ${item.bg}
                                                        ${item.color}
                                                    `}
                                                >
                                                    <Icon size={17} />
                                                </div>

                                                <div>
                                                    <p className="font-medium">
                                                        {item.name}
                                                    </p>

                                                    <p className="text-[10px] text-slate-600">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                </div>
                                            </NavLink>
                                        );
                                    })}
                            </div>

                            {/* MOBILE LOGOUT */}

                            <div className="mt-2 border-t border-emerald-950/60 pt-2">
                                <button
                                    onClick={logout}
                                    className="
                                        flex w-full items-center gap-3
                                        rounded-xl
                                        px-4 py-3
                                        text-sm
                                        text-red-400
                                        transition
                                        hover:bg-red-500/10
                                    "
                                >
                                    <LogOut size={18} />

                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;