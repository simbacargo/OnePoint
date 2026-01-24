import { useEffect, useState, useMemo } from "react";
import type { Route } from "./+types/sales";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

const SALES_API_URL = "https://msaidizi.nsaro.com/api/sales/";
const SALES_CACHE_KEY = "msaidizi_sales_cache";
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 mins

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const cachedData = localStorage.getItem(SALES_CACHE_KEY);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_EXPIRY) return data;
  }

  const res = await fetch(SALES_API_URL);
  if (!res.ok) throw new Error("Failed to fetch sales");
  const freshData = await res.json();
  localStorage.setItem(SALES_CACHE_KEY, JSON.stringify({ data: freshData, timestamp: Date.now() }));
  return freshData;
}

export default function Sales({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  // Store sales in local state so we can delete items without a full page reload
  const [localSales, setLocalSales] = useState(
    Array.isArray(loaderData) ? loaderData : loaderData?.results || []
  );

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // --- ACTIONS ---

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(SALES_API_URL);
      const data = await res.json();
      localStorage.setItem(SALES_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      setLocalSales(Array.isArray(data) ? data : data.results);
    } catch (err) {
      alert("Sync failed. Check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleVoidSale = async (saleId: number) => {
    if (!window.confirm("Are you sure you want to void (delete) this sale? This will not restore inventory automatically.")) return;
    
    try {
      const res = await fetch(`${SALES_API_URL}${saleId}/`, { method: "DELETE" });
      if (res.ok) {
        setLocalSales(prev => prev.filter(s => s.id !== saleId));
      }
    } catch (err) {
      alert("Failed to void sale.");
    }
  };

  // --- CALCULATIONS ---
  // useMemo prevents recalculating on every tiny render
  const filteredSales = useMemo(() => {
    return localSales.filter((sale: any) =>
      sale.product_name.toLowerCase().includes(filter.toLowerCase()) ||
      sale.id.toString().includes(filter)
    );
  }, [filter, localSales]);

  const stats = useMemo(() => {
    const total = filteredSales.reduce((acc: number, sale: any) => acc + Number(sale.total_amount), 0);
    const count = filteredSales.length;
    return { total, count };
  }, [filteredSales]);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Records</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Tracking all outgoing transactions.</p>
          <button 
            onClick={handleSync}
            className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-2 hover:underline"
          >
            <i className={`bi bi-arrow-clockwise ${isSyncing ? 'animate-spin' : ''}`}></i>
            {isSyncing ? 'Fetching...' : 'Refresh Records'}
          </button>
        </div>

        <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
            <p className="text-2xl font-black">{stats.total.toLocaleString()} <span className="text-xs font-normal opacity-50 text-white">TZS</span></p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
            <i className="bi bi-cash-stack"></i>
          </div>
        </div>

        <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Transaction Count</p>
            <p className="text-2xl font-black">{stats.count} <span className="text-xs font-normal opacity-50 text-white">Sales</span></p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
            <i className="bi bi-receipt"></i>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative group">
        <i className="bi bi-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"></i>
        <input
          type="text"
          placeholder="Filter by receipt ID or product name..."
          className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium"
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
                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs font-bold text-gray-400">#{sale.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 text-sm">{sale.product_name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Completed Sale</p>
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
                        className="p-2.5 bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <i className="bi bi-printer"></i>
                      </button>
                      <button 
                        onClick={() => handleVoidSale(sale.id)}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}