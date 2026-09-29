import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Plus,
    Search,
    RefreshCw,
    Edit,
    Trash2,
    AlertTriangle,
    Boxes,
    IndianRupee,
    X,
    ArrowUpRight,
    Layers3,
    CircleDollarSign,
    Activity,
} from "lucide-react";

import api from "../api/axios";
import Navbar from "../components/Navbar";

const Products = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================
    // FETCH PRODUCTS
    // ============================

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login", {
                    replace: true,
                });
                return;
            }

            const response = await api.get(
                "/api/products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setProducts(
                    response.data.products || []
                );
            }
        } catch (err) {
            console.error(
                "Products Error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ============================
    // DELETE PRODUCT
    // ============================

    const handleDelete = async (productId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(productId);
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("token");

            const response = await api.delete(
                `/api/products/${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setProducts((prev) =>
                    prev.filter(
                        (product) =>
                            product._id !== productId
                    )
                );

                setSuccess(
                    "Product deleted successfully."
                );

                setTimeout(() => {
                    setSuccess("");
                }, 3000);
            }
        } catch (err) {
            console.error(
                "Delete Product Error:",
                err
            );

            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to delete product."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // ============================
    // SEARCH
    // ============================

    const filteredProducts = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        if (!query) {
            return products;
        }

        return products.filter((product) =>
            [
                product.name,
                product.sku,
                product.category,
                product.supplier,
            ]
                .filter(Boolean)
                .some((value) =>
                    value
                        .toString()
                        .toLowerCase()
                        .includes(query)
                )
        );
    }, [products, search]);

    // ============================
    // DYNAMIC STATS
    // ============================

    const totalProducts = products.length;

    const totalStock = products.reduce(
        (total, product) =>
            total +
            Number(product.stock || 0),
        0
    );

    const lowStockProducts =
        products.filter(
            (product) =>
                Number(product.stock || 0) <=
                Number(
                    product.minimumStock ?? 5
                )
        );

    const lowStockCount =
        lowStockProducts.length;

    const inventoryValue =
        products.reduce(
            (total, product) =>
                total +
                Number(
                    product.costPrice || 0
                ) *
                    Number(
                        product.stock || 0
                    ),
            0
        );

    // ============================
    // FORMAT CURRENCY
    // ============================

    const formatCurrency = (value) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(Number(value || 0));
    };

    // ============================
    // RENDER
    // ============================

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#07100D] text-white">

            {/* ============================
                BACKGROUND ATMOSPHERE
            ============================ */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />

                <div className="absolute right-[-150px] top-[20%] h-[400px] w-[400px] rounded-full bg-teal-500/[0.05] blur-[120px]" />

            </div>

            <Navbar />

            <main className="relative mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">

                {/* ============================
                    HEADER
                ============================ */}

                <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                    <div>

                        <div className="mb-3 flex items-center gap-2">

                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />

                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Inventory Intelligence
                            </span>

                        </div>

                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Products
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                            Manage your products,
                            pricing and inventory
                            levels from one place.
                        </p>

                    </div>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className="group flex items-center gap-2 rounded-2xl border border-emerald-900/50 bg-[#0C1814] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-950/30 hover:text-emerald-300 disabled:opacity-60"
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : "transition group-hover:rotate-180"
                                }
                            />

                            <span className="hidden sm:inline">
                                Refresh
                            </span>

                        </button>

                        <button
                            onClick={() =>
                                navigate(
                                    "/products/add"
                                )
                            }
                            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06110D] shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400"
                        >

                            <Plus size={18} />

                            <span>
                                Add Product
                            </span>

                        </button>

                    </div>

                </section>

                {/* ============================
                    STAT BOXES
                ============================ */}

                <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-12">

                    {/* TOTAL PRODUCTS */}

                    <StatCard
                        className="xl:col-span-3"
                        icon={
                            <Package
                                size={23}
                            />
                        }
                        title="Total Products"
                        value={totalProducts}
                        description="Products in catalog"
                        accent="emerald"
                    />

                    {/* TOTAL STOCK */}

                    <StatCard
                        className="xl:col-span-3"
                        icon={
                            <Boxes
                                size={23}
                            />
                        }
                        title="Total Stock"
                        value={totalStock.toLocaleString(
                            "en-IN"
                        )}
                        description="Units available"
                        accent="teal"
                    />

                    {/* LOW STOCK */}

                    <StatCard
                        className="xl:col-span-3"
                        icon={
                            <AlertTriangle
                                size={23}
                            />
                        }
                        title="Low Stock"
                        value={lowStockCount}
                        description={
                            lowStockCount > 0
                                ? "Needs attention"
                                : "Inventory healthy"
                        }
                        accent="amber"
                        warning={
                            lowStockCount > 0
                        }
                    />

                    {/* INVENTORY VALUE */}

                    <StatCard
                        className="xl:col-span-3"
                        icon={
                            <IndianRupee
                                size={23}
                            />
                        }
                        title="Inventory Value"
                        value={formatCurrency(
                            inventoryValue
                        )}
                        description="Cost-based value"
                        accent="lime"
                    />

                </section>

                {/* ============================
                    NOTIFICATIONS
                ============================ */}

                {success && (
                    <AlertBox
                        type="success"
                        message={success}
                        onClose={() =>
                            setSuccess("")
                        }
                    />
                )}

                {error && (
                    <AlertBox
                        type="error"
                        message={error}
                        onClose={() =>
                            setError("")
                        }
                    />
                )}

                {/* ============================
                    SEARCH / TOOLBAR
                ============================ */}

                <section className="mt-6 rounded-[24px] border border-slate-800/80 bg-[#0C1814] p-4 shadow-xl sm:p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Layers3
                                        size={18}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold">
                                        Product Catalog
                                    </h2>

                                    <p className="text-xs text-slate-600">
                                        {filteredProducts.length}{" "}
                                        {filteredProducts.length ===
                                        1
                                            ? "product"
                                            : "products"}{" "}
                                        shown
                                    </p>
                                </div>

                            </div>

                        </div>

                        <div className="relative w-full lg:max-w-md">

                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Search product, SKU, category or supplier..."
                                className="w-full rounded-2xl border border-slate-800 bg-[#07100D] py-3 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5"
                            />

                            {search && (
                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-800 hover:text-slate-300"
                                >
                                    <X
                                        size={16}
                                    />
                                </button>
                            )}

                        </div>

                    </div>

                </section>

                {/* ============================
                    PRODUCT TABLE
                ============================ */}

                <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-800/80 bg-[#0C1814] shadow-[0_20px_70px_rgba(0,0,0,0.2)]">

                    {loading ? (

                        <div className="flex min-h-[400px] items-center justify-center">

                            <div className="text-center">

                                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-950 border-t-emerald-400" />

                                <p className="text-sm text-slate-500">
                                    Loading products...
                                </p>

                            </div>

                        </div>

                    ) : filteredProducts.length ===
                      0 ? (

                        <EmptyState
                            hasSearch={Boolean(
                                search
                            )}
                            onAdd={() =>
                                navigate(
                                    "/products/add"
                                )
                            }
                        />

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1000px] text-sm">

                                <thead>

                                    <tr className="border-b border-slate-800 bg-[#09140F] text-left">

                                        <th className="px-6 py-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Product
                                        </th>

                                        <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            SKU
                                        </th>

                                        <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Category
                                        </th>

                                        <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Pricing
                                        </th>

                                        <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Stock
                                        </th>

                                        <th className="px-5 py-5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Supplier
                                        </th>

                                        <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-800/70">

                                    {filteredProducts.map(
                                        (
                                            product
                                        ) => {

                                            const stock =
                                                Number(
                                                    product.stock ||
                                                        0
                                                );

                                            const minimumStock =
                                                Number(
                                                    product.minimumStock ??
                                                        5
                                                );

                                            const isLowStock =
                                                stock <=
                                                minimumStock;

                                            const stockPercentage =
                                                minimumStock >
                                                0
                                                    ? Math.min(
                                                          (stock /
                                                              (minimumStock *
                                                                  3)) *
                                                              100,
                                                          100
                                                      )
                                                    : 100;

                                            return (
                                                <tr
                                                    key={
                                                        product._id
                                                    }
                                                    className="group transition hover:bg-emerald-950/[0.12]"
                                                >

                                                    {/* PRODUCT */}

                                                    <td className="px-6 py-5">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-900/40 bg-emerald-500/[0.07] text-emerald-400 transition group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10">
                                                                <Package
                                                                    size={
                                                                        19
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="max-w-[220px] truncate font-semibold text-slate-200">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </p>

                                                                {product.description && (
                                                                    <p className="mt-1 max-w-[220px] truncate text-xs text-slate-600">
                                                                        {
                                                                            product.description
                                                                        }
                                                                    </p>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* SKU */}

                                                    <td className="px-5 py-5">

                                                        <span className="rounded-lg border border-slate-800 bg-[#07100D] px-2.5 py-1.5 font-mono text-xs text-slate-500">
                                                            {
                                                                product.sku
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* CATEGORY */}

                                                    <td className="px-5 py-5">

                                                        <span className="rounded-full border border-teal-900/40 bg-teal-500/[0.06] px-3 py-1.5 text-xs font-medium text-teal-400">
                                                            {
                                                                product.category
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* PRICING */}

                                                    <td className="px-5 py-5">

                                                        <p className="font-semibold text-slate-200">
                                                            {formatCurrency(
                                                                product.sellingPrice
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-600">
                                                            Cost:{" "}
                                                            {formatCurrency(
                                                                product.costPrice
                                                            )}
                                                        </p>

                                                    </td>

                                                    {/* STOCK */}

                                                    <td className="px-5 py-5">

                                                        <div className="min-w-[140px]">

                                                            <div className="mb-2 flex items-center justify-between">

                                                                <span
                                                                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                                                                        isLowStock
                                                                            ? "text-amber-400"
                                                                            : "text-emerald-400"
                                                                    }`}
                                                                >

                                                                    {isLowStock && (
                                                                        <AlertTriangle
                                                                            size={
                                                                                13
                                                                            }
                                                                        />
                                                                    )}

                                                                    {
                                                                        product.stock
                                                                    }{" "}
                                                                    {
                                                                        product.unit
                                                                    }

                                                                </span>

                                                                <span className="text-[10px] text-slate-700">
                                                                    Min{" "}
                                                                    {
                                                                        product.minimumStock
                                                                    }
                                                                </span>

                                                            </div>

                                                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        isLowStock
                                                                            ? "bg-amber-400"
                                                                            : "bg-emerald-400"
                                                                    }`}
                                                                    style={{
                                                                        width: `${Math.max(
                                                                            stockPercentage,
                                                                            5
                                                                        )}%`,
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* SUPPLIER */}

                                                    <td className="px-5 py-5">

                                                        <span className="text-slate-500">
                                                            {
                                                                product.supplier ||
                                                                    "—"
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-6 py-5">

                                                        <div className="flex justify-end gap-2">

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/products/edit/${product._id}`
                                                                    )
                                                                }
                                                                className="rounded-xl border border-slate-800 bg-[#07100D] p-2.5 text-slate-500 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                                                                title="Edit product"
                                                            >
                                                                <Edit
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product._id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    product._id
                                                                }
                                                                className="rounded-xl border border-slate-800 bg-[#07100D] p-2.5 text-slate-500 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                                                title="Delete product"
                                                            >

                                                                {deletingId ===
                                                                product._id ? (
                                                                    <RefreshCw
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

                {/* ============================
                    FOOTER
                ============================ */}

                <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-emerald-950/50 py-6 text-xs text-slate-600 sm:flex-row">

                    <p>
                        ©{" "}
                        {new Date().getFullYear()}{" "}
                        VyparIntel
                    </p>

                    <p className="flex items-center gap-1.5">
                        Inventory intelligence by
                        <span className="font-semibold text-emerald-500">
                            VyparMind AI
                        </span>
                    </p>

                </footer>

            </main>
        </div>
    );
};


