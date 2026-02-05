import { useEffect, useState, useMemo, useCallback } from "react";
import type { Route } from "./+types/sales";
import { useAuth } from "~/Context/AppContext";
import { useNavigate, useLoaderData } from "react-router";

// --- CONFIGURATION ---
const BASE_URL = "http://127.0.0.1:8080";
const SALES_API_URL = `${BASE_URL}/api/sales/`;
const REFRESH_URL = `${BASE_URL}/token/refresh/`;
const SALES_CACHE_KEY = "msaidizi_sales_cache";

/**
 * UTILITY: Handles authentication, token refresh, and retries.
 */
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const getAccess = () => localStorage.getItem("access_token");
  const getRefresh = () => localStorage.getItem("refreshToken");

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${getAccess() || ""}`);

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    const refresh = getRefresh();
    if (!refresh) throw new Error("No refresh token");

    const refreshRes = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("access_token", data.access);
      headers.set("Authorization", `Bearer ${data.access}`);
      response = await fetch(url, { ...options, headers });
    } else {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }
  return response;
}

// --- 1. LOADER: Instant data from LocalStorage ---
export async function clientLoader() {
  const cached = localStorage.getItem(SALES_CACHE_KEY);
  if (cached) {
    try {
      const { data } = JSON.parse(cached);
      return data;
    } catch (e) {
      return [];
    }
  }
  return [];
}

export default function Sales() {
  const loaderData = useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- 2. STATE ---
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [localSales, setLocalSales] = useState<any[]>(
    Array.isArray(loaderData) ? loaderData : []
  );

  // --- 3. BACKGROUND SYNC LOGIC ---
  const syncSalesWithServer = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await authenticatedFetch(SALES_API_URL);
      if (res.ok) {
        const data = await res.json();
        const freshSales = Array.isArray(data) ? data : data.results || [];

        // Update UI
        setLocalSales(freshSales);

        // Clear and Register fresh data in Cache
        localStorage.removeItem(SALES_CACHE_KEY);
        localStorage.setItem(
          SALES_CACHE_KEY,
          JSON.stringify({ data: freshSales, timestamp: Date.now() })
        );
      }
    } catch (err) {
      console.error("Background sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // --- 4. EFFECTS ---

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Handle Mount: Load cache + Background Sync
  useEffect(() => {
    if (loaderData) {
      setLocalSales(Array.isArray(loaderData) ? loaderData : []);
    }
    syncSalesWithServer();
  }, [loaderData, syncSalesWithServer]);

  // --- 5. ACTIONS ---

  const handleVoidSale = async (saleId: number) => {
    if (!window.confirm("Are you sure you want to void this sale?")) return;

    // Optimistic Update: Remove from UI immediately
    const previousSales = [...localSales];
    const updated = localSales.filter((s) => s.id !== saleId);
    setLocalSales(updated);

    try {
      const res = await authenticatedFetch(`${SALES_API_URL}${saleId}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Update Cache with the new list
        localStorage.setItem(
          SALES_CACHE_KEY,
          JSON.stringify({ data: updated, timestamp: Date.now() })
        );
      } else {
        throw new Error("Void failed");
      }
    } catch (err) {
      alert("Failed to void sale. Reverting...");
      setLocalSales(previousSales); // Revert UI if server fails
    }
  };

  // --- 6. DERIVED DATA ---
  const filteredSales = useMemo(() => {
    return localSales.filter(
      (sale: any) =>
        sale.product_name?.toLowerCase().includes(filter.toLowerCase()) ||
        sale.id?.toString().includes(filter)
    );
  }, [filter, localSales]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
    return { total, count: filteredSales.length };
  }, [filteredSales]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-screen bg-gray-50">
      
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Records</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Syncing Sales..." : "Up to date"}
            </span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between border border-gray-800">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl font-black">{stats.total.toLocaleString()} <span className="text-xs font-normal opacity-50">TZS</span></p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
            <span className="text-2xl">💰</span>
          </div>
        </div>

        {/* Transaction Card */}
        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Transaction Count</p>
            <p className="text-2xl font-black">{stats.count} <span className="text-xs font-normal opacity-50">Sales</span></p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
            <span className="text-2xl">📋</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Filter by receipt ID or product name..."
          className="w-full pl-6 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-gray-800 text-xl font-bold"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-bold text-gray-400">#{sale.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 text-sm">{sale.product_name}</p>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter">Verified Sale</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-700">
                      {new Date(sale.date_sold).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(sale.date_sold).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-base font-black text-gray-900">
                      {Number(sale.total_amount).toLocaleString()} 
                      <span className="text-[10px] text-gray-400 ml-1">TZS</span>
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => window.print()} 
                        className="p-2.5 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        🖨️
                      </button>
                      <button 
                        onClick={() => handleVoidSale(sale.id)}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-medium">
              No sales records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}