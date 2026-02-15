import { useState, useEffect, useCallback } from "react";
import type { Route } from "./+types/products";
import { useAuth } from "~/Context/AppContext";
import { useNavigate, useLoaderData } from "react-router";

// --- CONFIGURATION ---
const PRODUCTS_API_URL = "http://127.0.0.1:8080/products_api/";
const NEW_PRODUCTS_API_URL = "http://127.0.0.1:8080/products_api/";
const CACHE_KEY = "msaidizi_products_cache";

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

  // --- STATE ---
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [sellingId, setSellingId] = useState<number | null>(null);
  
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const extractProducts = (data: any) => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  };

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
        setLocalProducts(products);
        localStorage.removeItem(CACHE_KEY);
        localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loaderData) {
      setLocalProducts(extractProducts(loaderData));
    }
    syncWithServer();
  }, [loaderData, syncWithServer]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, visible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- ACTIONS ---
  const handleSell = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (product.quantity <= 0) return alert("Out of stock!");
    
    setSellingId(product.id);
    const newQty = product.quantity - 1;

    setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: newQty } : p));

    try {
      const res = await fetch(`${NEW_PRODUCTS_API_URL}${product.id}/sale/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        setToast({ message: "Product sold successfully!", visible: true });
      }
      await syncWithServer();
    } catch (err) {
      alert("Sale failed. Re-syncing...");
      await syncWithServer();
    } finally {
      setSellingId(null);
    }
  };

  const initiateDelete = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`${NEW_PRODUCTS_API_URL}${productToDelete.id}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` },
      });
      if (res.ok) {
        setLocalProducts(prev => prev.filter(p => p.id !== productToDelete.id));
        setToast({ message: "Product deleted successfully", visible: true });
        setProductToDelete(null);
      }
    } catch (err) {
      alert("Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = localProducts.filter((p: any) => {
    const searchStr = filter.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchStr) ||
      (p.part_number && p.part_number.toLowerCase().includes(searchStr)) ||
      (p.brand && p.brand.toLowerCase().includes(searchStr))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      
      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700">
            <span className="bg-green-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
            </span>
            <span className="font-bold text-sm tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Inventory</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {isSyncing ? "Syncing..." : "System Synced"}
            </span>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search name, brand, or part #..."
            className="pl-12 pr-4 py-4 border border-gray-200 rounded-[1.5rem] w-full md:w-96 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-gray-800 font-bold transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
        {filteredProducts.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Product & Brand</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Part Number</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
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
                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-black mt-0.5">{product.brand || "No Brand"}</div>
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
                  <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={(e) => handleSell(e, product)}
                        disabled={sellingId === product.id}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 flex items-center gap-2 ${
                          sellingId === product.id 
                            ? "bg-gray-400 cursor-not-allowed text-white" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200"
                        }`}
                      >
                        {sellingId === product.id ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : "Sell"}
                      </button>
                      <button 
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      >
                        ✎
                      </button>
                      <button 
                        onClick={(e) => initiateDelete(e, product)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500">Try searching for a different name or brand.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-red-50">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                You are about to delete <span className="font-bold text-gray-900">"{productToDelete.name}"</span>. 
                This action is permanent.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3 shadow-lg shadow-red-200"
                >
                  {isDeleting ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition"
                >
                  Keep Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal with Vehicle Support */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">{viewingProduct.brand || "Generic"}</span>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">{viewingProduct.name}</h2>
                <p className="text-xs font-mono text-gray-400 mt-1">PN: {viewingProduct.part_number || "N/A"}</p>
              </div>
              <button 
                onClick={() => setViewingProduct(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 border-y border-gray-100 py-6 mb-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Stock</label>
                    <p className="text-2xl font-black text-gray-900">{viewingProduct.quantity} Units</p>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</label>
                    <p className="text-2xl font-black text-gray-900">{Number(viewingProduct.price).toLocaleString()} <span className="text-xs text-gray-400">TZS</span></p>
                </div>
            </div>

            {/* Vehicle List Section */}
            <div className="mb-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Compatible Vehicles</label>
              <div className="flex flex-wrap gap-2">
                {viewingProduct.vehicles && viewingProduct.vehicles.length > 0 ? (
                  viewingProduct.vehicles.map((vehicle: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100">
                      {typeof vehicle === 'string' ? vehicle : (vehicle.model || vehicle.name)}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No specific vehicle data available.</p>
                )}
              </div>
            </div>

            <button 
                onClick={() => setViewingProduct(null)}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}