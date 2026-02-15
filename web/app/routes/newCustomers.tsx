import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

// --- CONFIGURATION ---
const API_BASE = "http://127.0.0.1:8080";
const CUSTOMERS_URL = `${API_BASE}/api/customers/`;
const PRODUCTS_URL = `${API_BASE}/api/products/`;

interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  part_number: string;
  quantity: number;
}

export default function RegisterCustomer() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    remaining_balance: 0,
    initial_product_id: "",
    quantity_taken: 1,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- FETCH PRODUCTS ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(PRODUCTS_URL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) { console.error("Failed to load products", err); }
    };
    fetchProducts();
  }, []);

  // --- SEARCH & FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const s = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.brand.toLowerCase().includes(s) || 
      p.part_number.toLowerCase().includes(s)
    );
  }, [products, searchTerm]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id.toString() === formData.initial_product_id),
    [products, formData.initial_product_id]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-calculate balance
  useEffect(() => {
    if (selectedProduct) {
      const total = parseFloat(selectedProduct.price) * formData.quantity_taken;
      setFormData(prev => ({ ...prev, remaining_balance: total }));
    }
  }, [selectedProduct, formData.quantity_taken]);

  const handleSubmit  = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.initial_product_id) {
        setMessage({ type: "error", text: "Please select a product first." });
        return;
    }
    setLoading(true);
    try {
      const response = await fetch(CUSTOMERS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register customer.");
      }

      setMessage({ type: "success", text: "Profile & Transaction recorded!" });
      setTimeout(() => navigate("/customers"), 2000);
      
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Credit Registration</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Fields (Simplified for brevity) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
                </div>

                {/* SEARCHABLE PRODUCT FIELD */}
                <div className="space-y-3 md:col-span-2 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Item</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type name, brand, or part number..."
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all font-bold shadow-inner"
                      value={isOpen ? searchTerm : (selectedProduct ? `${selectedProduct.brand} ${selectedProduct.name}` : searchTerm)}
                      onFocus={() => { setIsOpen(true); setSearchTerm(""); }}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      {isOpen ? "🔍" : "▼"}
                    </div>

                    {/* Results Dropdown */}
                    {isOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl max-h-60 overflow-y-auto p-2 animate-in slide-in-from-top-2">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, initial_product_id: p.id.toString() });
                                setIsOpen(false);
                                setSearchTerm(`${p.brand} ${p.name}`);
                              }}
                              className="w-full text-left px-5 py-3 hover:bg-blue-50 rounded-2xl transition-colors group flex justify-between items-center"
                            >
                              <div>
                                <p className="font-black text-gray-900 text-sm group-hover:text-blue-600">{p.brand} {p.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">PN: {p.part_number} • Stock: {p.quantity}</p>
                              </div>
                              <span className="font-black text-xs text-gray-400">{Number(p.price).toLocaleString()} TZS</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-400 text-xs italic">No items found matching "{searchTerm}"</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                  <input type="number" min="1" value={formData.quantity_taken} onChange={(e) => setFormData({...formData, quantity_taken: parseInt(e.target.value) || 1})} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Debt</label>
                  <input readOnly value={`${formData.remaining_balance.toLocaleString()} TZS`} className="w-full px-6 py-4 bg-red-50 text-red-600 border-none rounded-2xl font-black outline-none" />
                </div>
              </div>

              <button className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">
                Finalize Registration
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-blue-600 rounded-[2.5rem] p-8 text-white h-fit shadow-xl shadow-blue-100">
           <h3 className="font-black text-xl mb-6">Live Summary</h3>
           {selectedProduct ? (
             <div className="space-y-4">
               <div className="pb-4 border-b border-white/10">
                 <p className="text-[10px] uppercase font-black opacity-60 mb-1">Product</p>
                 <p className="font-bold">{selectedProduct.name}</p>
               </div>
               <div className="flex justify-between">
                 <span className="text-xs opacity-60">Subtotal</span>
                 <span className="font-bold">{formData.remaining_balance.toLocaleString()} TZS</span>
               </div>
             </div>
           ) : <p className="text-blue-200 text-xs italic">Start searching for a product...</p>}
        </div>
      </div>
    </div>
  );
}