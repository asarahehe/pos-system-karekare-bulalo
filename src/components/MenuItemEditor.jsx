// src/components/MenuItemEditor.jsx
// Modal for adding / editing menu items. Uses MENU_CATEGORIES from menuservice.
import { useState, useEffect } from "react";
import CloseTwoToneIcon   from "@mui/icons-material/CloseTwoTone";
import AddTwoToneIcon     from "@mui/icons-material/AddTwoTone";
import EditTwoToneIcon    from "@mui/icons-material/EditTwoTone";
import { MENU_CATEGORIES } from "../services/menuservice";

export default function MenuItemEditor({
    open,
    mode,           // "add" | "edit"
    existingRows = [],
    initialData  = null,
    onClose,
    onSubmit,
}) {
const generateStockCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

const defaultForm = {
    stockCode:  generateStockCode(),
    name:       "",
    category:   MENU_CATEGORIES[0],
    description:"",
    stock:      1,
    price:      "",
    defaultQty: 1,
};

    const [form,  setForm ] = useState(defaultForm);
    const [error, setError] = useState("");

    // Reset when opening in Add mode
 useEffect(() => {
    if (open && mode === "add") {
        setForm({ ...defaultForm, stockCode: generateStockCode() });
        setError("");
    }
}, [open, mode]);

    // Load data in Edit mode
    useEffect(() => {
        if (open && mode === "edit" && initialData) {
            setForm({
                stockCode:   initialData.stockCode   || "",
                name:        initialData.name        || "",
                category:    initialData.category    || MENU_CATEGORIES[0],
                description: initialData.description || "",
                stock:       initialData.stock       ?? 1,
                price:       initialData.price       ?? "",
                defaultQty:  initialData.defaultQty  ?? 1,
            });
            setError("");
        }
    }, [open, mode, initialData]);

    if (!open) return null;

    const handleChange = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.name.trim())      { setError("Item name is required.");  return; }
        if (!form.stockCode.trim()) { setError("Stock code is required."); return; }

        const duplicate = existingRows.some(
            (row) => row.stockCode === form.stockCode && row.id !== initialData?.id
        );
        if (duplicate) { setError("Stock code already exists."); return; }

        setError("");
        onSubmit({
            ...form,
            stock:      Number(form.stock),
            price:      Number(form.price),
            defaultQty: Number(form.defaultQty),
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-[440px] p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
                >
                    <CloseTwoToneIcon fontSize="small" />
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-iris-100">
                    {mode === "add" ? <><AddTwoToneIcon />Add Menu Item</> : <><EditTwoToneIcon />Edit Menu Item</>}
                </div>

                <div className="flex flex-col gap-4 text-sm">

                    {/* NAME */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">Name:</label>
                        <input
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-iris-80 outline-none"
                            placeholder="e.g. Bulalo Special"
                        />
                    </div>

                    {/* CATEGORY */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">Category:</label>
                        <select
                            value={form.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-iris-80 outline-none"
                        >
                            {MENU_CATEGORIES.map((cat) => (
                                <option key={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">Description:</label>
                        <input
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-iris-80 outline-none"
                            placeholder="Short description..."
                        />
                    </div>

                    {/* STOCK CODE */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">Stock Code:</label>
                        <input
                            value={form.stockCode}
                            onChange={(e) => handleChange("stockCode", e.target.value.toUpperCase())}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-iris-80 outline-none"
                            placeholder="e.g. B001"
                            disabled={mode === "edit"}
                        />
                    </div>

                    {/* PRICE */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium text-gray-700">Price (₱):</label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => handleChange("price", parseFloat(e.target.value) || "")}
                            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-iris-80 outline-none"
                            placeholder="₱ 0.00"
                        />
                    </div>

                    {/* STOCK + DEFAULT QTY */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-gray-700">Default Qty:</label>
                            <input
                                type="number"
                                value={form.defaultQty}
                                onChange={(e) => handleChange("defaultQty", parseInt(e.target.value) || 1)}
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-iris-80 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-medium text-gray-700">Stock:</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleChange("stock", Math.max(0, form.stock - 1))}
                                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >−</button>
                                <input
                                    type="number"
                                    value={form.stock}
                                    onChange={(e) => handleChange("stock", parseInt(e.target.value) || 0)}
                                    className="border rounded-lg px-3 py-2 w-16 text-center focus:ring-2 focus:ring-iris-80 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleChange("stock", form.stock + 1)}
                                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && <span className="text-red-500 text-sm font-medium">{error}</span>}

                    {/* SUBMIT */}
                    <button
                        onClick={handleSubmit}
                        className="mt-2 w-full bg-iris-80 hover:bg-iris-60 text-white font-semibold py-3 rounded-xl transition shadow-md"
                    >
                        {mode === "add" ? "Add Item" : "Save Changes"}
                    </button>

                </div>
            </div>
        </div>
    );
}
