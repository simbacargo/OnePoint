import { useEffect, useState, useMemo } from "react";
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
  // Pulling theme and language to ensure consistency
  const { isAuthenticated, user, theme, language } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [invoices] = useState<Invoice[]>([
    { id: "INV-8821", date: "2026-01-14", plan: "Premium", amount: 17000, method: "M-Pesa Push", status: "Pending", transactionCode: "STK_WAITING" },
    { id: "INV-7742", date: "2025-12-14", plan: "Premium", amount: 17000, method: "M-Pesa Push", status: "Paid", transactionCode: "SFT892L0XJ" },
    { id: "INV-6610", date: "2025-11-14", plan: "Basic", amount: 10000, method: "Manual Transfer", status: "Paid", transactionCode: "SET412M9PA" },
  ]);

  // Dynamic calculations instead of hardcoded strings
  const totalSpent = useMemo(() => 
    invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0), 
  [invoices]);

  const filteredInvoices = useMemo(() => 
    invoices.filter(inv => 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.transactionCode.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
  [invoices, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  // Localization Dictionary (Simple example)
  const t = {
    en: { title: "Billing & Invoices", spent: "Total Spent", active: "Active Plan", history: "Transaction History" },
    sw: { title: "Malipo na Ankara", spent: "Jumla Uliyotumia", active: "Mpango wa Sasa", history: "Historia ya Mihamala" }
  }[language as 'en' | 'sw'] || { title: "Billing & Invoices", spent: "Total Spent", active: "Active Plan", history: "Transaction History" };

  return (
    <div className={`p-6 max-w-5xl mx-auto transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-white' : ''}`}>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">{t.title}</h1>
          <p className="text-gray-500 font-medium text-sm">Manage your subscription history and receipts.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text"
              placeholder="Search INV or Code..."
              className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate("/upgrade-subscription")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            Upgrade Plan
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.spent}</p>
          <p className="text-2xl font-black text-gray-900">{totalSpent.toLocaleString()} <span className="text-sm font-medium">TZS</span></p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.active}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-blue-600">Premium</p>
            <i className="bi bi-patch-check-fill text-blue-600"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Bill Date</p>
          <p className="text-2xl font-black text-gray-900">Feb 14, 2026</p>
          <div className="absolute -right-2 -bottom-2 opacity-5 text-4xl">
            <i className="bi bi-calendar-event"></i>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.history}</h3>
           <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
             {filteredInvoices.length} Items
           </span>
        </div>
        
        {loading ? (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-[2rem]"></div>)}
            </div>
        ) : filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="group bg-white hover:bg-gray-50 border border-gray-100 p-6 rounded-[2.2rem] transition-all flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${
                  invoice.status === 'Paid' ? 'bg-green-50 text-green-600' : 
                  invoice.status === 'Pending' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-red-50 text-red-600'
                }`}>
                  <i className={`bi ${invoice.status === 'Paid' ? 'bi-check2-all' : invoice.status === 'Pending' ? 'bi-hourglass-split' : 'bi-x-circle'}`}></i>
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
                  <p className="text-[10px] font-mono text-gray-400 uppercase select-all" title="Click to copy code">{invoice.transactionCode}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {invoice.status}
                    </span>
                    <button 
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                      title="Download PDF Receipt"
                    >
                        <i className="bi bi-file-earmark-pdf"></i>
                    </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
             <i className="bi bi-search text-4xl text-gray-300"></i>
             <p className="mt-4 text-sm font-bold text-gray-500">No transactions found matching your search.</p>
          </div>
        )}
      </div>

      {/* Footer Support */}
      <footer className="mt-12 text-center p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
        <p className="text-sm text-blue-900 font-bold flex items-center justify-center gap-2">
          <i className="bi bi-question-circle-fill"></i>
          Missing a transaction?
        </p>
        <p className="text-xs text-blue-600 mt-2 max-w-md mx-auto leading-relaxed">
          If you paid to <span className="font-black underline">0754728137</span> and your plan didn't update within 5 minutes, please send your M-Pesa SMS to our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button className="px-6 py-2.5 bg-white text-blue-600 border border-blue-100 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
            <i className="bi bi-whatsapp"></i> WhatsApp Support
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-blue-700 transition-all">
            Email Support
          </button>
        </div>
      </footer>
    </div>
  );
}