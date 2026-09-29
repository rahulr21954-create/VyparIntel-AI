import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import "./index.css";

import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import BusinessSetup from "./pages/BusinessSetup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Products from "./pages/Products.jsx";
import AddProduct from "./pages/AddProduct.jsx";
import EditProduct from "./pages/EditProduct.jsx";
import Sales from "./pages/Sales.jsx";
import CreateSale from "./pages/CreateSale.jsx";
import SaleDetails from "./pages/SaleDetails.jsx";
import Expenses from "./pages/Expenses.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import Analytics from "./pages/Analytics.jsx";
import VyparMindAI from "./pages/VyparMind.jsx";
import WhyEngine from "./pages/WhyEngine.jsx";
import RiskEngine from "./pages/RiskEngine.jsx";
import RecommendationEngine from "./pages/RecommendationEngine.jsx";
import MorningBrief from "./components/MorningBrief.jsx";
import ActionCenter from "./pages/ActionCenter.jsx";
import BusinessDecision from "./pages/BusinessDecision.jsx";

const router = createBrowserRouter([
     {
        path: "/",
        element: (
            <ProtectedRoute>
                <Navigate to="/dashboard" replace />
            </ProtectedRoute>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/business-setup",
        element: (
            <ProtectedRoute>
                <BusinessSetup />
            </ProtectedRoute>
        ),
    },
    {
    path: "/products",
    element: (
        <ProtectedRoute>
            <Products />
        </ProtectedRoute>
    ),
},
{
    path: "/products/add",
    element: (
        <ProtectedRoute>
            <AddProduct />
        </ProtectedRoute>
    ),
},
{
    path: "/products/edit/:id",
    element: (
        <ProtectedRoute>
            <EditProduct />
        </ProtectedRoute>
    ),
},
{
    path: "/sales",
    element: (
        <ProtectedRoute>
            <Sales />
        </ProtectedRoute>
    ),
},
{
    path: "/sales/create",
    element: (
        <ProtectedRoute>
            <CreateSale />
        </ProtectedRoute>
    ),
},
{
    path: "/sales/:id",
    element: (
        <ProtectedRoute>
            <SaleDetails />
        </ProtectedRoute>
    ),
},
{
    path:"/expenses",
    element: (
        <ProtectedRoute>
            <Expenses />
        </ProtectedRoute>
    ),
},
{
    path: "/expenses/create",
    element: (
        <ProtectedRoute>
            <AddExpense />
        </ProtectedRoute>
    ),
},
{
    path: "/analytics",
    element: (
        <ProtectedRoute>
            <Analytics />
        </ProtectedRoute>
    ),
},

{
    path: "/why",
    element: (
        <ProtectedRoute>
            <WhyEngine />
        </ProtectedRoute>
    ),
},
{
    path: "/risk",
    element: (
        <ProtectedRoute>
            <RiskEngine />
        </ProtectedRoute>
    ),
},
{
    path: "/recommendations",
    element: (
        <ProtectedRoute>
            <RecommendationEngine />
        </ProtectedRoute>
    ),
},
{
    path: "/morning-brief",
    element: (
        <ProtectedRoute>
            <MorningBrief />
        </ProtectedRoute>
    ),
},
{
    path: "/action-center",
    element: (
        <ProtectedRoute>
            <ActionCenter />
        </ProtectedRoute>
    ),
},
{
    path: "/business-decision",
    element: (
        <ProtectedRoute>
            <BusinessDecision />
        </ProtectedRoute>
    ),
},
{
    path: "/vyparmind",
    element: (
        <ProtectedRoute>
            <VyparMindAI />
        </ProtectedRoute>
    ),
},

]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);