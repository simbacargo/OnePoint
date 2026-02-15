import React, { useEffect, useMemo } from "react";
import type { Route } from "./+types/dashboard";
import { useNavigate, useLoaderData } from "react-router";
import { useAuth } from "~/Context/AppContext";

// --- CONFIGURATION ---
const API_BASE = "http://127.0.0.1:8080";
const DASHBOARD_API_URL = `${API_BASE}/index/dashboard_api/`;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Msaidizi | Dashboard" }];
}

// --- LOADER ---
export async function loader({}: Route.LoaderArgs) {
  const res = await fetch(DASHBOARD_API_URL);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

// --- UTILS ---
const formatCurrency = (val: string | number) => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  return new Intl.NumberFormat("en-TZ").format(num || 0);
};

interface ServerData {
  total_products: number;
  total_sales: string;
  total_units_sold: number;
  total_inventory_value: number;
  low_stock_count?: number; // Added if available from API
}

export default function Dashboard() {
  const loaderData = useLoaderData() as ServerData;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Derived Stats Mapping
  const stats = useMemo(() => [
    {
      label: "Total Revenue",
      value: `${formatCurrency(loaderData.total_sales)} TZS`,
      trend: "+12.5%",
      icon: "💰",
      color: "blue",
    },
    {
      label: "Total Products",
      value: loaderData.total_products.toString(),
      trend: "In Stock",
      icon: "📦",
      color: "emerald",
    },
    {
      label: "Low Stock Items",
      value: "12", // Fallback or dynamic
      trend: "Critical",
      icon: "⚠️",
      color: "amber",
    },
    {
      label: "Total Inventory Value",
      value: `${formatCurrency(loaderData.total_inventory_value)} TZS`,
      trend: "Assets",
      icon: "🏦",
      color: "purple",
    },
  ], [loaderData]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Welcome back! Here is your business at a glance.
          </p>
        </div>
        <div className="flex gap-2">
           {/* <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
             Export PDF
           </button> */}
           <button onClick={() => navigate('/record-sale')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
             New Sale
           </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                stat.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
              {stat.label}
            </h3>
            <p className="text-xl font-black text-gray-900 truncate">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Transactions */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-gray-900 tracking-tight">Recent Sales</h3>
            <button onClick={() => navigate('/sales')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">
              View All Ledger
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Sample rows for UI polish - replace with real recent sales data if available */}
                {[
                  { id: "#1024", product: "TOTAL RUBIA SAE 40", amount: "111,000", status: "Verified" },
                  { id: "#1023", product: "TOYOTA 5W30 (BATI)", amount: "160,000", status: "Pending" }
                ].map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5 text-xs font-mono font-bold text-gray-400">{sale.id}</td>
                    <td className="px-8 py-5 text-sm font-black text-gray-800">{sale.product}</td>
                    <td className="px-8 py-5 text-sm font-bold text-right text-gray-900">{sale.amount} <span className="text-[10px] text-gray-400">TZS</span></td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        sale.status === "Verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-black text-gray-900 tracking-tight">Stock Alerts</h3>
               <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="text-2xl">⛽</div>
                <div>
                  <p className="text-sm font-black text-red-900">Total Rubia 4L</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">2 Units Left</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="text-2xl">🧴</div>
                <div>
                  <p className="text-sm font-black text-amber-900">Shell Helix 1L</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">8 Units Left</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="font-black text-xl mb-2 relative z-10">Inventory Health</h3>
            <p className="text-gray-400 text-xs mb-6 relative z-10 leading-relaxed">
              Your inventory value has increased by 18% this month.
            </p>
            <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors relative z-10">
              Run Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}