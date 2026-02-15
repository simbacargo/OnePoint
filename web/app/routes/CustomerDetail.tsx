import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

// --- CONFIGURATION ---
const API_BASE = "http://127.0.0.1:8080";
const CUSTOMER_DETAIL_URL = (id: string) => `${API_BASE}/api/customers/${id}/`;

export default function CustomerDetail() {
  const { customerId } = useParams(); // Get ID from URL
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    remaining_balance: 0,
  });

  // --- FETCH DATA ---
  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(CUSTOMER_DETAIL_URL(customerId), {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name,
          email: data.email || "",
          phone: data.phone || "",
          remaining_balance: parseFloat(data.remaining_balance) || 0,
        });
      } else {
        throw new Error("Customer not found");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Could not load customer details." });
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    fetchCustomer();
  }, [isAuthenticated, fetchCustomer, navigate]);

  // --- ACTIONS ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(CUSTOMER_DETAIL_URL(customerId!), {
        method: "PATCH", // Use PATCH to only update changed fields
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Customer profile updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save changes." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 animate-in fade-in duration-500">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate("/customers")}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Back to Accounts
        </button>
        
        <div className="flex gap-3">
            <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
                Print Statement
            </button>
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
                Record Payment
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Profile & Editing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 bg-blue-100 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-blue-600">
                {formData.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none">{formData.name}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Customer ID: #{customerId}</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-2xl text-xs font-bold border ${
                  message.type === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Financial Overview */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Debt Summary Card */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 overflow-hidden relative">
            <div className={`absolute top-0 right-0 px-8 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest ${
              formData.remaining_balance > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}>
              {formData.remaining_balance > 0 ? "Outstanding Debt" : "Account Clear"}
            </div>
            
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Balance Owed</h3>
            <div className="flex items-end gap-3">
              <span className={`text-6xl font-black tracking-tighter ${formData.remaining_balance > 0 ? "text-red-600" : "text-gray-900"}`}>
                {formData.remaining_balance.toLocaleString()}
              </span>
              <span className="text-xl font-black text-gray-300 mb-2">TZS</span>
            </div>
          </div>

          {/* Activity/Statement placeholder */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50">
               <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Recent Ledger Activity</h3>
            </div>
            
            <div className="divide-y divide-gray-50">
                {/* Mock Ledger Rows - Replace with real Transaction data later */}
                <div className="px-10 py-6 flex justify-between items-center bg-red-50/20">
                    <div>
                        <p className="font-black text-sm text-gray-900">Credit Purchase</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Feb 15, 2026 • Order #1024</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-red-600">+111,000 TZS</p>
                    </div>
                </div>
                
                <div className="px-10 py-6 flex justify-between items-center bg-green-50/20">
                    <div>
                        <p className="font-black text-sm text-gray-900">Partial Payment</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Jan 28, 2026 • Receipt #RC-99</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-green-600">-50,000 TZS</p>
                    </div>
                </div>

                <div className="px-10 py-20 text-center text-gray-400 italic text-sm">
                    No more history to show.
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}