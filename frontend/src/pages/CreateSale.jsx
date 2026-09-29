import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingCart,
    Plus,
    Trash2,
    Package,
    IndianRupee,
    User,
    Receipt,
    CreditCard,
    CalendarDays,
    Minus,
    Save,
    Loader2,
    AlertTriangle,
    Boxes,
} from "lucide-react";

import Navbar from "../components/Navbar";
import api from "../api/axios";

const CreateSale = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        invoiceNumber: "",
        customerName: "",
        paymentMethod: "cash",
        saleDate: new Date().toISOString().split("T")[0],
        discount: "",
        tax: "",
    });

    const [items, setItems] = useState([]);

    // =========================
    // FETCH PRODUCTS
    // =========================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);

                const token = localStorage.getItem("token");

                const response = await api.get("/api/products", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setProducts(response.data.products || []);
                }
            } catch (err) {
                console.error(
                    "Fetch Products Error:",
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
                        "Failed to load products."
                );
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, [navigate]);

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // =========================
    // ADD PRODUCT
    // =========================

    const addProduct = (product) => {
        setError("");

        const existing = items.find(
            (item) => item.product === product._id
        );

        if (existing) {
            setItems((prev) =>
                prev.map((item) =>
                    item.product === product._id
                        ? {
                              ...item,
                              quantity: Math.min(
                                  item.quantity + 1,
                                  product.stock
                              ),
                          }
                        : item
                )
            );

            return;
        }

        if (Number(product.stock) <= 0) {
            setError(
                `${product.name} is out of stock.`
            );
            return;
        }

        setItems((prev) => [
            ...prev,
            {
                product: product._id,
                productName: product.name,
                quantity: 1,
                sellingPrice: Number(
                    product.sellingPrice
                ),
                costPrice: Number(product.costPrice),
                stock: Number(product.stock),
            },
        ]);
    };

    // =========================
    // UPDATE QUANTITY
    // =========================

    const updateQuantity = (productId, change) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.product !== productId) {
                    return item;
                }

                const newQuantity =
                    item.quantity + change;

                if (newQuantity < 1) {
                    return item;
                }

                if (newQuantity > item.stock) {
                    setError(
                        `Only ${item.stock} units of ${item.productName} are available.`
                    );

                    return item;
                }

                setError("");

                return {
                    ...item,
                    quantity: newQuantity,
                };
            })
        );
    };

    // =========================
    // DIRECT QUANTITY
    // =========================

    const handleQuantityChange = (
        productId,
        value
    ) => {
        const quantity = Number(value);

        setItems((prev) =>
            prev.map((item) => {
                if (item.product !== productId) {
                    return item;
                }

                if (quantity < 1 || Number.isNaN(quantity)) {
                    return item;
                }

                if (quantity > item.stock) {
                    setError(
                        `Only ${item.stock} units of ${item.productName} are available.`
                    );

                    return {
                        ...item,
                        quantity: item.stock,
                    };
                }

                setError("");

                return {
                    ...item,
                    quantity,
                };
            })
        );
    };

    // =========================
    // REMOVE ITEM
    // =========================

    const removeItem = (productId) => {
        setItems((prev) =>
            prev.filter(
                (item) => item.product !== productId
            )
        );
    };

    // =========================
    // CALCULATIONS
    // =========================

    const calculations = useMemo(() => {
        const subtotal = items.reduce(
            (sum, item) =>
                sum +
                Number(item.sellingPrice) *
                    Number(item.quantity),
            0
        );

        const totalCost = items.reduce(
            (sum, item) =>
                sum +
                Number(item.costPrice) *
                    Number(item.quantity),
            0
        );

        const discount = Math.max(
            0,
            Number(formData.discount) || 0
        );

        const tax = Math.max(
            0,
            Number(formData.tax) || 0
        );

        const totalAmount =
            subtotal - discount + tax;

        const profit =
            totalAmount - totalCost;

        const totalUnits = items.reduce(
            (sum, item) =>
                sum + Number(item.quantity),
            0
        );

        return {
            subtotal,
            totalCost,
            discount,
            tax,
            totalAmount,
            profit,
            totalUnits,
        };
    }, [items, formData.discount, formData.tax]);

    // =========================
    // CURRENCY
    // =========================

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (items.length === 0) {
            setError(
                "Please add at least one product."
            );
            return;
        }

        if (!formData.invoiceNumber.trim()) {
            setError(
                "Please enter an invoice number."
            );
            return;
        }

        if (calculations.totalAmount < 0) {
            setError(
                "Total sale amount cannot be negative."
            );
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            const payload = {
                invoiceNumber:
                    formData.invoiceNumber.trim(),

                customerName:
                    formData.customerName.trim(),

                paymentMethod:
                    formData.paymentMethod,

                saleDate: formData.saleDate,

                discount:
                    calculations.discount,

                tax:
                    calculations.tax,

                items: items.map((item) => ({
                    product: item.product,
                    quantity: Number(item.quantity),
                })),
            };

            const response = await api.post(
                "/api/sales",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSuccess(
                    "Sale created successfully."
                );

                setTimeout(() => {
                    navigate("/sales");
                }, 800);
            }
        } catch (err) {
            console.error(
                "Create Sale Error:",
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
                    "Failed to create sale."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07100D] text-white">

            {/* Background */}

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-400/5 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/sales")
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-900/50 bg-[#0B1712] text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-white"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Revenue Management
                            </p>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Create Sale
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Record a new customer transaction.
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-3 rounded-2xl border border-emerald-900/40 bg-[#0B1712] px-4 py-3 md:flex">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                            <ShoppingCart
                                size={18}
                                className="text-emerald-400"
                            />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Sales Intelligence
                            </p>

                            <p className="text-sm font-semibold text-slate-200">
                                VyparMind AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* =========================
                    ALERTS
                ========================= */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        <AlertTriangle
                            size={18}
                            className="mt-0.5 shrink-0"
                        />

                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="grid gap-6 xl:grid-cols-12">

                        {/* =========================
                            LEFT
                        ========================= */}

                        <div className="space-y-6 xl:col-span-8">

                            {/* Sale Details */}

                            <section className="rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20 sm:p-8">

                                <div className="mb-7 flex items-center gap-4">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                                        <Receipt
                                            size={22}
                                            className="text-emerald-400"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Sale Information
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Enter transaction details
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">

                                    <InputField
                                        label="Invoice Number"
                                        name="invoiceNumber"
                                        value={
                                            formData.invoiceNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. INV-001"
                                        icon={Receipt}
                                        required
                                    />

                                    <InputField
                                        label="Customer Name"
                                        name="customerName"
                                        value={
                                            formData.customerName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Walk-in Customer"
                                        icon={User}
                                    />

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Payment Method
                                        </label>

                                        <div className="relative">
                                            <CreditCard
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                            />

                                            <select
                                                name="paymentMethod"
                                                value={
                                                    formData.paymentMethod
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                className="w-full appearance-none rounded-2xl border border-slate-800 bg-[#07100D] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                                            >
                                                <option value="cash">
                                                    Cash
                                                </option>

                                                <option value="upi">
                                                    UPI
                                                </option>

                                                <option value="card">
                                                    Card
                                                </option>

                                                <option value="bank">
                                                    Bank Transfer
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <InputField
                                        label="Sale Date"
                                        name="saleDate"
                                        type="date"
                                        value={
                                            formData.saleDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        icon={CalendarDays}
                                        required
                                    />
                                </div>
                            </section>

                            {/* Products */}

                            <section className="rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20 sm:p-8">

                                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10">
                                            <Package
                                                size={22}
                                                className="text-teal-400"
                                            />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Products
                                            </h2>

                                            <p className="text-sm text-slate-500">
                                                Add products to this sale
                                            </p>
                                        </div>
                                    </div>

                                    <span className="rounded-xl border border-emerald-900/40 bg-[#07100D] px-3 py-2 text-xs font-medium text-slate-400">
                                        {items.length} product
                                        {items.length !==
                                        1
                                            ? "s"
                                            : ""}
                                    </span>
                                </div>

                                {/* Product Selector */}

                                <div className="mb-6">

                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Add Product
                                    </label>

                                    <select
                                        disabled={
                                            loadingProducts
                                        }
                                        value=""
                                        onChange={(e) => {
                                            const product =
                                                products.find(
                                                    (item) =>
                                                        item._id ===
                                                        e.target
                                                            .value
                                                );

                                            if (product) {
                                                addProduct(
                                                    product
                                                );
                                            }
                                        }}
                                        className="w-full rounded-2xl border border-slate-800 bg-[#07100D] px-4 py-3.5 text-sm text-slate-300 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10"
                                    >
                                        <option value="">
                                            {loadingProducts
                                                ? "Loading products..."
                                                : "Select a product to add"}
                                        </option>

                                        {products.map(
                                            (product) => (
                                                <option
                                                    key={
                                                        product._id
                                                    }
                                                    value={
                                                        product._id
                                                    }
                                                    disabled={
                                                        Number(
                                                            product.stock
                                                        ) <=
                                                        0
                                                    }
                                                >
                                                    {product.name} — ₹
                                                    {product.sellingPrice}{" "}
                                                    | Stock:{" "}
                                                    {
                                                        product.stock
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Selected Products */}

                                {items.length === 0 ? (
                                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-900/40 bg-[#07100D] px-6 text-center">

                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                                            <ShoppingCart
                                                size={24}
                                                className="text-emerald-400"
                                            />
                                        </div>

                                        <p className="font-medium text-slate-300">
                                            No products added
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            Select a product above to start the sale.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">

                                        {items.map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item.product
                                                    }
                                                    className="rounded-2xl border border-slate-800 bg-[#07100D] p-4"
                                                >
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                                                        <div className="flex min-w-0 flex-1 items-center gap-3">

                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                                                <Package
                                                                    size={
                                                                        18
                                                                    }
                                                                    className="text-emerald-400"
                                                                />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-slate-200">
                                                                    {
                                                                        item.productName
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-600">
                                                                    {formatCurrency(
                                                                        item.sellingPrice
                                                                    )}{" "}
                                                                    per unit
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Quantity */}

                                                        <div className="flex items-center rounded-xl border border-slate-800 bg-[#0B1712]">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.product,
                                                                        -1
                                                                    )
                                                                }
                                                                className="flex h-10 w-10 items-center justify-center text-slate-400 transition hover:text-white"
                                                            >
                                                                <Minus
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={
                                                                    item.stock
                                                                }
                                                                value={
                                                                    item.quantity
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleQuantityChange(
                                                                        item.product,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                className="h-10 w-14 border-x border-slate-800 bg-transparent text-center text-sm font-semibold text-white outline-none"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.product,
                                                                        1
                                                                    )
                                                                }
                                                                className="flex h-10 w-10 items-center justify-center text-slate-400 transition hover:text-white"
                                                            >
                                                                <Plus
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>
                                                        </div>

                                                        {/* Stock */}

                                                        <div className="hidden items-center gap-2 text-xs text-slate-600 lg:flex">
                                                            <Boxes
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                            {
                                                                item.stock
                                                            }{" "}
                                                            available
                                                        </div>

                                                        {/* Total */}

                                                        <div className="min-w-[110px] text-right">
                                                            <p className="font-semibold text-emerald-400">
                                                                {formatCurrency(
                                                                    item.sellingPrice *
                                                                        item.quantity
                                                                )}
                                                            </p>
                                                        </div>

                                                        {/* Delete */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.product
                                                                )
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 transition hover:bg-red-500/10"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* =========================
                            RIGHT SUMMARY
                        ========================= */}

                        <div className="space-y-6 xl:col-span-4">

                            {/* Order Summary */}

                            <section className="sticky top-24 rounded-[28px] border border-emerald-900/40 bg-[#0B1712] p-6 shadow-2xl shadow-black/20">

                                <div className="mb-7 flex items-center gap-4">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/10">
                                        <IndianRupee
                                            size={22}
                                            className="text-lime-400"
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Sale Summary
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Live transaction calculation
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">

                                    <SummaryRow
                                        label="Items"
                                        value={`${calculations.totalUnits} units`}
                                    />

                                    <SummaryRow
                                        label="Subtotal"
                                        value={formatCurrency(
                                            calculations.subtotal
                                        )}
                                    />

                                    <div className="border-t border-slate-800 pt-4">
                                        <div className="grid gap-4">

                                            <InputField
                                                label="Discount"
                                                name="discount"
                                                type="number"
                                                min="0"
                                                value={
                                                    formData.discount
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                icon={IndianRupee}
                                            />

                                            <InputField
                                                label="Tax"
                                                name="tax"
                                                type="number"
                                                min="0"
                                                value={
                                                    formData.tax
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="0"
                                                icon={IndianRupee}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-emerald-900/40 pt-5">

                                        <div className="flex items-end justify-between">

                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-600">
                                                    Total Amount
                                                </p>

                                                <p className="mt-1 text-3xl font-bold text-white">
                                                    {formatCurrency(
                                                        calculations.totalAmount
                                                    )}
                                                </p>
                                            </div>

                                            <ShoppingCart
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
                                                    Estimated Profit
                                                </p>

                                                <p className="mt-1 text-xl font-bold text-emerald-400">
                                                    {formatCurrency(
                                                        calculations.profit
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
                                                Live
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        items.length === 0
                                    }
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-[#06100B] shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Creating Sale...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Complete Sale
                                        </>
                                    )}
                                </button>

                                <p className="mt-4 text-center text-xs leading-5 text-slate-600">
                                    Stock will be automatically
                                    updated after the sale is created.
                                </p>
                            </section>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

/* =========================
   INPUT FIELD
========================= */

const InputField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    icon: Icon,
    required = false,
    min,
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
                {label}

                {required && (
                    <span className="ml-1 text-emerald-400">
                        *
                    </span>
                )}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                )}

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    min={min}
                    required={required}
                    className={`w-full rounded-2xl border border-slate-800 bg-[#07100D] py-3.5 ${
                        Icon ? "pl-11" : "pl-4"
                    } pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10`}
                />
            </div>
        </div>
    );
};

/* =========================
   SUMMARY ROW
========================= */

const SummaryRow = ({ label, value }) => {
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

/* =========================
   CURRENCY
========================= */

const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;
};

export default CreateSale;