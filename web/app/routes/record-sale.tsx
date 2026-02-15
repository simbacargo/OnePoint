import { useState, useMemo, useEffect } from "react";
import type { Route } from "./+types/record-sale";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

const PRODUCTS_API_URL = "http://127.0.0.1:8080/api/products/";
const CUSTOMERS_API_URL = "http://127.0.0.1:8080/api/customers/";
const CREATE_SALE_URL = "http://127.0.0.1:8080/sales/";

// --- TOKEN REFRESH LOGIC ---
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch("http://127.0.0.1:8080/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) throw new Error("Refresh failed");

  const data = await response.json();
  localStorage.setItem("access_token", data.access);
  return data.access;
}

// --- UPDATED LOADER: Fetching both Products and Customers ---
export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return { products: [], customers: [] };

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    const [prodRes, custRes] = await Promise.all([
      fetch(PRODUCTS_API_URL, { headers }),
      fetch(CUSTOMERS_API_URL, { headers })
    ]);

    const prodData = await prodRes.json();
    const custData = await custRes.json();

    return {
      products: prodData.results || prodData || [],
      customers: custData.results || custData || []
    };
  } catch (error) {
    console.error("Network error in clientLoader:", error);
    return { products: [], customers: [] };
  }
}

export default function RecordSale({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?next=/record-sale", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // --- EXTRACT DATA FROM LOADER ---
  const allProducts = loaderData?.products || [];
  const allCustomers = loaderData?.customers || [];

  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState(""); // Product search
  const [customerSearch, setCustomerSearch] = useState(""); // Customer search
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverResponse, setServerResponse] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --- CLIENT-SIDE FILTERING: CUSTOMERS ---
  const filteredCustomers = useMemo(() => {
    if (customerSearch.length < 1 || (selectedCustomer && selectedCustomer.name === customerSearch)) {
      return [];
    }
    const term = customerSearch.toLowerCase();
    return allCustomers.filter((c: any) => 
      c.name.toLowerCase().includes(term) || 
      (c.phone && c.phone.includes(term))
    );
  }, [customerSearch, allCustomers, selectedCustomer]);

  // --- CLIENT-SIDE FILTERING: PRODUCTS ---
  const filteredResults = useMemo(() => {
    if (searchTerm.length < 1) return [];
    const term = searchTerm.trim().toLowerCase();
    return allProducts.filter(
      (p: any) =>
        p.name.toLowerCase().includes(term) ||
        (p.part_number && p.part_number.toLowerCase().includes(term))
    );
  }, [searchTerm, allProducts]);

  // --- CART FUNCTIONS ---
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

  // --- SUBMISSION LOGIC ---
  const handlePostSale = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setServerResponse(null);

    const saleObject = {
      customer_id: selectedCustomer?.id || null, // Send ID if selected
      customer_name: customerSearch || "Walking Customer",
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
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(saleObject),
      });

      const data = await response.json(); 

      if (!response.ok) throw new Error(data?.message || "Failed to record sale");

      setServerResponse({ type: "success", message: "Sale recorded successfully" });
      setCart([]);
      setCustomerSearch("");
      setSelectedCustomer(null);
    } catch (error: any) {
      setServerResponse({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* CUSTOMER INPUT SECTION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">
              Customer Details {selectedCustomer && <span className="text-blue-600 ml-2">✓ Selected</span>}
            </label>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                if (selectedCustomer) setSelectedCustomer(null);
              }}
              placeholder="Search or enter customer name..."
              className="w-full px-4 py-2 border-b border-gray-200 outline-none focus:border-blue-500 transition-all text-sm text-gray-800 font-bold"
            />
            
            {/* Customer Dropdown */}
            {filteredCustomers.length > 0 && (
              <div className="absolute z-[60] left-6 right-6 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto border-t-4 border-t-blue-500">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerSearch(c.name);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.phone || "No phone"}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT SEARCH SECTION */}
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
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 font-bold"
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
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CART TABLE */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Quantity</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right px-10">Subtotal</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{item.part_number}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 font-bold">-</button>
                        <span className="font-bold text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 font-bold">+</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {Number(item.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 pr-10">
                      {(item.price * item.qty).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                         <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY SIDE */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="bi bi-receipt text-blue-600"></i> Summary
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-baseline border-b border-dashed pb-4">
                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-600 leading-none">
                    {total.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-blue-400 block mt-1">TZS</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePostSale}
              disabled={cart.length === 0 || isSubmitting}
              className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              {isSubmitting ? "SAVING..." : "Post Transaction"}
            </button>
          </div>
          {serverResponse && (
            <div className={`mt-4 rounded-xl p-4 text-sm font-semibold ${
                serverResponse.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
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