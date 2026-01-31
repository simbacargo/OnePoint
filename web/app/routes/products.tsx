import { useState, useEffect } from "react";
import type { Route } from "./+types/products";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

// --- CONFIGURATION ---
const PRODUCTS_API_URL = "http://127.0.0.1:8080/api/products/";
const CACHE_KEY = "msaidizi_products_cache";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

// --- DATA LOADING ---
export async function clientLoader({}: Route.ClientLoaderArgs) {
  // const cachedData = localStorage.getItem(CACHE_KEY);
  // if (cachedData) {
  //   const { data, timestamp } = JSON.parse(cachedData);
  //   if (Date.now() - timestamp < CACHE_EXPIRY) {
  //     return data; // This should be the full { count, next, results: [] } object
  //   }
  // }

  const res = await fetch(PRODUCTS_API_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch products");
  const freshData = await res.json();

  // Store the WHOLE response
  // localStorage.setItem(
  //   CACHE_KEY,
  //   JSON.stringify({ data: freshData, timestamp: Date.now() }),
  // );
  return freshData;
}

export default function Products({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const extractProducts = (data: any) => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results || [];
  };
  // --- STATE ---
  const [filter, setFilter] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [localProducts, setLocalProducts] = useState(
    extractProducts(loaderData),
  );
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setLocalProducts(extractProducts(loaderData));
  }, [loaderData]);

  // --- ACTIONS ---

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(PRODUCTS_API_URL, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });
      const data = await res.json();
      // localStorage.setItem(
      //   CACHE_KEY,
      //   JSON.stringify({ data, timestamp: Date.now() }),
      // );
      setLocalProducts(data.results);
    } catch (err) {
      alert("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSell = async (product: any) => {
    if (product.quantity <= 0) return alert("Out of stock!");
    const newQty = product.quantity - 1;

    try {
      setLocalProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, quantity: newQty } : p)),
      );
      await fetch(`${PRODUCTS_API_URL}${product.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
    } catch (err) {
      alert("Sale failed. Reverting...");
      handleSync();
    }
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${PRODUCTS_API_URL}${editingProduct.id}/`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },

        body: JSON.stringify({
          price: editingProduct.price,
          quantity: editingProduct.quantity,
        }),
      });
      if (res.ok) {
        setEditingProduct(null);
        handleSync();
      }
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const res = await fetch(`${PRODUCTS_API_URL}${productId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
      });
      if (res.ok) {
        setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const filteredProducts = localProducts?.filter(
    (p: any) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.part_number?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Product Inventory
          </h1>
          <button
            onClick={handleSync}
            className="text-sm font-bold text-blue-600 flex items-center gap-2 mt-1"
          >
            <i
              className={`bi bi-arrow-clockwise ${isSyncing ? "animate-spin" : ""}`}
            ></i>
            {isSyncing ? "Syncing..." : "Refresh Data"}
          </button>
        </div>

        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search name or part #..."
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl w-full md:w-96 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 text-xl font-bold"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Product & Brand
              </th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Part Number
              </th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                Price
              </th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                Stock
              </th>
              <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts?.map((product: any) => (
              <tr
                key={product.id}
                className="hover:bg-blue-50/20 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-900">{product.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {product.brand || "Generic"}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-mono text-gray-600">
                  {product.part_number || "—"}
                </td>
                <td className="px-6 py-5 text-right font-black text-gray-900">
                  {Number(product.price).toLocaleString()} TZS
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      product.quantity > 5
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.quantity} In Stock
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleSell(product)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700"
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Update Stock
            </h2>
            <form onSubmit={handleSaveUpdate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Price (TZS)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  value={editingProduct.quantity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      quantity: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
