// src/components/Layout.jsx
import DashboardTwoToneIcon  from "@mui/icons-material/DashboardTwoTone";
import AreaChartTwoToneIcon  from "@mui/icons-material/AreaChartTwoTone";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import RestaurantMenuTwoToneIcon from "@mui/icons-material/RestaurantMenuTwoTone";
import HomeTwoToneIcon       from "@mui/icons-material/HomeTwoTone";

import { useState } from "react";
import GlobalHeader from "./GlobalHeader";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";

export default function Layout() {
    const navigate  = useNavigate();
    const theme     = useTheme();
    const isMobile  = useMediaQuery(theme.breakpoints.down("sm"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { role } = useAuth();

    const navItems = [
        { icon: DashboardTwoToneIcon,     label: "Dashboard",    path: "/dashboard"    },
        { icon: AreaChartTwoToneIcon,      label: "Diagrams",     path: "/graph"        },
        { icon: ReceiptLongTwoToneIcon,    label: "Transactions", path: "/transactions" },
        ...(role === "admin" || role === "owner" ? [
            { icon: RestaurantMenuTwoToneIcon, label: "Menu", path: "/menu" }
        ] : []),
    ];

    const navigation = (
        <>
            <div className="flex flex-col items-center mb-10">
                {/* Logo placeholder — replace src with your actual logo */}
                <div className="w-28 h-28 rounded-full bg-iris-80 flex items-center justify-center mb-3">
                    <span className="text-white text-4xl">🍲</span>
                </div>
                <span className="text-2xl font-bold text-iris-60 text-center leading-tight">
                    Kare-Kare<br/>Bulalo
                </span>
            </div>

            <nav className="flex flex-col gap-3">
                {navItems.map(({ icon, label, path }, idx) => {
                    const IconComponent = icon;
                    return (
                        <NavLink
                            key={idx}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                                text-iris-80 transition
                                ${isActive
                                    ? "bg-linear-to-r from-wine-100 to-wine-80 text-white shadow"
                                    : "bg-white shadow hover:bg-iris-80/10"}
                            `}
                        >
                            <IconComponent fontSize="small" />
                            {label}
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );

    return (
        <div className="h-screen flex flex-col bg-iris-60 overflow-hidden">

            <GlobalHeader onMenuClick={() => setMobileOpen(!mobileOpen)} />

            <div className="flex flex-1 overflow-hidden">

                {/* DESKTOP SIDEBAR */}
                {!isMobile && (
                    <aside className="w-64 shrink-0 bg-beige shadow-sm border-r border-iris-80/50 flex flex-col px-4 py-6">
                        {navigation}
                    </aside>
                )}

                {/* MOBILE DRAWER */}
                {isMobile && (
                    <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
                        <div className="w-64 px-4 py-6 bg-beige h-full">
                            {navigation}
                        </div>
                    </Drawer>
                )}

                {/* MAIN CONTENT */}
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="shrink-0 bg-beige border-b border-gray-200">
                        <div className="px-6 py-3 flex justify-between items-center">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-iris-100 hover:text-fuschia-100 font-medium transition"
                            >
                                <HomeTwoToneIcon fontSize="small" />
                                Home
                            </button>
                        </div>
                    </div>

                    <main className="flex-1 overflow-y-auto bg-linear-to-t from-stone-50/70 to-white/80">
                        <Outlet />
                    </main>
                </div>

            </div>
        </div>
    );
}