// ========================================
// STAT CARD
// ========================================

const StatCard = ({
    icon,
    title,
    value,
    description,
    accent = "emerald",
    warning = false,
    className = "",
}) => {

    const accentStyles = {

        emerald: {
            border: "hover:border-emerald-500/40",
            icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
            glow: "bg-emerald-500/[0.06]",
            value: "text-white",
        },

        teal: {
            border: "hover:border-teal-500/40",
            icon: "bg-teal-500/10 text-teal-400 border-teal-500/10",
            glow: "bg-teal-500/[0.06]",
            value: "text-white",
        },

        amber: {
            border: "hover:border-amber-500/40",
            icon: "bg-amber-500/10 text-amber-400 border-amber-500/10",
            glow: "bg-amber-500/[0.06]",
            value: warning
                ? "text-amber-400"
                : "text-white",
        },

        lime: {
            border: "hover:border-lime-500/40",
            icon: "bg-lime-500/10 text-lime-400 border-lime-500/10",
            glow: "bg-lime-500/[0.06]",
            value: "text-white",
        },
    };

    const style =
        accentStyles[accent] ||
        accentStyles.emerald;

    return (
        <div
            className={`group relative overflow-hidden rounded-[26px] border border-slate-800/80 bg-[#0C1814] p-6 shadow-lg transition duration-300 hover:-translate-y-1 ${style.border} ${className}`}
        >

            <div
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition group-hover:opacity-100 ${style.glow}`}
            />

            <div className="relative">

                <div className="flex items-start justify-between">

                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.icon}`}
                    >
                        {icon}
                    </div>

                    {warning && (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                            Attention
                        </span>
                    )}

                </div>

                <p className="mt-6 text-xs font-medium uppercase tracking-wider text-slate-600">
                    {title}
                </p>

                <p
                    className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${style.value}`}
                >
                    {value}
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">

                    <Activity
                        size={12}
                        className={
                            accent === "amber"
                                ? "text-amber-500"
                                : "text-emerald-500"
                        }
                    />

                    {description}

                </div>

            </div>
        </div>
    );
};


// ========================================
// ALERT BOX
// ========================================

const AlertBox = ({
    type,
    message,
    onClose,
}) => {

    const isSuccess =
        type === "success";

    return (
        <div
            className={`mt-5 flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm ${
                isSuccess
                    ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
                    : "border-red-500/20 bg-red-500/[0.07] text-red-400"
            }`}
        >

            <div className="flex items-center gap-2">

                {isSuccess ? (
                    <Activity
                        size={16}
                    />
                ) : (
                    <AlertTriangle
                        size={16}
                    />
                )}

                <span>{message}</span>

            </div>

            <button
                onClick={onClose}
                className="rounded-lg p-1 transition hover:bg-white/5"
            >
                <X size={16} />
            </button>

        </div>
    );
};


// ========================================
// EMPTY STATE
// ========================================

const EmptyState = ({
    hasSearch,
    onAdd,
}) => {

    return (
        <div className="flex min-h-[430px] items-center justify-center px-6 py-16">

            <div className="max-w-md text-center">

                <div className="relative mx-auto mb-6 w-fit">

                    <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 blur-2xl" />

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-900/40 bg-emerald-500/[0.07] text-emerald-400">
                        <Package size={34} />
                    </div>

                </div>

                <h3 className="text-lg font-semibold text-slate-200">
                    {hasSearch
                        ? "No products found"
                        : "Your inventory is empty"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {hasSearch
                        ? "Try searching with another product name, SKU, category or supplier."
                        : "Add your first product to start building your inventory intelligence."}
                </p>

                {!hasSearch && (
                    <button
                        onClick={onAdd}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06110D] transition hover:bg-emerald-400"
                    >
                        <Plus size={17} />
                        Add First Product
                        <ArrowUpRight
                            size={15}
                        />
                    </button>
                )}

            </div>

        </div>
    );
};

export default Products;