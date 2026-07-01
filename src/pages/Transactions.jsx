import { useState, useEffect, useMemo } from "react";
import TransactionsTable from "../components/TransactionsTable";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import CalendarMonthTwoToneIcon from "@mui/icons-material/CalendarMonthTwoTone";
import AccessTimeTwoToneIcon from "@mui/icons-material/AccessTimeTwoTone";

import TablePagination from "@mui/material/TablePagination";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";

export default function Transactions() {
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [searchRef, setSearchRef] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("time", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((snapshotDoc) => {
          const t = snapshotDoc.data();
          const rawDate = t.time?.toDate ? t.time.toDate() : null;
          return {
            docId: snapshotDoc.id,
            id: t.refID || snapshotDoc.id,
            refID: t.refID || snapshotDoc.id,
            rawDate,
            date: rawDate ? rawDate.toLocaleString() : "",
            paymentMode: t.payment || "Cash",
            status: t.status || "Completed",
            items: (t.items || []).map((item) => ({
              name: item.name,
              quantity: item.qty || item.quantity || 1,
              price: item.price || 0,
              addOns: item.addOns || [],
            })),
          };
        });

        setRows(data);
      },
      (error) => {
        console.error("Error loading transactions:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const resolveDocId = async (row) => {
    if (row?.docId) return row.docId;
    if (!row?.refID) return null;

    const fallbackQuery = query(
      collection(db, "transactions"),
      where("refID", "==", row.refID),
      limit(1)
    );

    const snapshot = await getDocs(fallbackQuery);
    if (snapshot.empty) return null;
    return snapshot.docs[0].id;
  };

  const handleSaveTransaction = async (updatedRow) => {
    const docId = await resolveDocId(updatedRow);
    if (!docId) {
      throw new Error(`No transaction document found for ${updatedRow?.refID || updatedRow?.id}`);
    }

    await updateDoc(doc(db, "transactions", docId), {
      status: updatedRow.status,
      payment: updatedRow.paymentMode,
      time: updatedRow.rawDate ? Timestamp.fromDate(new Date(updatedRow.rawDate)) : Timestamp.now(),
      items: (updatedRow.items || []).map((item) => ({
        ...item,
        qty: item.quantity || item.qty || 1,
      })),
    });
  };

  const handleDeleteTransaction = async (row) => {
    const docId = await resolveDocId(row);
    if (!docId) {
      throw new Error(`No transaction document found for ${row?.refID || row?.id}`);
    }
    await deleteDoc(doc(db, "transactions", docId));
  };

  const timeToMinutes = (time) => {
    const [h, m] = time.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (searchRef && !row.refID.toLowerCase().includes(searchRef.toLowerCase())) return false;
      if (!row.rawDate) return true;

      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (row.rawDate < start || row.rawDate > end) return false;

      const minutes = row.rawDate.getHours() * 60 + row.rawDate.getMinutes();
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      if (minutes < startMinutes || minutes > endMinutes) return false;

      return true;
    });
  }, [rows, searchRef, startDate, endDate, startTime, endTime]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6">
        <div className="px-6 pt-16 relative">
          <div className="relative">
            <div className="inline-block bg-white/60 backdrop-blur-lg border border-gray-200 border-b-0 rounded-t-xl px-10 py-4 z-15">
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="text-2xl font-semibold text-iris-100">Transactions</span>
                <span className="text-gray-800 text-lg">&gt;&gt;</span>
                <span className="text-lg text-gray-600">View and manage transaction records</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 border border-gray-200 rounded-tr-xl px-8 py-5 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Reference no.:</span>
              <input
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                type="text"
                placeholder="REF-1000"
                className="border border-gray-300 bg-beige/40 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-iris-80"
              />
            </div>

            <div className="flex items-center gap-8 ml-auto">
              <div className="flex items-center gap-2">
                <CalendarMonthTwoToneIcon fontSize="small" />
                <span className="text-gray-600 text-sm -ml-1">Date:</span>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-40"
                  popperClassName="datepicker-popper"
                />
                <span className="text-gray-400">-</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-40"
                  popperClassName="datepicker-popper"
                />
              </div>

              <div className="flex items-center gap-2">
                <AccessTimeTwoToneIcon fontSize="small" />
                <span className="text-gray-600 text-sm -ml-1">Time:</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto pb-10">
            <TransactionsTable
              rows={filteredRows}
              setRows={setRows}
              page={page}
              rowsPerPage={rowsPerPage}
              onSaveRow={handleSaveTransaction}
              onDeleteRow={handleDeleteTransaction}
            />
            <div className="bg-beige rounded-b-xl h-12 border-t border-gray-100"></div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-beige border-t border-gray-200 flex justify-between items-center px-6 py-1 z-10">
        <div className="text-gray-600 text-sm">
          Showing {filteredRows.length === 0 ? 0 : page * rowsPerPage + 1}-
          {Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length}
        </div>

        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}
