import "dotenv/config";
import jwt from "jsonwebtoken";

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in .env");
    }

    return process.env.JWT_SECRET;
};

export const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        getJwtSecret(),
        {
            expiresIn: "7d",
        }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(
        token,
        getJwtSecret()
    );
};