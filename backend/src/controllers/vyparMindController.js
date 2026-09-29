import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";
import generateBusinessInsight from "../services/vyparMindService.js";



const getVyparMindInsight = async (req, res) => {
    try {
        const businessId = req.user.business;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "Business not found.",
            });
        }

        const sales = await Sale.find({
            business: businessId,
        });

        const expenses = await Expense.find({
            business: businessId,
        });

        const products = await Product.find({
            business: businessId,
        });


        // -------------------------
        // CALCULATE BUSINESS DATA
        // -------------------------

        let revenue = 0;
        let totalCost = 0;
        let grossProfit = 0;

        sales.forEach((sale) => {
            revenue += sale.totalAmount;
            totalCost += sale.totalCost;
            grossProfit += sale.profit;
        });


        let totalExpenses = 0;

        expenses.forEach((expense) => {
            totalExpenses += expense.amount;
        });


        const netProfit =
            grossProfit - totalExpenses;


        const profitMargin =
            revenue > 0
                ? (netProfit / revenue) * 100
                : 0;


        const lowStockProducts =
            products.filter(
                (product) =>
                    product.stock <=
                    product.minimumStock
            );


        const analytics = {
            revenue,
            totalCost,
            grossProfit,
            totalExpenses,
            netProfit,

            profitMargin: Number(
                profitMargin.toFixed(2)
            ),

            totalSales: sales.length,

            totalExpensesCount:
                expenses.length,

            totalProducts:
                products.length,

            lowStockProducts:
                lowStockProducts.length,
        };


        // -------------------------
        // SEND DATA TO VYPARMIND
        // -------------------------

        const insight =
            await generateBusinessInsight(
                analytics
            );


        res.status(200).json({
            success: true,

            analytics,

            vyparMind: {
                insight,
            },
        });

    } catch (error) {

        console.error(
            "VyparMind Controller Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to generate VyparMind insight.",
        });
    }
};


export {
    getVyparMindInsight,
};