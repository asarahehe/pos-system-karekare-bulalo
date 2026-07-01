import { Outlet } from "react-router-dom";
import GlobalHeader from "./GlobalHeader";

export default function TillLayout() {

    return (
        <div className="h-screen flex flex-col bg-beige">

            {/* GLOBAL HEADER */}
            <GlobalHeader />

            {/* PAGE CONTENT */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>

        </div>
    );
}