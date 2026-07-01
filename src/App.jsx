// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./services/firebase";

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

function PrivateRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [user,    setUser   ] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="p-10 text-gray-700">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
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
                    <PrivateRoute>
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
