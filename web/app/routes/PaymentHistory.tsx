import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

interface Invoice {
  id: string;
  date: string;
  plan: "Basic" | "Premium";
  amount: number;
  method: "M-Pesa Push" | "Manual Transfer";
  status: "Paid" | "Pending" | "Failed";
  transactionCode: string;
}

export default function Invoices() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mock data representing the statement
  const [invoices] = useState<Invoice[]>([
    { id: "INV-8821", date: "2026-01-14", plan: "Premium", amount: 17000, method: "M-Pesa Push", status: "Pending", transactionCode: "STK_WAITING" },
    { id: "INV-7742", date: "2025-12-14", plan: "Premium", amount: 17000, method: "M-Pesa Push", status: "Paid", transactionCode: "SFT892L0XJ" },
    { id: "INV-6610", date: "2025-11-14", plan: "Basic", amount: 10000, method: "Manual Transfer", status: "Paid", transactionCode: "SET412M9PA" },
  ]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-500 font-medium text-sm">Manage your subscription history and receipts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate("/upgrade")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            Upgrade Plan
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-2xl font-black text-gray-900">44,000 <span className="text-sm font-medium">TZS</span></p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Plan</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-blue-600">Premium</p>
            <i className="bi bi-patch-check-fill text-blue-600"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Bill Date</p>
          <p className="text-2xl font-black text-gray-900">Feb 14, 2026</p>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-4">Transaction History</h3>
        
        {loading ? (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-[2rem]"></div>)}
            </div>
        ) : (
          invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="group bg-white hover:bg-gray-50 border border-gray-100 p-6 rounded-[2.2rem] transition-all flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                {/* Icon based on status */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                  invoice.status === 'Paid' ? 'bg-green-50 text-green-600' : 
                  invoice.status === 'Pending' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-red-50 text-red-600'
                }`}>
                  <i className={`bi ${invoice.status === 'Paid' ? 'bi-check2-all' : 'bi-clock-history'}`}></i>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-gray-900">{invoice.plan} Subscription</h4>
                    <span className="text-[10px] font-bold text-gray-300">/ {invoice.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {invoice.method} • {new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8">
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">{invoice.amount.toLocaleString()} TZS</p>
                  <p className="text-[10px] font-mono text-gray-400 uppercase">{invoice.transactionCode}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {invoice.status}
                    </span>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <i className="bi bi-download"></i>
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Support */}
      <footer className="mt-12 text-center p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
        <p className="text-sm text-blue-900 font-medium">Missing a transaction?</p>
        <p className="text-xs text-blue-600 mt-1">If you paid to <span className="font-black">0754728137</span> and don't see it here, send your M-Pesa SMS to our WhatsApp support.</p>
        <button className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
            Contact Support
        </button>
      </footer>
    </div>
  );
}