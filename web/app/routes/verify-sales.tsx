import { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/verify-sales";
import { useNavigate, useLoaderData } from "react-router";

// --- CONFIGURATION ---
const SALES_API_URL = "http://127.0.0.1:8080/sales/list_unverified_sales_api/?format=json";
const VERIFY_CACHE_KEY = "msaidizi_verify_cache";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Verify Sales" },
    { name: "description", content: "Review and confirm sales transactions." },
  ];
}

export async function clientLoader() {
  const cached = localStorage.getItem(VERIFY_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export default function VerifySales() {
  const loaderData = useLoaderData();
  const navigate = useNavigate();

  // --- 2. STATE ---
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localSales, setLocalSales] = useState<any[]>(
    Array.isArray(loaderData) ? loaderData : []
  );

  // New States for UI
  const [saleToVerify, setSaleToVerify] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  // --- 3. BACKGROUND SYNC ---
  const syncQueue = useCallback(async () => {
    setIsSyncing(true);
    const cacheBuster = new Date().getTime();
    try {
      const res = await fetch(`${SALES_API_URL}&cache_buster=${cacheBuster}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (res.ok) {
        const freshData = await res.json();
        const sales = Array.isArray(freshData) ? freshData : freshData.results || [];
        setLocalSales(sales);
        localStorage.setItem(VERIFY_CACHE_KEY, JSON.stringify(sales));
      }
    } catch (err) {
      console.error("Queue sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // --- 4. EFFECTS ---
  useEffect(() => {
    if (loaderData) setLocalSales(Array.isArray(loaderData) ? loaderData : []);
    syncQueue();
  }, [loaderData, syncQueue]);

  // Toast Auto-hide
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast({ ...toast, visible: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- 5. ACTIONS ---
  const executeVerify = async () => {
    if (!saleToVerify) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch(`http://127.0.0.1:8080/index/sales/${saleToVerify.id}/verify_sale/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });

      if (!res.ok) throw new Error("Verification failed");

      const updated = localSales.filter((sale) => sale.id !== saleToVerify.id);
      setLocalSales(updated);
      localStorage.setItem(VERIFY_CACHE_KEY, JSON.stringify(updated));
      
      setToast({ message: "Sale verified and finalized!", visible: true });
      setSaleToVerify(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Improved Filter: Search by Name, ID, or Part Number
  const filteredSales = localSales.filter((sale: any) => {
    const search = filter.toLowerCase();
    return (
      sale.product_name.toLowerCase().includes(search) ||
      sale.id.toString().includes(search) ||
      (sale.part_number && sale.part_number.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
            <div className="bg-green-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verification Queue</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Checking for new entries..." : "List Synchronized"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 px-6 py-2 rounded-2xl shadow-sm hidden sm:block">
            <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest">Pending</span>
            <span className="text-2xl font-black text-amber-600">{filteredSales.length}</span>
          </div>
          <div className="relative group flex-1 md:flex-none">
            <input
              type="text"
              placeholder="Filter by name, ID, or part #..."
              className="pl-6 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full md:w-96 bg-white transition-all text-gray-800 text-lg font-bold shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sale Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-amber-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="text-sm text-gray-900 font-bold">
                      {new Date(sale.date_sold).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium italic">
                      {new Date(sale.date_sold).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black text-[10px] group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                        #{sale.id}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-800 uppercase tracking-tight">{sale.product_name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{sale.part_number || 'No Part #'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-gray-900">
                      {Number(sale.total_amount).toLocaleString()} <span className="text-[10px] text-gray-400">TZS</span>
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase tracking-tighter">
                      Unverified
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        className="px-4 py-2 text-gray-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => setSaleToVerify(sale)}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                      >
                        Verify Sale
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSales.length === 0 && !isSyncing && (
          <div className="py-24 text-center">
            <div className="text-4xl mb-4">✨</div>
            <p className="text-gray-900 font-black text-lg">Inbox Zero</p>
            <p className="text-gray-400 text-sm">You have no unverified sales.</p>
          </div>
        )}
      </div>

      {/* Pretty Verification Modal */}
      {saleToVerify && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-green-50">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Verify Transaction?</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Confirming sale <span className="font-bold text-gray-900">#{saleToVerify.id}</span> for <span className="font-bold text-gray-900">{saleToVerify.product_name}</span>.
              </p>

              <div className="w-full bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Total Amount</span>
                <span className="text-xl font-black text-gray-900">{Number(saleToVerify.total_amount).toLocaleString()} TZS</span>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={executeVerify}
                  disabled={isProcessing}
                  className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg shadow-green-200"
                >
                  {isProcessing ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : "Finalize Verification"}
                </button>
                <button
                  onClick={() => setSaleToVerify(null)}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}