import { useState } from "react";
import { Menu, RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const location = useLocation();

    const [user] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user")
            );
        } catch {
            return null;
        }
    });

    const getPageTitle = () => {
        const path = location.pathname;

        if (path === "/dashboard") {
            return "Dashboard";
        }

        if (path === "/products") {
            return "Products";
        }

        if (path === "/products/add") {
            return "Add Product";
        }

        if (path.includes("/products/edit")) {
            return "Edit Product";
        }

        if (path === "/sales") {
            return "Sales";
        }

        if (path === "/expenses") {
            return "Expenses";
        }

        if (path === "/analytics") {
            return "Analytics";
        }

        return "VyparIntel";
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Sidebar */}

            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main content */}

            <main className="lg:ml-64">

                {/* Top Navbar */}

                <header className="h-20 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur">

                    <div className="flex items-center gap-4">

                        {/* Mobile menu */}

                        <button
                            onClick={() =>
                                setMobileOpen(true)
                            }
                            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <h2 className="text-xl font-semibold">
                                {getPageTitle()}
                            </h2>

                            <p className="hidden sm:block text-sm text-slate-500">
                                Manage your business
                            </p>
                        </div>

                    </div>

                    {/* User */}

                    <div className="flex items-center gap-3">

                        <div className="hidden sm:block text-right">

                            <p className="text-sm font-medium">
                                {user?.fullName ||
                                    "Business Owner"}
                            </p>

                            <p className="text-xs text-slate-500">
                                Business Owner
                            </p>

                        </div>

                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                            {user?.fullName
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                        </div>

                    </div>

                </header>

                {/* Page */}

                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>

            </main>

        </div>
    );
};

export default Layout;