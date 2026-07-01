import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                const snap = await getDoc(doc(db, "users", firebaseUser.uid));
                setRole(snap.exists() ? snap.data().role : "cashier");
                setUser(firebaseUser);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
