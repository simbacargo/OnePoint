import { useState, useMemo, useEffect } from "react";
import type { Route } from "./+types/record-sale";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

const PRODUCTS_API_URL = "https://msaidizi.nsaro.com/api/products/";
const CREATE_SALE_URL = "https://msaidizi.nsaro.com/sales/";

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch("https://msaidizi.nsaro.com/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) throw new Error("Refresh failed");

  const data = await response.json();
  localStorage.setItem("access_token", data.access);
  return data.access;
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const token = localStorage.getItem("access_token");
    
    // If no token exists, don't even try to fetch; return empty to avoid the crash
    if (!token) return [];

    const res = await fetch(PRODUCTS_API_URL, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!res.ok) {
      console.warn("Product fetch failed with status:", res.status);
      return [];
    }

    const data = await res.json();
    return data.results || data || []; // Handle cases where data might not be in .results
  } catch (error) {
    console.error("Network error in clientLoader:", error);
    return []; // Return empty array so the component still renders
  }
}

export default function RecordSale({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated, accessToken } = useAuth(); // Replace with real authentication logic
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?next=/record-sale", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const allProducts = loaderData || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [serverResponse, setServerResponse] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // NEW: State for API interaction
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const filteredResults = useMemo(() => {
    if (searchTerm.length < 1) return [];
    const term = searchTerm.trim().toLowerCase();
    return allProducts.filter(
      (p: any) =>
        p.name.toLowerCase().includes(term) ||
        (p.part_number && p.part_number.toLowerCase().includes(term))
    );
  }, [searchTerm, allProducts]);

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      updateQty(product.id, 1);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setSearchTerm("");
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.qty,
    0
  );

  // --- NEW: API Submission Logic ---
  const handlePostSale = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setServerResponse(null);

    const saleObject = {
      customer_name: customerName || "Walking Customer",
      items: cart.map((item) => ({
        product: item.id,
        quantity_sold: item.qty,
        price_per_unit: parseFloat(item.price),
      })),
      total_amount: total,
      transaction_date: new Date().toISOString(),
    };

    try {
      const response = await fetch(CREATE_SALE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(saleObject),
      });

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data?.message || "Server failed to record sale");
      }

      setServerResponse({
        type: "success",
        message: data?.message || "Sale recorded successfully",
      });

      setCart([]);
      setCustomerName("");
    } catch (error: any) {
      setServerResponse({
        type: "error",
        message: error.message || "Could not save sale",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Input Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              Customer Details (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name..."
              className="w-full px-4 py-2 border-b border-gray-200 outline-none focus:border-blue-500 transition-all text-sm  text-gray-800 text-ls font-bold"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative">
            <label className="block text-sm font-bold text-gray-700 mb-2 underline decoration-blue-500 underline-offset-4">
              Find Product
            </label>
            <div className="relative">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or part number..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all  text-gray-800 text-ls font-bold"
              />
            </div>

            {filteredResults.length > 0 && (
              <div className="absolute z-50 left-6 right-6 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto border-t-4 border-t-blue-600">
                {filteredResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 inline-block rounded">
                        {p.part_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {Number(p.price).toLocaleString()} TZS
                      </div>
                      <div
                        className={`text-[10px] font-bold ${p.quantity > 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        Stock: {p.quantity}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right px-10">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {item.part_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-800 text-ls font-bold"
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="font-bold text-sm text-gray-800 text-ls font-bold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-800 text-ls font-bold"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {Number(item.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 pr-10">
                      {(item.price * item.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Side */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="bi bi-receipt text-blue-600"></i> Summary
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-baseline border-b border-dashed pb-4">
                <span className="text-lg font-bold text-gray-900">
                  Grand Total
                </span>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-600 leading-none">
                    {total.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-blue-400 block mt-1">
                    TZS
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePostSale}
              disabled={cart.length === 0 || isSubmitting}
              className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  SAVING...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-check"></i>
                  Post Transaction
                </>
              )}
            </button>
          </div>
          {serverResponse && (
            <div
              className={`mb-4 rounded-xl p-4 text-sm font-semibold ${
                serverResponse.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {serverResponse.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
