import Product from "../models/Product.js";


// ============================
// CREATE PRODUCT
// ============================

const createProduct = async (req, res) => {
    try {
        if (!req.user.business) {
            return res.status(400).json({
                success: false,
                message: "Create a business first",
            });
        }

        const {
            name,
            sku,
            category,
            description,
            costPrice,
            sellingPrice,
            stock,
            minimumStock,
            unit,
            supplier,
        } = req.body;

        if (
            !name ||
            !sku ||
            !category ||
            costPrice === undefined ||
            sellingPrice === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, SKU, category, cost price and selling price are required",
            });
        }

        const existingProduct = await Product.findOne({
            business: req.user.business,
            sku: sku.trim(),
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product SKU already exists",
            });
        }

        const product = await Product.create({
            name,
            sku: sku.trim(),
            category,
            description,
            costPrice,
            sellingPrice,
            stock: stock ?? 0,
            minimumStock: minimumStock ?? 5,
            unit: unit || "piece",
            supplier,
            business: req.user.business,
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });

    } catch (error) {
        console.error(
            "Create product error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// ============================
// GET ALL PRODUCTS
// ============================

const getProducts = async (req, res) => {
    try {
        if (!req.user.business) {
            return res.status(400).json({
                success: false,
                message: "Create a business first",
            });
        }

        const products = await Product.find({
            business: req.user.business,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });

    } catch (error) {
        console.error(
            "Get products error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// ============================
// GET SINGLE PRODUCT
// ============================

const getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            business: req.user.business,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {
        console.error(
            "Get product error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// ============================
// UPDATE PRODUCT
// ============================

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            business: req.user.business,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const allowedFields = [
            "name",
            "sku",
            "category",
            "description",
            "costPrice",
            "sellingPrice",
            "stock",
            "minimumStock",
            "unit",
            "supplier",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
        });

    } catch (error) {
        console.error(
            "Update product error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


// ============================
// DELETE PRODUCT
// ============================

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            business: req.user.business,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete product error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
};