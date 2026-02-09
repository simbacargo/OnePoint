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

// --- 1. LOADER: Instant cache delivery ---
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
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [localSales, setLocalSales] = useState<any[]>(
    Array.isArray(loaderData) ? loaderData : []
  );

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
        // Delete old cache and register new
        localStorage.removeItem(VERIFY_CACHE_KEY);
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
    if (loaderData) {
      setLocalSales(Array.isArray(loaderData) ? loaderData : []);
    }
    syncQueue();
  }, [loaderData, syncQueue]);

  // --- 5. ACTIONS ---
  const handleVerify = async (saleId: number) => {
    setIsProcessing(saleId);
    try {
      const res = await fetch(`http://127.0.0.1:8080/index/sales/${saleId}/verify_sale/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        }
      });

      if (!res.ok) throw new Error("Verification failed");

      // Success Logic:
      // 1. Remove from Local State
      const updated = localSales.filter((sale) => sale.id !== saleId);
      setLocalSales(updated);
      
      // 2. Update Cache
      localStorage.setItem(VERIFY_CACHE_KEY, JSON.stringify(updated));
      
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredSales = localSales.filter((sale: any) =>
    sale.product_name.toLowerCase().includes(filter.toLowerCase()) ||
    sale.id.toString().includes(filter)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      
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
          <div className="bg-white border border-gray-200 px-6 py-2 rounded-2xl shadow-sm">
            <span className="block text-[10px] text-gray-400 font-black uppercase tracking-widest">Pending</span>
            <span className="text-2xl font-black text-amber-600">{filteredSales.length}</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Filter queue..."
              className="pl-6 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-50 outline-none w-full md:w-80 bg-white transition-all text-gray-800 text-xl font-bold"
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
                <tr key={sale.id} className="hover:bg-amber-50/20 transition-all">
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
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black text-xs">
                        #{sale.id}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-800">{sale.product_name} - {sale.part_number}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Needs Review</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-gray-900">
                      {Number(sale.total_amount).toLocaleString()} <span className="text-[10px] text-gray-400">TZS</span>
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase">
                      Pending
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        disabled={isProcessing === sale.id}
                        className="px-4 py-2 text-gray-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Reject
                      </button>
                      <button 
                        disabled={isProcessing === sale.id}
                        onClick={() => handleVerify(sale.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2"
                      >
                        {isProcessing === sale.id ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : "Verify Sale"}
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
            <p className="text-gray-900 font-black text-lg">Queue Empty</p>
            <p className="text-gray-400 text-sm">Everything has been verified.</p>
          </div>
        )}
      </div>
    </div>
  );
}