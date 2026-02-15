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

  // --- STATE ---
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [localSales, setLocalSales] = useState<any[]>(
    Array.isArray(loaderData) ? loaderData : []
  );

  // Pretty UI States
  const [saleToVoid, setSaleToVoid] = useState<any | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  // --- BACKGROUND SYNC ---
  const syncSalesWithServer = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await authenticatedFetch(SALES_API_URL);
      if (res.ok) {
        const data = await res.json();
        const freshSales = Array.isArray(data) ? data : data.results || [];
        setLocalSales(freshSales);
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

  // --- EFFECTS ---
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loaderData) setLocalSales(Array.isArray(loaderData) ? loaderData : []);
    syncSalesWithServer();
  }, [loaderData, syncSalesWithServer]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- ACTIONS ---
  const executeVoid = async () => {
    if (!saleToVoid) return;
    setIsVoiding(true);

    const previousSales = [...localSales];
    const updated = localSales.filter((s) => s.id !== saleToVoid.id);
    setLocalSales(updated);

    try {
      const res = await authenticatedFetch(`${SALES_API_URL}${saleToVoid.id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        localStorage.setItem(
          SALES_CACHE_KEY,
          JSON.stringify({ data: updated, timestamp: Date.now() })
        );
        setToast({ message: "Sale voided successfully", visible: true });
        setSaleToVoid(null);
      } else {
        throw new Error("Void failed");
      }
    } catch (err) {
      alert("Failed to void sale. Reverting...");
      setLocalSales(previousSales);
    } finally {
      setIsVoiding(false);
    }
  };

  // --- DERIVED DATA ---
  const filteredSales = useMemo(() => {
    const search = filter.toLowerCase();
    return localSales.filter(
      (sale: any) =>
        sale.product_name?.toLowerCase().includes(search) ||
        sale.id?.toString().includes(search) ||
        sale.total_amount?.toString().includes(search)
    );
  }, [filter, localSales]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
    return { total, count: filteredSales.length };
  }, [filteredSales]);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
            <span className="bg-red-500 rounded-full p-1 leading-none">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </span>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 flex flex-col justify-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Records</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Refreshing Data..." : "Cloud Synced"}
            </span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-7 text-white shadow-xl flex items-center justify-between border border-gray-800 transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-3xl font-black">{stats.total.toLocaleString()} <span className="text-[10px] font-medium opacity-40">TZS</span></p>
          </div>
          <div className="w-14 h-14 bg-white/5 rounded-[1.25rem] flex items-center justify-center text-3xl">💰</div>
        </div>

        <div className="bg-indigo-600 rounded-[2.5rem] p-7 text-white shadow-xl flex items-center justify-between transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Sale Count</p>
            <p className="text-3xl font-black">{stats.count} <span className="text-[10px] font-medium opacity-40">Records</span></p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-[1.25rem] flex items-center justify-center text-3xl">🧾</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <input
          type="text"
          placeholder="Search by receipt ID or product name..."
          className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-800 text-xl font-bold placeholder:text-gray-300"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reference</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date / Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-black px-3 py-1 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-white transition-colors">
                        #{sale.id}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 text-sm">{sale.product_name}</p>
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Verified</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-700">
                      {new Date(sale.date_sold).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                      {new Date(sale.date_sold).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-base font-black text-gray-900">
                      {Number(sale.total_amount).toLocaleString()} 
                      <span className="text-[10px] text-gray-400 ml-1 tracking-tighter">TZS</span>
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => window.print()} 
                        className="p-3 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                        title="Print Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => setSaleToVoid(sale)}
                        className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                        title="Void Sale"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="py-32 text-center">
              <div className="text-4xl mb-4 opacity-20">📂</div>
              <p className="text-gray-900 font-black text-xl">No Sales Found</p>
              <p className="text-gray-400 text-sm">We couldn't find any records matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pretty Void Confirmation Modal */}
      {saleToVoid && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-red-50">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Void this sale?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                You are about to void sale <span className="font-bold text-gray-900">#{saleToVoid.id}</span>. This will remove it from total revenue.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={executeVoid}
                  disabled={isVoiding}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg shadow-red-100"
                >
                  {isVoiding ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : "Confirm Void"}
                </button>
                <button
                  onClick={() => setSaleToVoid(null)}
                  disabled={isVoiding}
                  className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}