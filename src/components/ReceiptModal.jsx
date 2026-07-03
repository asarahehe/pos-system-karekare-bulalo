import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";

const formatCurrency = (value) => `₱${Number(value || 0).toFixed(2)}`;

export default function ReceiptModal({ open, receipt, onClose }) {
    if (!open || !receipt) return null;

    const {
        refID,
        time,
        payment,
        items = [],
        subtotal = 0,
        discountType,
        discountPercent = 0,
        vat = 0,
        total = 0,
    } = receipt;

    const actualTime = time?.toDate ? time.toDate() : time instanceof Date ? time : new Date(time);
    const createdAt = actualTime ? actualTime.toLocaleString() : "";
    const discountLabel = discountType ? `${discountType} (${discountPercent * 100}%)` : "None";
    const softCopy = ["GCash", "Card"].includes(payment);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[calc(100vh-3rem)]">
                <div className="flex items-center justify-between bg-iris-80 px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <ReceiptLongTwoToneIcon />
                        <div>
                            <div className="font-semibold text-lg">Soft Copy Receipt</div>
                            <div className="text-sm opacity-90">Handheld POS-style receipt view</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full bg-white/15 p-2 hover:bg-white/25 transition">
                        <CloseTwoToneIcon fontSize="small" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs uppercase text-gray-500">Reference</div>
                            <div className="font-semibold">{refID}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase text-gray-500">Date / Time</div>
                            <div className="font-semibold">{createdAt}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs uppercase text-gray-500">Payment method</div>
                            <div className="font-semibold capitalize">{payment || "Cash"}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase text-gray-500">Receipt type</div>
                            <div className="font-semibold">{softCopy ? "Soft copy" : "Terminal receipt"}</div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 p-4 bg-gray-50">
                        <div className="mb-4 text-sm font-semibold">Items</div>
                        <div className="space-y-3">
                            {items.map((item, idx) => {
                                const addonTotal = (item.addOns || []).reduce((sum, addon) => sum + (addon.price || 0), 0);
                                const qty = item.qty || item.quantity || 1;
                                const itemTotal = ((item.price || 0) + addonTotal) * qty;
                                return (
                                    <div key={`${item.name}-${idx}`} className="rounded-2xl bg-white p-3 shadow-sm">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span>{item.name}</span>
                                            <span>{formatCurrency(item.price * qty + addonTotal * qty)}</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-600">
                                            Qty: {qty} • Unit: {formatCurrency(item.price)}
                                        </div>
                                        {item.addOns?.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Add-ons: {item.addOns.map((a) => a.name).join(", ")}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Discount</span><span>{discountLabel}</span></div>
                        <div className="flex justify-between"><span>VAT (12%)</span><span>{formatCurrency(vat)}</span></div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold">
                            <span>Total</span><span>{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
                        {softCopy
                            ? "Payment received via digital method. The receipt can be reused as a soft copy on the handheld POS." 
                            : "Payment received. The receipt is shown in the POS terminal view."}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition">Close</button>
                        <button onClick={() => window.print()} className="rounded-xl bg-iris-80 px-4 py-2 text-sm text-white hover:bg-iris-60 transition">Print</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
