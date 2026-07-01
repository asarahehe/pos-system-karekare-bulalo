// src/components/MenuTable.jsx
import { useState, useMemo } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TableSortLabel, Checkbox
} from "@mui/material";
import EditTwoToneIcon   from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function MenuTable({ rows = [], page = 0, rowsPerPage = 5, onEdit }) {
    const [orderBy,  setOrderBy ] = useState(null);
    const [order,    setOrder   ] = useState("asc");
    const [selected, setSelected] = useState([]);

    const sortedRows = useMemo(() => {
        if (!rows.length) return [];
        let data = [...rows];
        if (orderBy) {
            data.sort((a, b) => {
                const aVal = a[orderBy] ?? "";
                const bVal = b[orderBy] ?? "";
                if (aVal < bVal) return order === "asc" ? -1 : 1;
                if (aVal > bVal) return order === "asc" ?  1 : -1;
                return 0;
            });
        }
        return data;
    }, [rows, orderBy, order]);

    const handleSort = (col) => {
        if (orderBy === col) setOrder(order === "asc" ? "desc" : "asc");
        else { setOrderBy(col); setOrder("asc"); }
    };

    const handleSelectAll = (e) =>
        setSelected(e.target.checked ? rows.map((r) => r.id) : []);

    const handleSelect = (id) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this menu item?")) return;
        await deleteDoc(doc(db, "menuItems", id));
    };

    const handleMassDelete = async () => {
        if (!window.confirm(`Delete ${selected.length} items?`)) return;
        await Promise.all(selected.map((id) => deleteDoc(doc(db, "menuItems", id))));
        setSelected([]);
    };

    const columns = [
        { id: "stockCode",  label: "Stock Code" },
        { id: "name",       label: "Name"        },
        { id: "category",   label: "Category"    },
        { id: "description",label: "Description" },
        { id: "stock",      label: "Stock"       },
        { id: "defaultQty", label: "Default Qty" },
        { id: "price",      label: "Price"       },
    ];

    return (
        <div className="flex flex-col">
            {selected.length > 0 && (
                <div className="bg-fuschia-60/40 border border-fuschia-80/20 px-4 py-2 flex justify-between items-center text-sm">
                    <span>{selected.length} selected</span>
                    <button
                        onClick={handleMassDelete}
                        className="bg-stone-700 text-white px-3 py-1 rounded hover:bg-gray-900 transition"
                    >
                        Delete Selected
                    </button>
                </div>
            )}

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, borderBottom: "none" }}>
                <Table sx={{ minWidth: 950 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#e8e3df" }}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={rows.length > 0 && selected.length === rows.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            {columns.map((col) => (
                                <TableCell key={col.id}>
                                    <TableSortLabel
                                        active={orderBy === col.id}
                                        direction={order}
                                        onClick={() => handleSort(col.id)}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell align="center" />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {sortedRows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                const isSelected = selected.includes(row.id);
                                return (
                                    <TableRow key={row.id} hover selected={isSelected}>
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isSelected} onChange={() => handleSelect(row.id)} />
                                        </TableCell>
                                        <TableCell>{row.stockCode}</TableCell>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell>{row.category}</TableCell>
                                        <TableCell className="text-gray-500 text-xs max-w-[180px] truncate">
                                            {row.description || "—"}
                                        </TableCell>
                                        <TableCell>{row.stock}</TableCell>
                                        <TableCell>{row.defaultQty ?? 1}</TableCell>
                                        <TableCell>₱{(row.price ?? 0).toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <div className="flex justify-center gap-2">
                                                <EditTwoToneIcon
                                                    onClick={() => onEdit(row)}
                                                    className="text-green-600 cursor-pointer hover:scale-110 transition"
                                                />
                                                <DeleteTwoToneIcon
                                                    onClick={() => handleDelete(row.id)}
                                                    className="text-red-600 cursor-pointer hover:scale-110 transition"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                        {sortedRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center" className="text-gray-400 py-10">
                                    No menu items yet. Click "Add Item" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
