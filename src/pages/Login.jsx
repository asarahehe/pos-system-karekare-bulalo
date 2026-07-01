// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Login() {
    const [email,    setEmail   ] = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError   ] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const auth = getAuth();
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const snap = await getDoc(doc(db, "users", cred.user.uid));
            if (!snap.exists()) throw new Error("User record not found in Firestore");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.message || "Login failed");
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-iris-60 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0)_40%,_rgba(0,0,0,0.3)_100%)] pointer-events-none" />

            <div className="relative bg-white/95 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-iris-80/30">

                {/* BRANDING */}
                <div className="flex flex-col items-center mb-7">
                    <div className="text-5xl mb-2">🍲</div>
                    <h1 className="text-2xl font-bold text-iris-80 text-center">
                        Kare-Kare Bulalo
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">POS System</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-iris-80/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuschia-100 transition"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-iris-80/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuschia-100 transition"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-fuschia-100 text-white py-2 rounded-lg hover:bg-fuschia-80 transition font-semibold shadow-md"
                    >
                        Login
                    </button>
                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                </form>
            </div>
        </div>
    );
}
