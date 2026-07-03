// src/components/Checkout.jsx
import { useState } from "react";
import {
    collection, serverTimestamp, writeBatch,
    doc, increment, getDoc, getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase.js";
import ReceiptModal from "./ReceiptModal";

export default function Checkout({ cart, subtotal, discount, setDiscount, vat, total, orderType, close, onSuccess }) {
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [loading,       setLoading      ] = useState(false);
    const [receipt,       setReceipt      ] = useState(null);
    const [showReceipt,   setShowReceipt  ] = useState(false);

    const discountRates   = { PWD: 0.2, Student: 0.1, Senior: 0.2 };
    const discountPercent = discount ? discountRates[discount] : 0;
    const discountValue   = subtotal * discountPercent;
    const vatValue        = (subtotal - discountValue) * 0.12;
    const totalValue      = subtotal - discountValue + vatValue;

    const handleProcess = async () => {
        if (!cart || cart.length === 0) return;
        setLoading(true);

        try {
            // 1. Stock check
            const checks = await Promise.all(
                cart.map(async (item) => {
                    if (!item.id) return null;
                    const snap  = await getDoc(doc(db, "menuItems", item.id));
                    const stock = Number(snap.data()?.stock || 0);
                    return { name: item.name, requested: Number(item.qty || 0), stock };
                })
            );

            const invalid = checks.filter(
                (c) => c && (c.stock <= 0 || c.requested > c.stock)
            );

            if (invalid.length > 0) {
                const detail = invalid
                    .map((c) => `${c.name}: requested ${c.requested}, stock ${c.stock}`)
                    .join("; ");
                alert(`Cannot process order. Insufficient stock:\n${detail}`);
                return;
            }

            // 2. Batch write: transaction + stock decrement
            const batch = writeBatch(db);

            const orderRefId = `ORD-${Date.now()}`;
            const txRef = doc(collection(db, "transactions"));
            batch.set(txRef, {
                refID:           orderRefId,
                time:            serverTimestamp(),
                status:          "Completed",
                payment:         paymentMethod,
                orderType:       orderType || "Dine In",
                items:           cart.map((i) => ({
                    inventoryId: i.id,
                    name:        i.name,
                    price:       i.price,
                    qty:         i.qty,
                    addOns:      i.addOns || [],
                })),
                subtotal,
                discountType:    discount,
                discountPercent,
                vat:             vatValue,
                total:           totalValue,
            });

            cart.forEach((item) => {
                if (!item.id || Number(item.qty) <= 0) return;
                batch.update(doc(db, "menuItems", item.id), {
                    stock:     increment(-Number(item.qty)),
                    updatedAt: serverTimestamp(),
                });
            });

            await batch.commit();
            const newReceipt = {
                refID: orderRefId,
                time: new Date(),
                payment: paymentMethod,
                orderType: orderType || "Dine In",
                items: cart.map((i) => ({ name: i.name, price: i.price, qty: i.qty, addOns: i.addOns || [] })),
                subtotal,
                discountType: discount,
                discountPercent,
                vat: vatValue,
                total: totalValue,
            };
            setReceipt(newReceipt);
            setShowReceipt(true);
            alert("Transaction Completed! Receipt is ready.");

        } catch (err) {
            console.error(err);
            alert("Failed to process transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
                <h2 className="text-xl font-bold mb-5">Checkout</h2>

                {/* PAYMENT METHOD */}
                <div className="mb-4">
                    <div className="font-semibold mb-2 text-sm">Payment Method</div>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-full"
                    >
                        <option>Cash</option>
                        <option>QRph</option>
                        <option>GCash</option>
                        <option>Card</option>
                    </select>
                </div>

                {/* DISCOUNT */}
                <div className="mb-4">
                    <div className="font-semibold mb-2 text-sm">Discount</div>
                    <div className="flex gap-4 flex-wrap">
                        {Object.keys(discountRates).map((type) => (
                            <label key={type} className="flex items-center gap-1 text-sm">
                                <input type="radio" checked={discount === type} onChange={() => setDiscount(type)} />
                                {type}
                            </label>
                        ))}
                        <label className="flex items-center gap-1 text-sm">
                            <input type="radio" checked={discount === null} onChange={() => setDiscount(null)} />
                            None
                        </label>
                    </div>
                </div>

                {/* TOTALS */}
                <div className="border-t pt-3 text-sm space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Discount:</span>
                        <span>{discount ? `${discount} (−₱${discountValue.toFixed(2)})` : "None"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>VAT (12%):</span><span>₱{vatValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base mt-1">
                        <span>Total:</span><span>₱{totalValue.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleProcess}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                    >
                        {loading ? "Processing..." : "Confirm & Process"}
                    </button>
                    <button
                        onClick={close}
                        className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <ReceiptModal
                open={showReceipt}
                receipt={receipt}
                onClose={() => {
                    setShowReceipt(false);
                    setReceipt(null);
                    if (onSuccess) onSuccess();
                    close();
                }}
            />
        </div>
    );
}
