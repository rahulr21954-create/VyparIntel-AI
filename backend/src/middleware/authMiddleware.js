import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No authentication token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select(
            "-password"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Auth Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
};

export default protect;