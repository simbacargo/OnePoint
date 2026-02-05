import { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/customers";
import { useAuth } from "~/Context/AppContext";
import { useNavigate, useLoaderData } from "react-router";

// --- CONFIGURATION ---
const CUSTOMERS_API_URL = "http://127.0.0.1:8080/api/customers/";
const CUSTOMER_CACHE_KEY = "msaidizi_customer_cache";

// --- 1. LOADER: Instant cache delivery ---
export async function clientLoader() {
  const cached = localStorage.getItem(CUSTOMER_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export default function Customers() {
  const loaderData = useLoaderData() as any;
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- 2. STATE ---
  const [localCustomers, setLocalCustomers] = useState<any[]>(
    Array.isArray(loaderData) ? loaderData : loaderData?.results || []
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState("");

  // --- 3. BACKGROUND SYNC LOGIC ---
  const syncCustomers = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(CUSTOMERS_API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const freshList = Array.isArray(data) ? data : data.results || [];

        // Update UI
        setLocalCustomers(freshList);

        // Update Cache: Wipe old and register fresh
        localStorage.removeItem(CUSTOMER_CACHE_KEY);
        localStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(freshList));
      }
    } catch (err) {
      console.error("Customer sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // --- 4. EFFECTS ---

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Initial Sync: Use loader data immediately, then fetch fresh in background
  useEffect(() => {
    if (loaderData) {
      setLocalCustomers(Array.isArray(loaderData) ? loaderData : loaderData?.results || []);
    }
    syncCustomers();
  }, [loaderData, syncCustomers]);

  // --- 5. FILTER LOGIC ---
  const filteredCustomers = localCustomers.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.phone?.includes(filter)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Accounts</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Syncing Ledger..." : "Accounts Synced"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-6 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none w-full md:w-80 bg-white transition-all shadow-sm text-gray-800 text-xl font-bold"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button 
            className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95" 
            onClick={() => navigate('/customers/new')}
          >
             New Customer
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance Owed</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const balance = Number(customer.remaining_balance || 0);
                  const isClear = balance <= 0;
                  const isUrgent = balance > 50000;

                  return (
                    <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-gray-900">{customer.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ACC #{customer.id}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-gray-700">{customer.email || 'No Email'}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{customer.phone || 'No Phone'}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className={`text-base font-black ${isClear ? 'text-gray-400' : 'text-red-600'}`}>
                          {balance.toLocaleString()} <span className="text-[10px]">TZS</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          isClear 
                          ? 'bg-green-100 text-green-700' 
                          : isUrgent 
                          ? 'bg-red-100 text-red-600 animate-pulse' 
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isClear ? 'Cleared' : isUrgent ? 'Debt Warning' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm">
                            📄
                          </button>
                          <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm">
                            💰
                          </button>
                          <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                    {isSyncing ? "Searching database..." : "No matching customer records found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}