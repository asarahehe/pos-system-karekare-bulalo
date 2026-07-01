// src/pages/Graph.jsx
import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

export default function Graph() {
  const today = new Date();

  // Default: this month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);

  const [groupBy, setGroupBy] = useState("day"); // "day", "week", "month"

  const normalizeStatus = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "complete" || value === "completed") return "completed";
    if (value === "refund" || value === "refunded") return "refunded";
    if (value === "cancel" || value === "cancelled") return "cancelled";
    return value || "completed";
  };

  /* ================= FETCH ================= */

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "transactions"), orderBy("time", "asc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => {
        const t = doc.data();
        const rawDate = t.time?.toDate ? t.time.toDate() : null;
        const computedTotal = (t.items || []).reduce(
            (sum, item) => sum + (item.price || 0) * (item.qty || item.quantity || 1),
            0
        );
        const total = typeof t.total === "number" ? t.total : computedTotal;
        const status = normalizeStatus(t.status);
        return { id: doc.id, rawDate, total, status };
      });

      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* ================= FILTER ================= */

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.rawDate) return false;

      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);

      return t.rawDate >= start && t.rawDate <= end;
    });
  }, [transactions, startDate, endDate]);

  /* ================= GROUPING ================= */

  const groupedMetrics = useMemo(() => {
    const map = {};

    filteredTransactions.forEach(t => {
      let key;

      if (groupBy === "day") {
        key = t.rawDate.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (groupBy === "week") {
        const firstDay = new Date(t.rawDate);
        firstDay.setDate(t.rawDate.getDate() - t.rawDate.getDay()); // start of week (Sunday)
        key = firstDay.toISOString().split("T")[0];
      } else if (groupBy === "month") {
        key = `${t.rawDate.getFullYear()}-${t.rawDate.getMonth() + 1}`; // YYYY-M
      }

      if (!map[key]) map[key] = { Sales: 0, Refunds: 0 };

      if (t.status === "completed") map[key].Sales += t.total;
      if (t.status === "refunded") map[key].Refunds += t.total;
    });

    return map;
  }, [filteredTransactions, groupBy]);

  const labels = Object.keys(groupedMetrics).sort();

  const datasets = [
    {
      label: "Sales",
      data: labels.map(d => groupedMetrics[d].Sales),
      borderColor: "green",
      backgroundColor: "rgba(0,128,0,0.2)",
      tension: 0.3
    },
    {
      label: "Refunds",
      data: labels.map(d => groupedMetrics[d].Refunds),
      borderColor: "red",
      backgroundColor: "rgba(255,0,0,0.2)",
      tension: 0.3
    }
  ];

  const graphData = { labels, datasets };

  return (
      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-3 mb-6 items-center flex-wrap">
          <span className="font-medium">Range:</span>
          <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="MMMM d, yyyy"
              className="border rounded px-2 py-1"
          />
          <span>to</span>
          <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="MMMM d, yyyy"
              className="border rounded px-2 py-1"
          />

          <span className="font-medium">Group by:</span>
          <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border rounded px-2 py-1"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>

          <button
              onClick={fetchTransactions}
              className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow">
          {loading ? (
              <div className="text-gray-500">Loading graph...</div>
          ) : labels.length ? (
              <Line data={graphData} />
          ) : (
              <div className="text-gray-500">No data for selected range</div>
          )}
        </div>
      </div>
  );
}