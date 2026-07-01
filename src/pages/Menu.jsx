// src/pages/Menu.jsx
import { useState, useEffect, useRef } from "react";
import MenuTable      from "../components/MenuTable";
import MenuItemEditor from "../components/MenuItemEditor";
import TablePagination from "@mui/material/TablePagination";
import FileUploadTwoToneIcon   from "@mui/icons-material/FileUploadTwoTone";
import FileDownloadTwoToneIcon from "@mui/icons-material/FileDownloadTwoTone";
import LibraryAddTwoToneIcon   from "@mui/icons-material/LibraryAddTwoTone";
import { db } from "../services/firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import Papa from "papaparse";

export default function Menu() {
    const [rows,       setRows      ] = useState([]);
    const [loading,    setLoading   ] = useState(true);
    const [search,     setSearch    ] = useState("");
    const [page,       setPage      ] = useState(0);
    const [rowsPerPage,setRowsPerPage] = useState(5);
    const [modalOpen,  setModalOpen ] = useState(false);
    const [modalMode,  setModalMode ] = useState("add");
    const [editingItem,setEditingItem] = useState(null);

    const fileInputRef = useRef();

    // Real-time listener on menuItems collection
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "menuItems"),
            (snapshot) => {
                const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setRows(data);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (data) => {
        try {
            if (modalMode === "add") {
                await addDoc(collection(db, "menuItems"), { ...data, createdAt: new Date() });
            } else if (modalMode === "edit" && editingItem) {
                await updateDoc(doc(db, "menuItems", editingItem.id), { ...data, updatedAt: new Date() });
            }
            setModalOpen(false);
        } catch (err) {
            console.error("Error saving menu item:", err);
        }
    };

    /* CSV IMPORT */
    const handleImportCSV = (file) => {
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async ({ data: csvRows }) => {
                for (let i = 0; i < csvRows.length; i++) {
                    const row = csvRows[i];
                    await addDoc(collection(db, "menuItems"), {
                        category:    row["Category"]              || "",
                        name:        row["Item Name"]             || "",
                        description: row["Description"]           || "",
                        price:       Number(row["Price"]          || 0),
                        stock:       Number(row["Stock"]          || 1),
                        defaultQty:  Number(row["Default Qty"]    || 1),
                        stockCode:   row["Stock Code"]            ||
                            `${(row["Category"] || "X").charAt(0)}${String(i + 1).padStart(3, "0")}`,
                        createdAt: new Date(),
                    }).catch((e) => console.error("Import row error:", e));
                }
                alert("CSV import complete!");
            },
            error: (err) => console.error("CSV parse error:", err),
        });
    };

    /* CSV EXPORT */
    const handleExportCSV = () => {
        if (!rows.length) return;
        const csv  = Papa.unparse(rows.map(({ id, ...rest }) => rest));
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement("a"), {
            href: url, download: "karekare-bulalo-menu.csv"
        });
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredRows = rows.filter((r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase()) ||
        r.stockCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col px-6">
                <div className="px-6 pt-16 relative">

                    {/* HEADER TAB */}
                    <div className="relative">
                        <div className="inline-block bg-white/60 backdrop-blur-lg border border-gray-200 border-b-0 rounded-t-xl px-10 py-4">
                            <div className="flex items-center gap-3 whitespace-nowrap">
                                <span className="text-2xl font-semibold text-iris-100">Menu</span>
                                <span className="text-gray-800 text-lg">››</span>
                                <span className="text-lg text-gray-600">Manage your menu items</span>
                            </div>
                        </div>
                    </div>

                    {/* CONTROL BAR */}
                    <div className="bg-white/95 border border-gray-200 rounded-tr-xl px-8 py-5 flex flex-wrap justify-between items-center gap-3 shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium">Search:</span>
                            <input
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                type="text"
                                placeholder="Name, category, code..."
                                className="border border-gray-300 bg-beige/40 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-iris-80 transition w-56"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                className="flex items-center gap-2 bg-beige hover:bg-gray-300 px-3 py-2 rounded-lg transition text-sm"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FileUploadTwoToneIcon fontSize="small" /> Import CSV
                            </button>
                            <input
                                type="file" accept=".csv" ref={fileInputRef} className="hidden"
                                onChange={(e) => { if (e.target.files?.[0]) handleImportCSV(e.target.files[0]); }}
                            />

                            <button
                                className="flex items-center gap-2 bg-beige hover:bg-gray-300 px-3 py-2 rounded-lg transition text-sm"
                                onClick={handleExportCSV}
                            >
                                <FileDownloadTwoToneIcon fontSize="small" /> Export CSV
                            </button>

                            <button
                                onClick={() => { setModalMode("add"); setEditingItem(null); setModalOpen(true); }}
                                className="flex items-center gap-2 bg-iris-80 text-white px-3 py-2 rounded-lg hover:bg-iris-60 transition shadow-sm text-sm"
                            >
                                <LibraryAddTwoToneIcon fontSize="small" /> Add Item
                            </button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto pb-10">
                        {loading ? (
                            <div className="p-10 text-center text-gray-500">Loading menu...</div>
                        ) : (
                            <div className="min-w-[800px]">
                                <MenuTable
                                    rows={filteredRows}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    onEdit={(row) => {
                                        setModalMode("edit");
                                        setEditingItem(row);
                                        setModalOpen(true);
                                    }}
                                />
                            </div>
                        )}
                        <div className="bg-beige rounded-b-xl h-12 border-t border-gray-100" />
                    </div>

                </div>
            </div>

            {/* FOOTER PAGINATION */}
            <div className="sticky bottom-0 bg-beige border-t border-gray-200 flex flex-wrap justify-between items-center px-6 py-1 z-10 gap-2">
                <div className="text-gray-600 text-sm">
                    Showing {filteredRows.length === 0 ? 0 : page * rowsPerPage + 1}–
                    {Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
                </div>
                <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 20]}
                />
            </div>

            {/* MODAL */}
            <MenuItemEditor
                open={modalOpen}
                mode={modalMode}
                existingRows={rows}
                initialData={editingItem}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
