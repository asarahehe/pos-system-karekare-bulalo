import PointOfSaleTwoToneIcon from "@mui/icons-material/PointOfSaleTwoTone";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import ExitToAppTwoToneIcon from "@mui/icons-material/ExitToAppTwoTone";
import MenuTwoToneIcon from "@mui/icons-material/MenuTwoTone";

import { useNavigate, useLocation } from "react-router-dom";
import DashboardTwoToneIcon from "@mui/icons-material/DashboardTwoTone";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import { useAuth } from "../services/AuthContext";

export default function GlobalHeader({ onMenuClick }) {

    const navigate = useNavigate();
    const location = useLocation();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { role } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
            navigate("/login");
        }
    };

    const inTillMode =
        location.pathname.startsWith("/till") ||
        location.pathname.startsWith("/checkout");

    const inAdminPanel = !location.pathname.startsWith("/till");

    const handleToggle = () => {
        if (inAdminPanel) {
            navigate("/till");
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <header className="shrink-0 bg-iris-100 text-white shadow-md">
            <div className="px-6 py-3 flex justify-between items-center">

                {/* LEFT SIDE (MENU + TILL TABS) */}
                <div className="flex items-center gap-3">

                    {isMobile && onMenuClick && (
                        <IconButton
                            onClick={onMenuClick}
                            sx={{ color: "white" }}
                        >
                            <MenuTwoToneIcon />
                        </IconButton>
                    )}

                    {inTillMode && (
                        <>
                            <button
                                onClick={() => navigate("/till")}
                                className="flex items-center gap-2 bg-beige text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <PointOfSaleTwoToneIcon fontSize="small" />
                                Till
                            </button>

                            <button
                                onClick={() => navigate("/till-transactions")}
                                className="flex items-center gap-2 bg-beige text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <ReceiptLongTwoToneIcon fontSize="small" />
                                Transactions
                            </button>
                        </>
                    )}
                </div>

                {/* RIGHT SIDE (HEADER ACTIONS) */}
                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-sm font-medium uppercase tracking-wide">
                        {role === "owner" ? "Owner"
                            : role === "admin" ? "Admin"
                            : role === "cashier" ? "Cashier"
                            : role === "logistics" ? "Logistics"
                            : "User"}
                    </div>

                    <button
                        onClick={handleToggle}
                        className="flex items-center gap-2 bg-iris-80 px-4 py-2 rounded-lg hover:bg-iris-60 transition"
                    >
                        {inAdminPanel ? (
                            <PointOfSaleTwoToneIcon fontSize="small" />
                        ) : (
                            <DashboardTwoToneIcon fontSize="small" />
                        )}
                        {inAdminPanel ? "Back to Till" : "Dashboard"}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                    >
                        <ExitToAppTwoToneIcon fontSize="small" />
                        Logout
                    </button>

                </div>
            </div>
        </header>
    );
}