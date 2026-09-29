import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Receipt,
    BarChart3,
    LogOut,
    X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Analytics",
            path: "/analytics",
            icon: BarChart3,
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
    ];

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed
                    inset-y-0
                    left-0
                    z-50
                    w-64
                    bg-slate-900
                    border-r
                    border-slate-800
                    flex
                    flex-col
                    transform
                    transition-transform
                    duration-300
                    lg:translate-x-0
                    ${
                        mobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >
                {/* Logo */}

                <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">

                    <div>
                        <h1 className="text-xl font-bold text-white">
                            Vypar
                            <span className="text-blue-500">
                                Intel
                            </span>
                        </h1>

                        <p className="text-xs text-slate-500">
                            Powered by VyparMind
                        </p>
                    </div>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* Navigation */}

                <nav className="flex-1 p-4 space-y-2">

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                                className={`
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    rounded-xl
                                    transition
                                    ${
                                        isActive(item.path)
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }
                                `}
                            >
                                <Icon size={19} />

                                <span>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}

                </nav>

                {/* Logout */}

                <div className="p-4 border-t border-slate-800">

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
                    >
                        <LogOut size={19} />

                        Logout
                    </button>

                </div>

            </aside>
        </>
    );
};

export default Sidebar;