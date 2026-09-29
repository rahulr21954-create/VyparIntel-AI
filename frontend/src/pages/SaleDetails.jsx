import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Receipt,
    User,
    CalendarDays,
    CreditCard,
    Package,
    IndianRupee,
    TrendingUp,
    ShoppingBag,
    Loader2,
    AlertTriangle,
    Hash,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const SaleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSale = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                const response = await api.get(
                    `/api/sales/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setSale(response.data.sale);
                }
            } catch (err) {
                console.error(
                    "Fetch Sale Details Error:",
                    err
                );

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                        "Failed to load sale details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSale();
    }, [id, navigate]);

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatPaymentMethod = (method) => {
        if (!method) return "—";

        const labels = {
            cash: "Cash",
            upi: "UPI",
            card: "Card",
            bank: "Bank Transfer",
            other: "Other",
        };

        return (
            labels[method] ||
            method.charAt(0).toUpperCase() +
                method.slice(1)
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2
                            size={32}
                            className="animate-spin text-emerald-400"
                        />

                        <p className="text-sm text-slate-500">
                            Loading sale details...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="min-h-screen bg-[#07100D] text-white">
                <Navbar />

                <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6">
                    <div className="w-full rounded-[28px] border border-red-500/20 bg-[#0B1712] p-8 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                            <AlertTriangle
                                size={25}
                                className="text-red-400"
                            />
                        </div>

                        <h2 className="text-xl font-semibold">
                            Unable to load sale
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {error ||
                                "Sale not found."}
                        </p>

                        <button
                            onClick={() =>
                                navigate("/sales")
                            }
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100B] transition hover:bg-emerald-400"
                        >
                            <ArrowLeft size={17} />
                            Back to Sales
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const items = sale.items || [];

    const subtotal =
        sale.subtotal ??
        items.reduce(
            (sum, item) =>
                sum +
                Number(item.total || 0),
            0
        );

    const discount = Number(
        sale.discount || 0
    );

    const tax = Number(sale.tax || 0);

    const totalAmount = Number(
        sale.totalAmount ??
            subtotal - discount + tax
    );

    const totalCost = Number(
        sale.totalCost || 0
    );

    const profit = Number(
        sale.profit ??
            totalAmount - totalCost
    );

    const totalUnits = items.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    return (
        <div className="min-h-screen bg-[#07100D] text-white">

            {/* Background */}

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-400/5 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}

                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() =>
                                navigate("/sales")
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-900/50 bg-[#0B1712] text-slate-300 transition hover:border-emerald-500/50 hover:text-white"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Transaction Details
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Sale Details
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Complete transaction information.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-900/40 bg-[#0B1712] px-4 py-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                            <Receipt
                                size={18}
                                className="text-emerald-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-600">
                                Invoice
                            </p>

                            <p className="text-sm font-semibold text-slate-200">
                                {sale.invoiceNumber}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Information */}

                <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <InfoCard
                        icon={Hash}
                        label="Invoice Number"
                        value={
                            sale.invoiceNumber ||
                            "—"
                        }
                    />

                    <InfoCard
                        icon={User}
                        label="Customer"
                        value={
                            sale.customerName ||
                            "Walk-in Customer"
                        }
                    />

                    <InfoCard
                        icon={CalendarDays}
                        label="Sale Date"
                        value={formatDate(
                            sale.saleDate
                        )}
                    />

                    <InfoCard
                        icon={CreditCard}
                        label="Payment"
                        value={formatPaymentMethod(
                            sale.paymentMethod
                        )}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-12">

                    {/* Products */}

                    <section className="overflow-hidden rounded-[28px] border border-emerald-900/40 bg-[#0B1712] shadow-2xl shadow-black/20 xl:col-span-8">

                        <div className="border-b border-slate-800 p-6 sm:p-8">

                            <div className="flex items-center justify-between">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10">
                                        <ShoppingBag
                                            size={22}
                                            className="text-teal-400"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Products
                                        </h2>

                                        <p className="text-sm text-slate-600">
                                            {totalUnits} units sold
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-xl border border-emerald-900/40 bg-[#07100D] px-3 py-2 text-xs font-medium text-slate-500">
                                    {items.length} item
                                    {items.length !==
                                    1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>
                        </div>

                        {/* Desktop Table */}

                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full">

                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-600">
                                        <th className="px-8 py-4 font-medium">
                                            Product
                                        </th>

                                        <th className="px-4 py-4 text-center font-medium">
                                            Qty
                                        </th>

                                        <th className="px-4 py-4 text-right font-medium">
                                            Price
                                        </th>

                                        <th className="px-8 py-4 text-right font-medium">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map(
                                        (item, index) => (
                                            <tr
                                                key={
                                                    item._id ||
                                                    index
                                                }
                                                className="border-b border-slate-800/70 last:border-0"
                                            >
                                                <td className="px-8 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                                            <Package
                                                                size={
                                                                    17
                                                                }
                                                                className="text-emerald-400"
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-slate-200">
                                                                {
                                                                    item.productName
                                                                }
                                                            </p>

                                                            {item.product?.sku && (
                                                                <p className="mt-1 text-xs text-slate-600">
                                                                    SKU:{" "}
                                                                    {
                                                                        item.product.sku
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-5 text-center text-sm text-slate-400">
                                                    {
                                                        item.quantity
                                                    }
                                                </td>

                                                <td className="px-4 py-5 text-right text-sm text-slate-400">
                                                    {formatCurrency(
                                                        item.sellingPrice
                                                    )}
                                                </td>

                                                <td className="px-8 py-5 text-right text-sm font-semibold text-emerald-400">
                                                    {formatCurrency(
                                                        item.total
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Products */}

                        <div className="space-y-3 p-5 md:hidden">

                            {items.map(
                                (item, index) => (
                                    <div
                                        key={
                                            item._id ||
                                            index
                                        }
                                        className="rounded-2xl border border-slate-800 bg-[#07100D] p-4"
                                    >
                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                                <Package
                                                    size={
                                                        17
                                                    }
                                                    className="text-emerald-400"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-slate-200">
                                                    {
                                                        item.productName
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-600">
                                                    {
                                                        item.quantity
                                                    }{" "}
                                                    ×{" "}
                                                    {formatCurrency(
                                                        item.sellingPrice
                                                    )}
                                                </p>
                                            </div>

                                            <p className="font-semibold text-emerald-400">
                                                {formatCurrency(
                                                    item.total
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    {/* Summary */}

                    <section className="h-fit rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20 xl:col-span-4">

                        <div className="mb-7 flex items-center gap-4">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10">
                                <IndianRupee
                                    size={22}
                                    className="text-lime-400"
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold">
                                    Payment Summary
                                </h2>

                                <p className="text-sm text-slate-600">
                                    Transaction breakdown
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">

                            <SummaryRow
                                label="Subtotal"
                                value={formatCurrency(
                                    subtotal
                                )}
                            />

                            <SummaryRow
                                label="Discount"
                                value={`− ${formatCurrency(
                                    discount
                                )}`}
                            />

                            <SummaryRow
                                label="Tax"
                                value={`+ ${formatCurrency(
                                    tax
                                )}`}
                            />

                            <div className="border-t border-emerald-900/40 pt-5">

                                <div className="flex items-end justify-between">

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-600">
                                            Total Amount
                                        </p>

                                        <p className="mt-1 text-3xl font-bold text-white">
                                            {formatCurrency(
                                                totalAmount
                                            )}
                                        </p>
                                    </div>

                                    <TrendingUp
                                        size={25}
                                        className="text-emerald-400"
                                    />
                                </div>
                            </div>

                            {/* Profit */}

                            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Profit
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-emerald-400">
                                            {formatCurrency(
                                                profit
                                            )}
                                        </p>
                                    </div>

                                    <TrendingUp
                                        size={20}
                                        className="text-emerald-400"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-[#07100D] px-4 py-3">

                                <span className="text-xs text-slate-600">
                                    Total Cost
                                </span>

                                <span className="text-sm font-medium text-slate-400">
                                    {formatCurrency(
                                        totalCost
                                    )}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/sales")
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-900/50 bg-[#07100D] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-white"
                        >
                            <ArrowLeft size={16} />
                            Back to Sales
                        </button>
                    </section>
                </div>

                {/* Footer */}

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-700">
                    <TrendingUp size={13} />
                    Sales intelligence by VyparMind AI
                </div>
            </main>
        </div>
    );
};

/* =========================
   INFO CARD
========================= */

const InfoCard = ({
    icon: Icon,
    label,
    value,
}) => {
    return (
        <div className="rounded-2xl border border-emerald-900/40 bg-[#0B1712] p-5">

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Icon
                        size={17}
                        className="text-emerald-400"
                    />
                </div>

                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                        {label}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

/* =========================
   SUMMARY ROW
========================= */

const SummaryRow = ({
    label,
    value,
}) => {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span className="text-sm font-medium text-slate-300">
                {value}
            </span>
        </div>
    );
};

export default SaleDetails;