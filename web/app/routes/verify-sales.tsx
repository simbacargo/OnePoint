import { useState } from "react";
import type { Route } from "./+types/verify-sales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Verify Sales" },
    { name: "description", content: "Review and confirm sales transactions." },
  ];
}

const SALES_API_URL = "https://msaidizi.nsaro.com/sales/";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const res = await fetch(SALES_API_URL);
  if (!res.ok) throw new Error("Failed to fetch sales");
  const data = await res.json();
  // Filter for unverified sales if your API doesn't do it for you
  return data; 
}

export default function VerifySales({ loaderData }: Route.ComponentProps) {
  const [filter, setFilter] = useState("");
  const sales = loaderData || [];

  const filteredSales = sales.filter((sale: any) =>
    sale.product_name.toLowerCase().includes(filter.toLowerCase()) ||
    sale.id.toString().includes(filter)
  );

  return (
    <div className="p-6">
      {/* Header with Stats Summary */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review pending sales and confirm inventory deduction.</p>
        </div>

        <div className="flex gap-4">
            <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
                <span className="block text-xs text-amber-600 font-bold uppercase">Pending</span>
                <span className="text-xl font-bold text-amber-700">{filteredSales.length}</span>
            </div>
            <div className="relative">
                <i className="bi bi-filter-left absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                    type="text"
                    placeholder="Filter by ID or Product..."
                    className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none w-full md:w-72 bg-white shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Verification Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sale Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-amber-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {new Date(sale.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-mono text-xs">
                            {sale.id}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800">{sale.product_name}</div>
                            <div className="text-xs text-gray-500 italic">Reference: SALE-00{sale.id}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                        {Number(sale.amount).toLocaleString()} TZS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      UNVERIFIED
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all">
                        <i className="bi bi-x-circle"></i> Reject
                      </button>
                      <button className="flex items-center gap-1 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm hover:shadow-md transition-all">
                        <i className="bi bi-patch-check"></i> Verify Sale
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSales.length === 0 && (
            <div className="py-20 text-center">
                <i className="bi bi-shield-check text-5xl text-gray-200 mb-4 block"></i>
                <p className="text-gray-500 font-medium">All sales have been verified!</p>
            </div>
        )}
      </div>
    </div>
  );
}