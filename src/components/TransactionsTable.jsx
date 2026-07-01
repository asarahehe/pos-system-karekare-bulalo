// TransactionsTable.js
import React, { useState, useMemo } from "react";
import AnimateHeight from "react-animate-height";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Checkbox,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";

import TransactionEditor from "./TransactionEditor";
import { useAuth } from "../services/AuthContext";

const formatAddon = (str) => str.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

export default function TransactionsTable({
  rows = [],
  setRows,
  page = 0,
  rowsPerPage = 5,
  onSaveRow,
  onDeleteRow,
}) {
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState(null);
  const [selected, setSelected] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const { role } = useAuth();

  const rowsWithRef = useMemo(
    () =>
      rows.map((row, idx) => ({
        ...row,
        id: row.id || `REF-${1000 + idx}`,
      })),
    [rows]
  );

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleMassDelete = async () => {
    const selectedRows = rowsWithRef.filter((r) => selected.includes(r.id));

    if (onDeleteRow) {
      await Promise.all(selectedRows.map((row) => onDeleteRow(row)));
    }

    setRows((prev) => prev.filter((r) => !selected.includes(r.id)));
    setSelected([]);
  };

  const handleUpdateRow = (rowId, updatedFields) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...updatedFields } : r)));
  };

  const persistInlineUpdate = async (row, updatedFields) => {
    const nextRow = { ...row, ...updatedFields };
    handleUpdateRow(row.id, updatedFields);

    if (!onSaveRow) return;

    try {
      await onSaveRow(nextRow);
    } catch (error) {
      console.error("Failed to save transaction update:", error);
      alert("Failed to save transaction changes.");
    }
  };

  const handleSort = (column) => {
    if (orderBy !== column) {
      setOrderBy(column);
      setOrder("asc");
    } else if (order === "asc") setOrder("desc");
    else {
      setOrderBy(null);
      setOrder(null);
    }
  };

  const sortedRows = useMemo(() => {
    if (!orderBy || !order) return rowsWithRef;
    const data = [...rowsWithRef];
    data.sort((a, b) => {
      let aVal = a[orderBy] ?? "";
      let bVal = b[orderBy] ?? "";

      if (orderBy === "itemCount") {
        aVal = a.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
        bVal = b.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
      }

      if (orderBy === "total") {
        const calcTotal = (row) =>
          row.items?.reduce(
            (s, i) => s + i.quantity * i.price + (i.addOns?.reduce((aSum, addon) => aSum + (addon.price || 0), 0) || 0),
            0
          ) || 0;
        aVal = calcTotal(a);
        bVal = calcTotal(b);
      }

      return aVal < bVal ? (order === "asc" ? -1 : 1) : aVal > bVal ? (order === "asc" ? 1 : -1) : 0;
    });
    return data;
  }, [rowsWithRef, orderBy, order]);

  const displayedRows = useMemo(
    () => sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  return (
    <div className="flex flex-col w-full">
      {selected.length > 0 && (
        <div className="bg-fuchsia-50 border border-fuchsia-200 px-4 py-2 flex justify-between items-center text-sm">
          <span>{selected.length} selected</span>
          <button
            onClick={handleMassDelete}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Delete Selected
          </button>
        </div>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, tableLayout: "fixed" }}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell padding="checkbox" sx={{ width: 50 }}>
                <Checkbox
                  checked={rowsWithRef.length > 0 && selected.length === rowsWithRef.length}
                  onChange={(e) => (e.target.checked ? setSelected(rowsWithRef.map((r) => r.id)) : setSelected([]))}
                />
              </TableCell>
              {[
                { key: "id", label: "Ref ID", width: 120 },
                { key: "items", label: "Items", width: 300 },
                { key: "itemCount", label: "Qty", width: 60 },
                { key: "date", label: "Time", width: 140 },
                { key: "total", label: "Total", width: 120 },
                { key: "paymentMode", label: "Payment", width: 100 },
                { key: "status", label: "Status", width: 100 },
                { key: "actions", label: "", width: 80 },
              ].map((col) => (
                <TableCell key={col.key} sx={{ width: col.width }}>
                  {col.key !== "actions" && (
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={order || "asc"}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedRows.map((row) => {
              const isExpanded = expandedRow === row.id;
              const itemCount = row.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
              const total =
                row.items?.reduce(
                  (sum, i) =>
                    sum + i.quantity * i.price + (i.addOns?.reduce((aSum, addon) => aSum + (addon.price || 0), 0) || 0),
                  0
                ) || 0;

              return (
                <TableRow hover key={row.id} selected={selected.includes(row.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                  </TableCell>

                  <TableCell className="font-mono text-xs">{row.id}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                      >
                        <div className="flex-1 truncate">
                          {row.items?.slice(0, 2).map((item, idx) => (
                            <span key={idx}>
                              {item.name}
                              {item.quantity > 1 && ` (${item.quantity}x)`}
                              {idx < Math.min(row.items.length, 2) - 1 && ", "}
                            </span>
                          ))}
                          {row.items.length > 2 && ` +${row.items.length - 2} more`}
                        </div>
                        <VisibilityIcon className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" fontSize="small" />
                      </div>

                      <AnimateHeight duration={300} height={isExpanded ? "auto" : 0}>
                        <div className="border border-gray-300 p-3 text-xs">
                          {row.items?.map((item) => (
                            <div key={item.name} className="mb-2 last:mb-0">
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-gray-600">
                                Qty: {item.quantity} - PHP {(item.price * item.quantity).toFixed(2)}
                              </div>
                              {item.addOns?.length > 0 && (
                                <div className="text-gray-500 mt-1">
                                  Add-ons: {item.addOns.map((a) => formatAddon(a.name)).join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AnimateHeight>
                    </div>
                  </TableCell>

                  <TableCell>{itemCount}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>PHP {total.toFixed(2)}</TableCell>

                  <TableCell>
                    {role === "admin" ? (
                      <select
                        value={row.paymentMode || "Cash"}
                        onChange={(e) => persistInlineUpdate(row, { paymentMode: e.target.value })}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        <option>Cash</option>
                        <option>QRph</option>
                        <option>Credit</option>
                        <option>Card</option>
                      </select>
                    ) : (
                      <span className="text-xs">{row.paymentMode || "Cash"}</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {role === "admin" ? (
                      <select
                        value={row.status || "Completed"}
                        onChange={(e) => persistInlineUpdate(row, { status: e.target.value })}
                        className={`text-xs px-2 py-1 rounded ${
                          row.status === "Completed"
                            ? "bg-green-200 text-green-800"
                            : row.status === "Refunded"
                              ? "bg-red-200 text-red-700"
                              : "bg-gray-200"
                        }`}
                      >
                        <option>Completed</option>
                        <option>Refunded</option>
                        <option>Cancelled</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded ${
                        row.status === "Completed"
                          ? "bg-green-200 text-green-800"
                          : row.status === "Refunded"
                            ? "bg-red-200 text-red-700"
                            : "bg-gray-200"
                      }`}>{row.status}</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-3">
                      {role === "admin" && (
                        <>
                          <EditTwoToneIcon className="text-green-600 cursor-pointer" onClick={() => setEditingRow(row)} />
                          <DeleteTwoToneIcon
                            className="text-red-600 cursor-pointer"
                            onClick={async () => {
                              try {
                                if (onDeleteRow) await onDeleteRow(row);
                                setRows((prev) => prev.filter((r) => r.id !== row.id));
                              } catch (error) {
                                console.error("Failed to delete transaction:", error);
                                alert("Failed to delete transaction.");
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {editingRow && (
        <TransactionEditor
          open={!!editingRow}
          transaction={editingRow}
          onClose={() => setEditingRow(null)}
          onSave={async (updatedRow) => {
            handleUpdateRow(updatedRow.id, updatedRow);
            if (onSaveRow) {
              try {
                await onSaveRow(updatedRow);
              } catch (error) {
                console.error("Failed to save transaction edit:", error);
                alert("Failed to save transaction changes.");
              }
            }
            setEditingRow(null);
          }}
        />
      )}
    </div>
  );
}
