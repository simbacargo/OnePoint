import { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/customers";
import { useAuth } from "~/Context/AppContext";
import { useNavigate, useLoaderData } from "react-router";

// --- CONFIGURATION ---
const CUSTOMERS_API_URL = "http://127.0.0.1:8080/api/customers/";
const CUSTOMER_CACHE_KEY = "msaidizi_customer_cache";

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

  // Pretty UI States
  const [customerToDelete, setCustomerToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

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
        setLocalCustomers(freshList);
        localStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(freshList));
      }
    } catch (err) {
      console.error("Customer sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // --- 4. EFFECTS ---
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loaderData) {
      setLocalCustomers(Array.isArray(loaderData) ? loaderData : loaderData?.results || []);
    }
    syncCustomers();
  }, [loaderData, syncCustomers]);

  // Toast Auto-hide
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- 5. ACTIONS ---
  const executeDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${CUSTOMERS_API_URL}${customerToDelete.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` },
      });
      if (res.ok) {
        const updated = localCustomers.filter(c => c.id !== customerToDelete.id);
        setLocalCustomers(updated);
        localStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(updated));
        setToast({ message: "Customer account removed", visible: true });
        setCustomerToDelete(null);
      }
    } catch (err) {
      alert("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- 6. FILTER LOGIC ---
  const filteredCustomers = localCustomers.filter(c => {
    const search = filter.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) || 
      (c.phone && c.phone.includes(search)) ||
      c.id.toString().includes(search)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
            <div className="bg-blue-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Accounts</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Syncing Ledger..." : "Accounts Synced"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-auto">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-14 pr-6 py-4 border border-gray-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-80 bg-white transition-all shadow-sm text-gray-800 text-lg font-bold"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button 
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95" 
            onClick={() => navigate('/customers/new')}
          >
             <span className="text-xl">+</span> New Customer
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance Owed</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const balance = Number(customer.remaining_balance || 0);
                  const isClear = balance <= 0;
                  const isUrgent = balance > 50000;

                  return (
                    <tr key={customer.id} className="hover:bg-blue-50/20 transition-all group cursor-pointer" onClick={() => navigate(`/customers/${customer.id}`)}>
                      <td className="px-8 py-6">
                        <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Ref: ACC-{customer.id}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-gray-700">{customer.email || 'No Email Record'}</div>
                        <div className="text-[10px] text-gray-400 font-bold tracking-tight">{customer.phone || 'No Phone Number'}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className={`text-base font-black ${isClear ? 'text-gray-300' : 'text-red-600'}`}>
                          {balance.toLocaleString()} <span className="text-[10px] ml-0.5">TZS</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          isClear 
                          ? 'bg-green-100 text-green-700' 
                          : isUrgent 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isClear ? 'Cleared' : isUrgent ? 'Debt Warning' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button 
                            className="p-3 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                            title="View Statement"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                          <button 
                            className="p-3 bg-gray-50 text-gray-400 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Collect Payment"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                          <button 
                            onClick={() => setCustomerToDelete(customer)}
                            className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                            title="Delete Account"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="text-4xl mb-4 opacity-20 text-gray-500">👥</div>
                    <h3 className="text-xl font-black text-gray-900">No Customers Found</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      {filter ? `We couldn't find any results for "${filter}"` : "Your customer list is currently empty."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pretty Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 border border-red-50">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Account?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                You are removing <span className="font-bold text-gray-900">{customerToDelete.name}</span>. This will delete all history for this account.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg shadow-red-100"
                >
                  {isDeleting ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : "Confirm Deletion"}
                </button>
                <button
                  onClick={() => setCustomerToDelete(null)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
                >
                  Keep Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}