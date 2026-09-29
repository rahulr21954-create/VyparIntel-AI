import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        productName: {
            type: String,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        costPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

const saleSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            trim: true,
        },

        items: {
            type: [saleItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Sale must contain at least one item",
            },
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        tax: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        totalCost: {
            type: Number,
            required: true,
            min: 0,
        },

        profit: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "card", "bank", "other"],
            default: "cash",
        },

        customerName: {
            type: String,
            trim: true,
        },

        saleDate: {
            type: Date,
            default: Date.now,
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

saleSchema.index(
    { business: 1, invoiceNumber: 1 },
    { unique: true }
);

saleSchema.index({
    business: 1,
    saleDate: -1,
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;