import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        address: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },

        pincode: {
            type: String,
            trim: true,
        },

        gstin: {
            type: String,
            trim: true,
            uppercase: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Business = mongoose.model(
    "Business",
    businessSchema
);

export default Business;