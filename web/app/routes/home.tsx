import React, { use, useEffect } from "react";
import type { Route } from "./+types/dashboard";
import { redirect, useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

// Mock Data for the UI
const STATS = [
  {
    label: "Total Revenue",
    value: "4,250,000 TZS",
    change: "+12.5%",
    icon: "bi-currency-exchange",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Total Products",
    value: "48",
    change: "+5.2%",
    icon: "bi-cart-check",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Low Stock Items",
    value: "12",
    change: "Critical",
    icon: "bi-exclamation-triangle",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Total Inventory Value",
    value: "156",
    change: "+18%",
    icon: "bi-people",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const RECENT_SALES = [
  {
    id: "#1024",
    product: "TOTAL RUBIA SAE 40",
    amount: "111,000",
    status: "Verified",
  },
  {
    id: "#1023",
    product: "TOYOTA 5W30 (BATI)",
    amount: "160,000",
    status: "Pending",
  },
  {
    id: "#1022",
    product: "Brake Pads - Hilux",
    amount: "45,000",
    status: "Verified",
  },
  { id: "#1021", product: "Coolant 1L", amount: "15,000", status: "Verified" },
];

export function meta({}: Route.MetaArgs) {
  return [{ title: "Msaidizi | Dashboard" }];
}

export function headers({}: Route.HeadersArgs) {
  return {};
}

const apiUrl = "https://msaidizi.nsaro.com/index/dashboard_api/";

export function loader({}: Route.LoaderArgs) {
  return fetch(apiUrl).then((res) => res.json());
}

interface ServerData { 
  total_products: number;
  total_sales: string;
  total_units_sold: number;
  total_inventory_value: number;
}



export default function Dashboard({loaderData}: Route.ComponentArgs<typeof loader>) {
  const { isAuthenticated } = useAuth(); // Replace with real authentication logic
  const navigate = useNavigate();
  console.log("isAuthenticated:", isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);
console.clear();
  const data: ServerData = loaderData;
  console.log("Dashboard loader data:", data);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          System Overview
        </h1>
        <p className="text-gray-500 font-medium text-sm">
          Welcome back! Here is what's happening today.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center text-2xl`}
              >
                <i className={`bi ${stat.icon}`}></i>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.change.includes("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">
              {stat.label}
            </h3>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {data &&  data.total_sales
                ? stat.label === "Total Revenue"
                  ? data.total_sales
                  : stat.label === "Total Products"
                  ? data.total_products
                  : stat.label === "Total Units Sold"
                  ? data.total_units_sold
                  : stat.label === "Total Inventory Value"
                  ? data.total_inventory_value
                  : stat.total_inventory_value
                : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Latest Transactions</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">
              View All
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Order
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Product
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_SALES.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {sale.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">
                    {sale.product}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {sale.amount} TZS
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                        sale.status === "Verified"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory Warning & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Total Rubia 4L
                  </p>
                  <p className="text-xs text-gray-500">
                    Only 2 units remaining
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-amber-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Shell Helix 1L
                  </p>
                  <p className="text-xs text-gray-500">
                    Only 8 units remaining
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Check out our latest training manual for inventory management.
            </p>
            <button className="w-full py-2 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
              Read Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
