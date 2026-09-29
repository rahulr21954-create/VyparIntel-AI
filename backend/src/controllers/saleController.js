import Sale from "../models/Sale.js";
import Product from "../models/Product.js";


// ============================
// CREATE SALE
// ============================

const createSale = async (req, res) => {
    try {
        if (!req.user.business) {
            return res.status(400).json({
                success: false,
                message: "Create a business first",
            });
        }

        const {
            invoiceNumber,
            items,
            discount = 0,
            tax = 0,
            paymentMethod = "CASH",
            customerName,
            saleDate,
        } = req.body;

        if (
            !invoiceNumber ||
            !items ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invoice number and sale items are required",
            });
        }

        // Check duplicate invoice
        const existingSale = await Sale.findOne({
            business: req.user.business,
            invoiceNumber,
        });

        if (existingSale) {
            return res.status(409).json({
                success: false,
                message: "Invoice number already exists",
            });
        }

        const processedItems = [];

        let subtotal = 0;
        let totalCost = 0;

        // Process every product
        for (const item of items) {
            const product = await Product.findOne({
                _id: item.product,
                business: req.user.business,
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message:
                        `Product not found: ${item.product}`,
                });
            }

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Quantity must be a positive integer",
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        `${product.name} does not have enough stock`,
                });
            }

            const itemTotal =
                product.sellingPrice * quantity;

            const itemCost =
                product.costPrice * quantity;

            subtotal += itemTotal;
            totalCost += itemCost;

            processedItems.push({
                product: product._id,
                productName: product.name,
                quantity,
                sellingPrice: product.sellingPrice,
                costPrice: product.costPrice,
                total: itemTotal,
            });
        }

        const discountAmount = Number(discount) || 0;
        const taxAmount = Number(tax) || 0;

        const totalAmount =
            subtotal - discountAmount + taxAmount;

        const profit =
            totalAmount - totalCost;

        // Reduce stock only after validation
        for (const item of processedItems) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity,
                    },
                }
            );
        }

        const sale = await Sale.create({
            invoiceNumber,
            items: processedItems,
            subtotal,
            discount: discountAmount,
            tax: taxAmount,
            totalAmount,
            totalCost,
            profit,
            paymentMethod,
            customerName,
            saleDate: saleDate || new Date(),
            business: req.user.business,
        });

        res.status(201).json({
            success: true,
            message: "Sale created successfully",
            sale,
        });

    } catch (error) {
        console.error(
            "Create sale error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// ============================
// GET SALES
// ============================

const getSales = async (req, res) => {
    try {
        if (!req.user.business) {
            return res.status(400).json({
                success: false,
                message: "Create a business first",
            });
        }

        const sales = await Sale.find({
            business: req.user.business,
        })
            .sort({
                saleDate: -1,
            })
            .populate(
                "items.product",
                "name sku category"
            );

        res.status(200).json({
            success: true,
            count: sales.length,
            sales,
        });

    } catch (error) {
        console.error(
            "Get sales error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// ============================
// GET SINGLE SALE
// ============================

const getSale = async (req, res) => {
    try {
        const sale = await Sale.findOne({
            _id: req.params.id,
            business: req.user.business,
        }).populate(
            "items.product",
            "name sku category"
        );

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found",
            });
        }

        res.status(200).json({
            success: true,
            sale,
        });

    } catch (error) {
        console.error(
            "Get sale error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export {
    createSale,
    getSales,
    getSale,
};