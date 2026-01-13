import { useState, useEffect } from "react";
import type { Route } from "./+types/products";
import { useAuth } from "~/Context/AppContext";
import { redirect, useNavigate } from "react-router";

const PRODUCTS_API_URL = "https://msaidizi.nsaro.com/api/products/"; // Replace with your actual API endpoint from https://api.juma.com/products/";
const CACHE_KEY = "msaidizi_products_cache";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

export async function clientLoader({}: Route.ClientLoaderArgs) {
  // 1. Check for existing cache
  const cachedData = localStorage.getItem(CACHE_KEY);
  
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

    if (!isExpired) {
      console.log("Loading from cache...");
      return data;
    }
  }

  
  // 2. If no cache or expired, fetch fresh data
  console.log("Fetching fresh data from API...");
  const res = await fetch(PRODUCTS_API_URL);
  if (!res.ok) throw new Error("Failed to fetch products");
  const freshData = await res.json();

  // 3. Save to localStorage
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));

  return freshData;
}
export async function loader({ request }: Route.LoaderArgs) {
  //   const {isAuthenticated} = useAuth(); // Replace with real authentication logic
  //   alert(isAuthenticated);
  // if (!isAuthenticated(request)){
  //   throw redirect("/login");
  // }
}

export default function Products({ loaderData }: Route.ComponentProps) {
    const {isAuthenticated} = useAuth(); // Replace with real authentication logic
const navigate = useNavigate();

useEffect(() => {
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
  }
}, [isAuthenticated, navigate]);
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  
  const products = loaderData?.results || [];

  // Manual Cache Refresh Function
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(PRODUCTS_API_URL);
      const data = await res.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
      window.location.reload(); // Refresh to show new data
    } catch (err) {
      alert("Sync failed. Check connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.part_number.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Total: {loaderData?.count}</span>
            <span className="text-gray-300">|</span>
            <button 
              onClick={handleSync}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <i className={`bi bi-arrow-clockwise ${isSyncing ? 'animate-spin' : ''}`}></i>
              {isSyncing ? 'Syncing...' : 'Sync Fresh Data'}
            </button>
          </div>
        </div>

        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search by name or part #..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Product & Brand</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Part Number</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-right">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-center">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product: any) => (
              <tr key={product.id} className="odd:bg-gray-50/50 even:bg-white hover:bg-blue-50/30">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{product.name}</div>
                  <div className="text-[10px] text-gray-500">{product.brand}</div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{product.part_number}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {Number(product.price).toLocaleString()} TZS
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    product.quantity > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.quantity} In Stock
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                   <div className="flex justify-center gap-2 text-gray-400">
                      <button className="hover:text-blue-600"><i className="bi bi-pencil"></i></button>
                      <button className="hover:text-red-600"><i className="bi bi-trash"></i></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
