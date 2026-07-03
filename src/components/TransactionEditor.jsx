// src/components/TransactionEditor.jsx
import { useState, useEffect } from "react";
import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";
import AnimateHeight from "react-animate-height";
import { CATEGORY_ADDONS } from "../services/menuservice";

export default function TransactionEditor({ open, transaction, onClose, onSave }) {
    const [edited, setEdited] = useState(transaction);

    useEffect(() => { setEdited(transaction); }, [transaction]);

    if (!open || !transaction || !edited) return null;

    const updateQty = (idx, delta) => {
        const newItems = [...edited.items];
        newItems[idx].quantity = Math.max(1, (newItems[idx].quantity || 1) + delta);
        setEdited({ ...edited, items: newItems });
    };

    const toggleAddon = (itemIdx, addonName, price) => {
        const newItems = [...edited.items];
        const item = newItems[itemIdx];
        if (!item.addOns) item.addOns = [];
        const idx = item.addOns.findIndex((a) => a.name === addonName);
        if (idx > -1) item.addOns.splice(idx, 1);
        else item.addOns.push({ name: addonName, price });
        setEdited({ ...edited, items: newItems });
    };

    const removeItem = (idx) =>
        setEdited({ ...edited, items: edited.items.filter((_, i) => i !== idx) });

    const computeItemTotal = (item) => {
        const addonTotal = (item.addOns || []).reduce((s, a) => s + (a.price || 0), 0);
        return (item.price + addonTotal) * (item.quantity || 1);
    };

    const subtotal = edited.items?.reduce((s, i) => s + computeItemTotal(i), 0) || 0;
    const vat      = subtotal * 0.12;
    const total    = subtotal + vat;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-6 relative flex gap-6 max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                >
                    <CloseTwoToneIcon fontSize="small" />
                </button>

                {/* LEFT: ITEMS */}
                <div className="flex-1 flex flex-col gap-3 max-h-[calc(90vh-72px)] overflow-y-auto">
                    {edited.items?.map((item, idx) => {
                        const addons   = CATEGORY_ADDONS[item.category] || {};
                        const hasAddons = Object.keys(addons).length > 0;
                        const isOpen   = item.editOpen || false;

                        return (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div
                                    className="flex justify-between items-center p-4 cursor-pointer"
                                    onClick={() => {
                                        const newItems = [...edited.items];
                                        newItems[idx].editOpen = !newItems[idx].editOpen;
                                        setEdited({ ...edited, items: newItems });
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <div className="font-semibold">{item.name}</div>
                                        {item.addOns?.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Add-ons: {item.addOns.map((a) => a.name).join(", ")}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">₱{computeItemTotal(item).toFixed(2)}</span>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                                        >×</button>
                                    </div>
                                </div>

                                {hasAddons && (
                                    <AnimateHeight duration={300} height={isOpen ? "auto" : 0}>
                                        <div className="border-t border-gray-200 px-4 py-3 flex flex-col gap-2">
                                            {Object.entries(addons).map(([addon, price]) => (
                                                <label key={addon} className="flex justify-between items-center text-sm hover:bg-gray-50 rounded p-1">
                                                    <span>{addon} {price > 0 && <span className="text-gray-400">(+₱{price})</span>}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.addOns?.some((a) => a.name === addon) || false}
                                                        onChange={() => toggleAddon(idx, addon, price)}
                                                    />
                                                </label>
                                            ))}

                                            <div className="flex items-center gap-2 mt-1">
                                                <button onClick={() => updateQty(idx, -1)} className="border rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-100">−</button>
                                                <div className="w-8 text-center">{item.quantity}</div>
                                                <button onClick={() => updateQty(idx, 1)} className="border rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-100">+</button>
                                            </div>
                                        </div>
                                    </AnimateHeight>
                                )}
                            </div>
                        );
                    })}

                    {/* TOTALS */}
                    <div className="mt-auto border-t border-gray-300 pt-2 text-sm bg-white p-2 rounded-lg sticky bottom-0">
                        <div className="flex justify-between"><span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold text-base">
                            <span>Total (VAT 12%):</span><span>₱{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: META */}
                <div className="flex flex-col gap-4 w-60 min-w-60 pl-4 border-l border-gray-300 pb-20">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700 text-sm">Ref ID:</label>
                        <input
                            value={edited.id || ""}
                            readOnly
                            className="border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700 text-sm">Date & Time:</label>
                        <input
                            type="datetime-local"
                            value={edited.rawDate ? new Date(edited.rawDate).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setEdited({ ...edited, rawDate: new Date(e.target.value) })}
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iris-80"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700 text-sm">Payment:</label>
                        <select
                            value={edited.paymentMode || "Cash"}
                            onChange={(e) => setEdited({ ...edited, paymentMode: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iris-80"
                        >
                            <option>Cash</option><option>QRph</option>
                            <option>GCash</option><option>Card</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700 text-sm">Status:</label>
                        <select
                            value={edited.status || "Completed"}
                            onChange={(e) => setEdited({ ...edited, status: e.target.value })}
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iris-80"
                        >
                            <option>Completed</option>
                            <option>Refunded</option>
                            <option>Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* FOOTER BUTTONS */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm">Cancel</button>
                    <button onClick={() => onSave(edited)} className="px-4 py-2 bg-wine-80 text-white rounded-lg hover:bg-wine-100 text-sm">Save</button>
                </div>
            </div>
        </div>
    );
}
