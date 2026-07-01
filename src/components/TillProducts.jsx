// src/components/TillProducts.jsx
import { useState, useEffect } from "react";

export default function TillProducts({ inventory = [], addToCart }) {
    const [search,     setSearch    ] = useState("");
    const [activeTags, setActiveTags] = useState([]);
    const [localItems, setLocalItems] = useState([]);

    useEffect(() => {
        setLocalItems(inventory);
    }, [inventory]);

    const categories = [...new Set(localItems.map((i) => i.category).filter(Boolean))];

    const filtered = localItems.filter((item) => {
        const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
        const matchTag    = activeTags.length === 0 || activeTags.includes(item.category);
        return matchSearch && matchTag;
    });

    const toggleTag = (cat) =>
        setActiveTags((prev) =>
            prev.includes(cat) ? prev.filter((t) => t !== cat) : [...prev, cat]
        );

    return (
        <div className="flex-1 overflow-auto">

            {/* SEARCH + FILTERS */}
            <div className="mb-5 space-y-3">
                <input
                    placeholder="Search menu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full max-w-sm"
                />

                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => {
                        const active = activeTags.includes(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleTag(cat)}
                                className={`
                                    px-4 py-1.5 rounded-full border text-sm font-medium transition
                                    ${active
                                        ? "bg-iris-80 text-white border-iris-80"
                                        : "bg-transparent text-gray-700 border-gray-400 hover:border-gray-600"}
                                `}
                            >
                                {({
                                    "Main Dishes": "🍲",
                                    "Silog Meals": "🍳",
                                    "Meryenda":    "🍢",
                                    "Sidings":     "🥗",
                                    "Rice":        "🍚",
                                    "Drinks":      "🥤",
                                    "Extras":      "➕",
                                })[cat] || "🍽️"} {cat}
                            </button>
                        );
                    })}
                    {activeTags.length > 0 && (
                        <button
                            onClick={() => setActiveTags([])}
                            className="px-4 py-1.5 rounded-full border text-sm text-gray-400 hover:border-gray-600 transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* PRODUCT GRID */}
            {filtered.length === 0 ? (
                <div className="text-center text-gray-400 py-16">No items found</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-start bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
                        >
                            <div className="flex-1 pr-3">
                                <div className="font-semibold text-sm">{item.name}</div>
                                <div className="text-gray-500 text-xs mt-0.5">
                                    {item.description || item.category}
                                </div>
                                <div className="text-gray-700 mt-1 text-sm font-medium">
                                    ₱{(item.price || 0).toFixed(2)}
                                </div>
                                <div className={`text-xs mt-1 ${item.stock <= 0 ? "text-red-500" : "text-gray-500"}`}>
                                    Stock: {item.stock ?? 0}
                                </div>
                            </div>

                            <button
                                onClick={() => addToCart(item)}
                                disabled={item.stock <= 0}
                                className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center transition flex-shrink-0
                                    ${item.stock <= 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-iris-80 hover:bg-iris-60"}
                                `}
                            >
                                <span className="text-white text-xl font-bold">+</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
