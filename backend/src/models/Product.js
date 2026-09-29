import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        costPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        minimumStock: {
            type: Number,
            required: true,
            min: 0,
            default: 5,
        },

        unit: {
            type: String,
            default: "piece",
            trim: true,
        },

        supplier: {
            type: String,
            trim: true,
        },

        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index(
    { business: 1, sku: 1 },
    { unique: true }
);

const Product = mongoose.model(
    "Product",
    productSchema
);

export default Product;