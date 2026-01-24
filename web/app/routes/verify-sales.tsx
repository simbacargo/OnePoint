import { useState, useEffect } from "react";
import type { Route } from "./+types/verify-sales";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Verify Sales" },
    { name: "description", content: "Review and confirm sales transactions." },
  ];
}

const SALES_API_URL = "https://msaidizi.nsaro.com/index/sales/list_unverified_sales_api/?format=json";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const cacheBuster = new Date().getTime();
  const res = await fetch(`${SALES_API_URL}&cache_buster=${cacheBuster}`,
    {
      headers: {
        "Cache-Control": "no-cache",
        "authorization": `Token ${localStorage.getItem("access_token") || ""}`,
      },
      method: "GET",
      mode: "cors",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch sales");
  return await res.json();
}

export function shouldRevalidate() {
  return true;
}

export default function VerifySales({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null); // Track which ID is loading
  const [localSales, setLocalSales] = useState(loaderData || []);

  // Keep local state in sync if loaderData changes externally
  useEffect(() => {
    setLocalSales(loaderData || []);
  }, [loaderData]);

  const handleVerify = async (saleId: number) => {
    setIsProcessing(saleId); // Show loading state on the button
    try {
      const res = await fetch(`https://msaidizi.nsaro.com/index/sales/${saleId}/verify_sale/`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Verification failed");

      // SUCCESS: Remove the verified sale from the local UI list immediately
      setLocalSales((prev: any[]) => prev.filter((sale) => sale.id !== saleId));
      
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredSales = localSales.filter((sale: any) =>
    sale.product_name.toLowerCase().includes(filter.toLowerCase()) ||
    sale.id.toString().includes(filter)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review pending sales to confirm inventory deduction.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-amber-50 border border-amber-100 px-6 py-2 rounded-2xl shadow-sm">
            <span className="block text-[10px] text-amber-600 font-black uppercase tracking-widest">To Review</span>
            <span className="text-2xl font-black text-amber-700">{filteredSales.length}</span>
          </div>
          <div className="relative">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search sales..."
              className="pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-100 outline-none w-full md:w-80 bg-white transition-all shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sale Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-amber-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="text-sm text-gray-900 font-bold">
                      {new Date(sale.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black text-xs">
                        #{sale.id}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-800">{sale.product_name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">POS Transaction</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-gray-900">
                      {Number(sale.total_amount).toLocaleString()} <span className="text-[10px] text-gray-400">TZS</span>
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 uppercase tracking-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-3">
                      <button 
                        disabled={isProcessing === sale.id}
                        className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Reject
                      </button>
                      <button 
                        disabled={isProcessing === sale.id}
                        onClick={() => handleVerify(sale.id)}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-2"
                      >
                        {isProcessing === sale.id ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : <i className="bi bi-patch-check"></i>}
                        {isProcessing === sale.id ? 'Processing...' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSales.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-shield-check text-4xl"></i>
            </div>
            <p className="text-gray-900 font-black text-lg">All caught up!</p>
            <p className="text-gray-400 text-sm">No sales are currently awaiting verification.</p>
          </div>
        )}
      </div>
    </div>
  );
}