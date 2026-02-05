import { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/products";
import { useAuth } from "~/Context/AppContext";
import { useNavigate, useLoaderData } from "react-router";

// --- CONFIGURATION ---
const PRODUCTS_API_URL = "http://127.0.0.1:8080/api/products/";
const CACHE_KEY = "msaidizi_products_cache";

// --- 1. LOADER: Instant data from LocalStorage ---
export async function clientLoader() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export default function Products() {
  const loaderData = useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- 2. STATE ---
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [viewingProduct, setViewingProduct] = useState<any>(null);

  // Helper to safely extract product array from API response
  const extractProducts = (data: any) => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  };

  // --- 3. BACKGROUND SYNC LOGIC ---
  const syncWithServer = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(PRODUCTS_API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });

      if (res.ok) {
        const freshData = await res.json();
        const products = extractProducts(freshData);

        // Update UI
        setLocalProducts(products);
        
        // Update Cache: Delete old, register new
        localStorage.removeItem(CACHE_KEY);
        localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // --- 4. EFFECTS ---
  
  // Guard: Protect route
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  // Initial Load: Use loader data (cache) and trigger background sync
  useEffect(() => {
    if (loaderData) {
      setLocalProducts(extractProducts(loaderData));
    }
    syncWithServer();
  }, [loaderData, syncWithServer]);


  // --- 5. ACTIONS ---

  const handleSell = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (product.quantity <= 0) return alert("Out of stock!");
    
    const newQty = product.quantity - 1;

    // Optimistic Update (update UI before server responds)
    setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: newQty } : p));

    try {
      await fetch(`${PRODUCTS_API_URL}${product.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
      // Silent re-sync to ensure everything is aligned
      syncWithServer();
    } catch (err) {
      alert("Sale failed. Re-syncing...");
      syncWithServer();
    }
  };

  const handleDelete = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${PRODUCTS_API_URL}${productId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` },
      });
      if (res.ok) {
        setLocalProducts(prev => prev.filter(p => p.id !== productId));
        // Update cache after delete
        const updatedCache = localProducts.filter(p => p.id !== productId);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ results: updatedCache }));
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // --- 6. FILTER LOGIC ---
  const filteredProducts = localProducts.filter(
    (p: any) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.part_number?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Inventory</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Syncing with server..." : "System Synced"}
            </span>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search name or part #..."
            className="pl-5 pr-4 py-3 border border-gray-200 rounded-2xl w-full md:w-96 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-bold"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Product & Brand</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">Part Number</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-right">Price</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Stock</th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product: any) => (
              <tr
                key={product.id}
                onClick={() => setViewingProduct(product)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-900">{product.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold">{product.brand || "No Brand"}</div>
                </td>
                <td className="px-6 py-5 text-sm font-mono text-gray-500">{product.part_number || "—"}</td>
                <td className="px-6 py-5 text-right font-black text-gray-900">
                  {Number(product.price).toLocaleString()} <span className="text-[10px] text-gray-400">TZS</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.quantity > 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {product.quantity} Units
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={(e) => handleSell(e, product)}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition active:scale-95"
                    >
                      Sell
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}/edit`); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{viewingProduct.brand || "Generic"}</span>
                <h2 className="text-3xl font-black text-gray-900">{viewingProduct.name}</h2>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-6 border-y border-gray-100 py-6 mb-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Current Stock</label>
                    <p className="text-2xl font-black text-gray-900">{viewingProduct.quantity} Units</p>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Unit Price</label>
                    <p className="text-2xl font-black text-gray-900">{Number(viewingProduct.price).toLocaleString()} TZS</p>
                </div>
            </div>
            <button 
                onClick={() => setViewingProduct(null)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}