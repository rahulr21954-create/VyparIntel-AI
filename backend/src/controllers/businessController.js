import Business from "../models/Business.js";
import User from "../models/User.js";

const createBusiness = async (req, res) => {
    try {
        const {
            name,
            category,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            gstin,
            currency,
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: "Business name and category are required",
            });
        }

        // Check whether user already has a business
        if (req.user.business) {
            return res.status(400).json({
                success: false,
                message: "User already has a business",
            });
        }

        const business = await Business.create({
            name,
            category,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            gstin,
            currency: currency || "INR",
            owner: req.user._id,
        });

        // Attach business to user
        await User.findByIdAndUpdate(
            req.user._id,
            {
                business: business._id,
            }
        );

        res.status(201).json({
            success: true,
            message: "Business created successfully",
            business,
        });

    } catch (error) {
        console.error(
            "Create business error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


const getMyBusiness = async (req, res) => {
    try {
        if (!req.user.business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        const business = await Business.findById(
            req.user.business
        );

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            });
        }

        res.status(200).json({
            success: true,
            business,
        });

    } catch (error) {
        console.error(
            "Get business error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export {
    createBusiness,
    getMyBusiness,
};