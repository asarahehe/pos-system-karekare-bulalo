// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

// Helper to handle status variations (from snippet 1)
const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "complete" || value === "completed") return "completed";
  if (value === "refund" || value === "refunded") return "refunded";
  if (value === "cancel" || value === "cancelled") return "cancelled";
  return value || "completed";
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "transactions"), orderBy("time", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((snapshotDoc) => {
        const t = snapshotDoc.data();
        const rawDate = t.time?.toDate ? t.time.toDate() : null;

        // Calculate total based on items if 'total' field isn't present
        const computedTotal = (t.items || []).reduce(
            (sum, item) => sum + (item.price || 0) * (item.qty || item.quantity || 1),
            0
        );

        const total = typeof t.total === "number" ? t.total : computedTotal;
        const status = normalizeStatus(t.status);

        return {
          id: snapshotDoc.id,
          refID: t.refID || snapshotDoc.id,
          rawDate,
          total,
          status,
          payment: t.payment || "Cash",
          refund: status === "refunded" ? total : 0,
          items: t.items || []
        };
      });

      setTransactions(data);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard snapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  // === Summary Metrics (Logic from Snippet 1) ===
  const salesCount = transactions.filter((t) => t.status === "completed").length;
  const refundsCount = transactions.filter((t) => t.status === "refunded").length;
  const totalRevenue = transactions
      .filter((t) => t.status !== "cancelled")
      .reduce((sum, t) => sum + (t.total || 0), 0);
  const totalRefunds = transactions.reduce((sum, t) => sum + (t.refund || 0), 0);
  const netProfit = totalRevenue - totalRefunds;

  // === Updated Line Chart Code ===
  const lineData = useMemo(() => {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const salesPerHour = [];
    const refundsPerHour = [];

    for (let hour = 0; hour < 24; hour++) {
      const sales = transactions
          .filter((t) => t.rawDate && t.rawDate.getHours() === hour && t.status === "completed")
          .reduce((sum, t) => sum + (t.total || 0), 0);

      const refunds = transactions
          .filter((t) => t.rawDate && t.rawDate.getHours() === hour && t.status === "refunded")
          .reduce((sum, t) => sum + (t.total || 0), 0);

      salesPerHour.push(sales);
      refundsPerHour.push(refunds);
    }

    return {
      labels,
      datasets: [
        {
          label: "Sales",
          data: salesPerHour,
          borderColor: "green",
          backgroundColor: "rgba(0,128,0,0.2)",
          tension: 0.3 // Adds a slight curve to the line
        },
        {
          label: "Refunds",
          data: refundsPerHour,
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.2)",
          tension: 0.3
        },
      ],
    };
  }, [transactions]);

  // === Pie Chart (Keeping your Items logic) ===
  const topItemsData = useMemo(() => {
    const itemCounts = {};
    transactions.forEach(t => {
      (t.items || []).forEach(item => {
        const itemName = item.name || "Unknown";
        const qty = item.qty || 1;
        itemCounts[itemName] = (itemCounts[itemName] || 0) + qty;
      });
    });

    const sortedItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
      labels: sortedItems.map(([name]) => name),
      datasets: [{
        label: "Quantity Sold",
        data: sortedItems.map(([_, qty]) => qty),
        backgroundColor: ["#facc15","#3b82f6","#a855f7","#10b981","#ef4444"]
      }]
    };
  }, [transactions]);

  const orderPerDishData = useMemo(() => topItemsData, [topItemsData]);

  const paymentMethodData = useMemo(() => {
    const counts = {};
    transactions.forEach((t) => {
      const method = t.payment || "Cash";
      counts[method] = (counts[method] || 0) + 1;
    });
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [{
        label: "Transactions by payment",
        data: labels.map((label) => counts[label]),
        backgroundColor: ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ef4444"],
      }],
    };
  }, [transactions]);

  const latestTransactions = [...transactions].sort((a, b) => (b.rawDate || 0) - (a.rawDate || 0)).slice(0, 5);

  return (
      <div className="p-6 space-y-6">

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-gray-500 text-sm">Sales</div>
            <div className="text-2xl font-bold">{salesCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-gray-500 text-sm">Refunds</div>
            <div className="text-2xl font-bold">{refundsCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-gray-500 text-sm">Costs</div>
            <div className="text-2xl font-bold">₱{totalRefunds.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-gray-500 text-sm">Net Profit</div>
            <div className="text-2xl font-bold">₱{netProfit.toFixed(2)}</div>
          </div>
        </div>

        {/* Charts & Latest Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Sales/Refunds Today</h3>
            <Line data={lineData} />
          </div>

          {/* Item Popularity */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Top 5 Popular Items</h3>
            <Pie data={topItemsData} />
          </div>

          {/* Payment Method Overview */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Transactions by Payment Method</h3>
            <Pie data={paymentMethodData} />
          </div>

          {/* Order per Dish */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Orders per Dish</h3>
            <Bar data={orderPerDishData} options={{ responsive: true, plugins: { legend: { display: false }, tooltip: { enabled: true } } }} />
          </div>

          {/* Latest Transactions (Stacked under charts on mobile) */}
          {/* Latest Transactions (Stacked under charts on mobile) */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Latest Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                <tr>
                  <th className="py-1">Time</th>
                  <th className="py-1">Status</th>
                  <th className="py-1">Reference</th>
                  <th className="py-1">Payment</th> {/* NEW COLUMN */}
                  <th className="py-1">Total</th>
                </tr>
                </thead>
                <tbody>
                {latestTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.rawDate ? t.rawDate.toLocaleTimeString() : "-"}</td>
                      <td className="capitalize">{t.status}</td>
                      <td>{t.refID}</td>
                      <td className="capitalize">{t.payment}</td> {/* DISPLAY PAYMENT */}
                      <td>₱{t.total.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
  );
}