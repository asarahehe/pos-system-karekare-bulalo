import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

export default function TillTransactionsTable({ rows = [] }) {
    const statusStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === "completed") return "bg-green-200 text-green-800";
        if (s === "refunded") return "bg-yellow-100 text-yellow-800";
        if (s === "cancelled") return "bg-gray-200 text-gray-700";
        return "bg-gray-100";
    };

    return (
        <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
            <Table sx={{
                tableLayout: "fixed",
                "& .MuiTableHead-root .MuiTableRow-root": { backgroundColor: "#e8e3df" },
                "& .MuiTableCell-head": { fontWeight: 600, backgroundColor: "#e8e3df" }
            }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: 210 }}>Time</TableCell>
                        <TableCell sx={{ width: 110 }}>Status</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell sx={{ width: 80, textAlign: "right" }}>Qty</TableCell>
                        <TableCell sx={{ width: 120, textAlign: "right" }}>Price</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => {
                        const qty = row.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
                        const price = row.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0;
                        const items = row.items?.slice(0, 2).map(i => i.name).join(", ");
                        const moreCount = row.items?.length > 2 ? ` +${row.items.length - 2} more` : "";
                        return (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>{row.date}</TableCell>
                                <TableCell>
                                    <span className={`text-xs px-2 py-1 rounded ${statusStyle(row.status)}`}>{row.status}</span>
                                </TableCell>
                                <TableCell sx={{ paddingLeft: "8px" }}>{items}{moreCount}</TableCell>
                                <TableCell sx={{ textAlign: "right" }}>{qty}</TableCell>
                                <TableCell sx={{ textAlign: "right" }}>₱{price.toFixed(2)}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}