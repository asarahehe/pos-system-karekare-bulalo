// src/App.jsx
import { useEffect, useState } from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./services/firebase";
import { useAuth } from "./services/AuthContext";

import Layout       from "./components/Layout";
import TillLayout   from "./components/TillLayout";

import Dashboard        from "./pages/Dashboard";
import Graph            from "./pages/Graph";
import Transactions     from "./pages/Transactions";
import Menu             from "./pages/Menu";
import Login            from "./pages/Login";
import Till             from "./pages/Till";
import TillTransactions from "./pages/TillTransactions";
import Checkout         from "./components/Checkout";

function PrivateRoute({ children, requireAdmin = false }) {
    const [loading, setLoading] = useState(true);
    const [user,    setUser   ] = useState(null);
    const { role } = useAuth();
    const adminAccess = role === "admin" || role === "owner";

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-10 text-gray-700">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (requireAdmin && !adminAccess) {
        return (
            <div className="min-h-screen bg-beige p-6 flex items-center justify-center">
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 max-w-md w-full text-center">
                    <p className="mb-4">You do not have permission to access this area.</p>
                    <Link
                        to="/till"
                        className="inline-flex items-center justify-center rounded-lg bg-iris-80 px-4 py-2 text-white hover:bg-iris-60 transition"
                    >
                        Back to Till
                    </Link>
                </div>
            </div>
        );
    }
    return children;
}

export default function App() {
    return (
        <Routes>

            {/* PUBLIC */}
            <Route path="/login" element={<Login />} />

            {/* ADMIN PANEL */}
            <Route
                path="/"
                element={
                    <PrivateRoute requireAdmin>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index             element={<Dashboard    />} />
                <Route path="dashboard"  element={<Dashboard    />} />
                <Route path="graph"      element={<Graph        />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="menu"       element={<Menu         />} />
            </Route>

            {/* POS TILL */}
            <Route
                element={
                    <PrivateRoute>
                        <TillLayout />
                    </PrivateRoute>
                }
            >
                <Route path="/till"              element={<Till             />} />
                <Route path="/till-transactions" element={<TillTransactions />} />
                <Route path="/checkout"          element={<Checkout         />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    );
}
