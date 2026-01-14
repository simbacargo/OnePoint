import { useEffect, useState } from "react";
import type { Route } from "./+types/sales";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

const SALES_API_URL = "https://msaidizi.nsaro.com/sales/";
const SALES_CACHE_KEY = "msaidizi_sales_cache";
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

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

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  const sales = Array.isArray(loaderData) ? loaderData : loaderData?.results || [];
  
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(SALES_API_URL);
      const data = await res.json();
      localStorage.setItem(SALES_CACHE_KEY, JSON.stringify({ data: data, timestamp: Date.now() }));
      window.location.reload(); 
    } catch (err) {
      alert("Sync failed. Check internet connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSales = sales.filter((sale: any) =>
    sale.product_name.toLowerCase().includes(filter.toLowerCase()) ||
    sale.id.toString().includes(filter)
  );

  // UI Calculation
  const totalRevenue = filteredSales.reduce((acc: number, sale: any) => acc + Number(sale.total_amount), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Records</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider">Live Feed</span>
            </div>
            <button 
              onClick={handleSync}
              className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all flex items-center gap-2"
            >
              <i className={`bi bi-arrow-clockwise ${isSyncing ? 'animate-spin' : ''}`}></i>
              {isSyncing ? 'Syncing...' : 'Refresh Cache'}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
           {/* Total Sales Badge */}
           <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex flex-col justify-center min-w-[180px] shadow-xl shadow-gray-200">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filtered Revenue</span>
              <span className="text-lg font-black">{totalRevenue.toLocaleString()} <span className="text-xs font-medium text-gray-400">TZS</span></span>
           </div>

          <div className="relative w-full sm:w-80">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by ID or Product..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm text-sm font-medium"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale: any) => (
                  <tr key={sale.id} className="group hover:bg-blue-50/30 transition-all cursor-default">
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-mono font-bold">
                        #{sale.id}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                        {sale.product_name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Standard Unit Sale</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm text-gray-700 font-medium">
                        {new Date(sale.date_sold).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-gray-400">At {new Date(sale.date_sold).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-base font-black text-gray-900">
                        {Number(sale.total_amount).toLocaleString()}
                        <span className="text-[10px] ml-1 text-gray-400">TZS</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex justify-center gap-2">
                          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Print Receipt">
                            <i className="bi bi-printer"></i>
                          </button>
                          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" title="Void Sale">
                            <i className="bi bi-trash3"></i>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <i className="bi bi-search text-4xl text-gray-200"></i>
                        <p className="text-gray-400 font-medium italic">No sales records found matching "{filter}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {filteredSales.length} Transactions
          </p>
          <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30" disabled><i className="bi bi-chevron-left"></i></button>
              <button className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30" disabled><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
}