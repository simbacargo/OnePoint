import { useEffect, useState } from "react";
import type { Route } from "./+types/sales";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

const SALES_API_URL = "https://msaidizi.nsaro.com/sales/";
const SALES_CACHE_KEY = "msaidizi_sales_cache";
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes in milliseconds

export async function clientLoader({}: Route.ClientLoaderArgs) {
  // 1. Check for existing cache
  const cachedData = localStorage.getItem(SALES_CACHE_KEY);
  
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

    if (!isExpired) {
      console.log("Loading sales from cache...");
      return data;
    }
  }

  // 2. If no cache or expired, fetch fresh data
  console.log("Fetching fresh sales data...");
  const res = await fetch(SALES_API_URL);
  if (!res.ok) throw new Error("Failed to fetch sales");
  const freshData = await res.json();

  // 3. Save to localStorage
  localStorage.setItem(SALES_CACHE_KEY, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));

  return freshData;
}

export default function Sales({ loaderData }: Route.ComponentProps) {
    const {isAuthenticated} = useAuth(); // Replace with real authentication logic
const navigate = useNavigate();

useEffect(() => {
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
  }
}, [isAuthenticated, navigate]);
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Handling both direct arrays or paginated .results structure
  const sales = Array.isArray(loaderData) ? loaderData : loaderData?.results || [];

  // Manual Cache Refresh
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(SALES_API_URL);
      const data = await res.json();
      localStorage.setItem(SALES_CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
      window.location.reload(); 
    } catch (err) {
      alert("Sync failed. Please check your internet connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSales = sales.filter((sale: any) =>
    sale.product_name.toLowerCase().includes(filter.toLowerCase()) ||
    sale.id.toString().includes(filter)
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">History Feed</span>
            <span className="text-gray-300">|</span>
            <button 
              onClick={handleSync}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <i className={`bi bi-arrow-clockwise ${isSyncing ? 'animate-spin' : ''}`}></i>
              {isSyncing ? 'Updating...' : 'Sync Latest Sales'}
            </button>
          </div>
        </div>

        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search Sale ID or Product..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Sale ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Product Sold</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-right">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale: any) => (
                  <tr key={sale.id} className="odd:bg-gray-50/50 even:bg-white hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">#{sale.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                      {sale.product_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 text-right">
                      {Number(sale.amount).toLocaleString()} TZS
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex justify-center gap-3 text-gray-400">
                          <button className="hover:text-blue-600" title="View Receipt">
                            <i className="bi bi-printer"></i>
                          </button>
                          <button className="hover:text-red-500" title="Void Sale">
                            <i className="bi bi-trash"></i>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    No sales records found.
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
