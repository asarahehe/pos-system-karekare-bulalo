// src/components/CartPanel.jsx
import { useState } from "react";
import AnimateHeight from "react-animate-height";
import Checkout from "./Checkout";
import { CATEGORY_ADDONS } from "../services/menuservice";

const formatAddon = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default function CartPanel({
    cart,
    updateQty,
    removeItem,
    toggleAddon,
    abortOrder,
    blockProcessing = false,
}) {
    const [editingItem,  setEditingItem ] = useState(null);
    const [discountOpen, setDiscountOpen] = useState(false);
    const [discount,     setDiscount    ] = useState(null);
    const [orderType,    setOrderType   ] = useState("Dine In");
    const [showCheckout, setShowCheckout] = useState(false);

    const orderTypes = ["Dine In", "Take Out", "Delivery"];
    const cycleOrderType = () => {
        const currentIdx = orderTypes.indexOf(orderType);
        const nextIdx = (currentIdx + 1) % orderTypes.length;
        setOrderType(orderTypes[nextIdx]);
    };

    const discountRates = { PWD: 0.2, Student: 0.1, Senior: 0.2 };

    const subtotal = cart.reduce((sum, item) => {
        const addonTotal = (item.addOns || []).reduce((s, a) => s + a.price, 0);
        return sum + (item.price + addonTotal) * item.qty;
    }, 0);

    const discountPercent = discount ? discountRates[discount] : 0;
    const discountValue   = subtotal * discountPercent;
    const vat             = (subtotal - discountValue) * 0.12;
    const total           = subtotal - discountValue + vat;

    return (
        <div className="w-full flex flex-col bg-white rounded-2xl shadow-xl">

            {/* HEADER */}
            <div className="p-4 flex justify-between items-center">
                <div className="font-semibold text-lg">Order Details</div>
                <div className="flex gap-2">
                    <button
                        onClick={cycleOrderType}
                        className="px-4 py-1.5 rounded-xl border hover:bg-gray-100 transition text-sm font-semibold text-iris-80"
                    >
                        {orderType}
                    </button>
                    <button
                        onClick={() => abortOrder({ resetOnly: true })}
                        className="px-4 py-1.5 rounded-xl border hover:bg-gray-100 transition text-sm"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {cart.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6 text-center">
                    Add an item to start your order
                </div>
            )}

            {/* CART ITEMS */}
            <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
                {cart.map((item) => {
                    const isOpen   = editingItem === item.id;
                    const addons   = CATEGORY_ADDONS[item.category] || {};
                    const hasAddons = Object.keys(addons).length > 0;

                    return (
                        <div key={item.id} className="border border-gray-300 rounded-xl hover:border-gray-400">
                            <div
                                className="flex cursor-pointer"
                                onClick={() => hasAddons && setEditingItem(isOpen ? null : item.id)}
                            >
                                {/* Thumbnail placeholder */}
                                <div className="p-4 shrink-0">
                                    <div className="w-16 h-16 bg-beige rounded-xl flex items-center justify-center text-2xl">
                                        {item.category === "Main Dishes" ? "🍲"
                                        : item.category === "Side Dishes" ? "🍟"
                                        : item.category === "Desserts"    ? "🍰"
                                        : item.category === "Silog Meals" ? "🍳"
                                        : item.category === "Meryenda"    ? "🍢"
                                        : item.category === "Sidings"     ? "🥗"
                                        : item.category === "Rice"        ? "🍚"
                                        : item.category === "Drinks"      ? "🥤"
                                        : item.category === "Extras"      ? "➕"
                                        : "🍽️"}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between p-4 pl-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-500 mt-1 min-h-4">
                                                {item.addOns?.length > 0
                                                    ? `Add-ons: ${item.addOns.map((a) => a.name).join(", ")}`
                                                    : hasAddons ? "Tap to add extras" : ""}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                            className="text-gray-400 hover:text-black text-lg leading-none"
                                        >×</button>
                                    </div>

                                    <div className="flex justify-between items-end mt-3">
                                        <span className="font-medium text-sm">
                                            ₱{(item.price * item.qty).toFixed(2)}
                                        </span>
                                        <div className="flex items-center gap-1 text-sm">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }}
                                                className="border rounded-md w-7 h-7 flex items-center justify-center hover:bg-gray-100"
                                            >−</button>
                                            <div className="w-6 text-center">{item.qty}</div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }}
                                                className="border rounded-md w-7 h-7 flex items-center justify-center hover:bg-gray-100"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ADD-ONS PANEL */}
                            {hasAddons && (
                                <AnimateHeight duration={300} height={isOpen ? "auto" : 0}>
                                    <div className="border-t border-gray-200 px-4 py-3">
                                        {Object.entries(addons).map(([addon, price]) => (
                                            <label key={addon} className="flex justify-between items-center py-1.5 text-sm">
                                                <span>{addon} {price > 0 && <span className="text-gray-400">(+₱{price})</span>}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={item.addOns?.some((a) => a.name === addon)}
                                                    onChange={() => toggleAddon(item.id, addon, price)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </AnimateHeight>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* TOTALS + ACTIONS */}
            {cart.length > 0 && (
                <div className="border-t border-gray-300 p-4 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-500">
                        <span>Discount:</span>
                        <span>{discount ? `${discount} (${discountPercent * 100}%)` : "—"}</span>
                    </div>
                    <div className="flex justify-between"><span>VAT (12%):</span><span>₱{vat.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold text-base mt-1">
                        <span>Total:</span><span>₱{total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={() => setDiscountOpen(!discountOpen)}
                        className="mt-3 text-sm text-iris-80 underline"
                    >
                        {discountOpen ? "Hide discount" : "Add discount"}
                    </button>

                    <AnimateHeight duration={300} height={discountOpen ? "auto" : 0}>
                        <div className="mt-2 flex flex-col gap-1">
                            {Object.keys(discountRates).map((d) => (
                                <label key={d} className="flex items-center gap-2 text-sm">
                                    <input type="radio" checked={discount === d} onChange={() => setDiscount(d)} />
                                    {d} ({discountRates[d] * 100}% off)
                                </label>
                            ))}
                            <label className="flex items-center gap-2 text-sm">
                                <input type="radio" checked={discount === null} onChange={() => setDiscount(null)} />
                                None
                            </label>
                        </div>
                    </AnimateHeight>

                    {blockProcessing && (
                        <div className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                            One or more items exceed available stock. Please restock or reduce quantity.
                        </div>
                    )}

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setShowCheckout(true)}
                            disabled={blockProcessing}
                            className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
                                blockProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-iris-80 hover:bg-iris-60"
                            }`}
                        >
                            Process
                        </button>
                        <button
                            onClick={abortOrder}
                            className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
                        >
                            Abort
                        </button>
                    </div>
                </div>
            )}

            {showCheckout && (
                <Checkout
                    cart={cart}
                    subtotal={subtotal}
                    discount={discount}
                    setDiscount={setDiscount}
                    vat={vat}
                    total={total}
                    orderType={orderType}
                    close={() => setShowCheckout(false)}
                    onSuccess={() => abortOrder({ resetOnly: true })}
                />
            )}
        </div>
    );
}
