import { useEffect, useState } from "react";
import type { Route } from "./+types/customers";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Registered Customers" },
    { name: "description", content: "Manage customer records and outstanding balances." },
  ];
}

// Mock data with Date of Visit and Owed Amounts
const MOCK_CUSTOMERS = [
  { id: 1, name: "John Doe", phone: "0712345678", last_visit: "2025-12-28", balance_owed: 45000 },
  { id: 2, name: "Sarah Juma", phone: "0755998877", last_visit: "2025-12-30", balance_owed: 0 },
  { id: 3, name: "Bakari Mohamed", phone: "0622112233", last_visit: "2025-11-15", balance_owed: 120500 },
  { id: 4, name: "Anna Mollel", phone: "0784000111", last_visit: "2025-12-20", balance_owed: 0 },
  { id: 5, name: "Kassim Ally", phone: "0711223344", last_visit: "2025-12-05", balance_owed: 5000 },
];

export default function Customers() {
    const {isAuthenticated} = useAuth(); // Replace with real authentication logic
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [filter, setFilter] = useState("");

  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.phone.includes(filter)
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Accounts</h1>
          <p className="text-sm text-gray-500">Managing relationships and credit lines.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80 bg-white shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
            <i className="bi bi-person-plus-fill"></i> New Customer
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Last Visit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Balance Owed</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => {
                const isDebtHigh = customer.balance_owed > 50000;
                const isClear = customer.balance_owed === 0;

                return (
                  <tr key={customer.id} className="odd:bg-gray-50/30 even:bg-white hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500"><i className="bi bi-telephone text-[10px] mr-1"></i>{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 font-medium">
                        {new Date(customer.last_visit).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase">Confirmed visit</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`text-sm font-black ${isClear ? 'text-gray-400' : 'text-red-600'}`}>
                        {customer.balance_owed.toLocaleString()} TZS
                      </div>
                      {!isClear && <div className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Debit Account</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        isClear 
                        ? 'bg-green-100 text-green-700' 
                        : isDebtHigh 
                        ? 'bg-red-100 text-red-700 animate-pulse' 
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isClear ? 'Cleared' : isDebtHigh ? 'Urgent' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Statement">
                          <i className="bi bi-file-earmark-text text-lg"></i>
                        </button>
                        <button className="text-slate-400 hover:text-emerald-600 transition-colors" title="Collect Payment">
                          <i className="bi bi-cash-coin text-lg"></i>
                        </button>
                        <button className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <i className="bi bi-trash3 text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
