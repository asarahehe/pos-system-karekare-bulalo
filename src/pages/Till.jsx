// src/pages/Till.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import TillProducts from "../components/TillProducts";
import CartPanel    from "../components/CartPanel";

export default function Till() {
    const [menuItems,   setMenuItems  ] = useState([]);
    const [cart,        setCart       ] = useState([]);
    const [stockNotice, setStockNotice] = useState("");

    // Real-time listener on menuItems
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "menuItems"), (snapshot) => {
            setMenuItems(
                snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
            );
        });
        return () => unsub();
    }, []);

    const notify = (msg) => {
        setStockNotice(msg);
        setTimeout(() => setStockNotice(""), 2500);
    };

    const getAvailableStock = (id) =>
        Number(menuItems.find((i) => i.id === id)?.stock || 0);

    const getCartQty = (id) =>
        Number(cart.find((i) => i.id === id)?.qty || 0);

    const addToCart = (item) => {
        const available = getAvailableStock(item.id);
        const inCart    = getCartQty(item.id);

        if (available <= 0) {
            notify(`${item.name} is out of stock.`);
            return;
        }
        if (inCart + 1 > available) {
            notify(`Only ${available} ${item.name} available.`);
            return;
        }

        const exists = cart.find((i) => i.id === item.id);
        if (exists) {
            setCart(cart.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { ...item, qty: 1, addOns: [] }]);
        }
    };

    const updateQty = (id, delta) => {
        setCart(
            cart.map((item) => {
                if (item.id !== id) return item;
                const next = item.qty + delta;
                if (next <= 0) return null;
                if (delta > 0 && next > getAvailableStock(id)) {
                    notify(`Only ${getAvailableStock(id)} ${item.name} available.`);
                    return item;
                }
                return { ...item, qty: next };
            }).filter(Boolean)
        );
    };

    const removeItem  = (id) => setCart(cart.filter((i) => i.id !== id));

    const toggleAddon = (itemId, addon, price) => {
        setCart(cart.map((i) => {
            if (i.id !== itemId) return i;
            const exists = i.addOns?.find((a) => a.name === addon);
            return exists
                ? { ...i, addOns: i.addOns.filter((a) => a.name !== addon) }
                : { ...i, addOns: [...(i.addOns || []), { name: addon, price }] };
        }));
    };

    const subtotal = cart.reduce((sum, item) => {
        const addonTotal = (item.addOns || []).reduce((s, a) => s + a.price, 0);
        return sum + (item.price + addonTotal) * item.qty;
    }, 0);

    const hasStockConflict = cart.some((item) => item.qty > getAvailableStock(item.id));

    return (
        <div className="flex flex-col lg:flex-row h-full bg-beige p-4 lg:p-6 gap-4 lg:gap-6">

            {/* LEFT: PRODUCT GRID */}
            <div className="flex-1 flex flex-col gap-3">
                {stockNotice && (
                    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {stockNotice}
                    </div>
                )}
                <TillProducts inventory={menuItems} addToCart={addToCart} />
            </div>

            {/* RIGHT: CART */}
            <div className="w-full lg:w-[440px] flex-shrink-0">
                <CartPanel
                    cart={cart}
                    updateQty={updateQty}
                    removeItem={removeItem}
                    toggleAddon={toggleAddon}
                    blockProcessing={hasStockConflict}
                    abortOrder={({ status, resetOnly } = {}) => {
                        if (resetOnly) { setCart([]); return; }
                        // Save cancelled order to Firestore
                        addDoc(collection(db, "transactions"), {
                            refID:    `ORD-${Date.now()}`,
                            time:     serverTimestamp(),
                            status:   status || "Cancelled",
                            payment:  "cash",
                            items:    cart,
                            subtotal,
                            discount: 0,
                            vat:      0,
                            total:    0,
                        });
                        setCart([]);
                    }}
                />
            </div>

        </div>
    );
}
