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

// Define the shape of your API data
interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  remaining_balance: number;
  sale: number;
}

export default function Customers() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8080/api/customers/");
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - Failed to fetch customers`);
        }

        const data = await response.json();
        // Since your API returns a paginated object, we access .results
        setCustomers(data.results || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [isAuthenticated, navigate]);

  const filteredCustomers = customers.filter(c => 
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
          <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-100" onClick={()=>navigate('/customers/new')}>
            <i className="bi bi-person-plus-fill"> </i> New Customer
          </button>
        </div>
      </div>

      {/* Loading & Error UI States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading customer records...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <i className="bi bi-exclamation-triangle-fill text-xl"></i>
          <div>
            <p className="font-bold">Fetch Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Balance Owed</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const balance = customer.remaining_balance;
                    const isDebtHigh = balance > 50000;
                    const isClear = balance === 0;

                    return (
                      <tr key={customer.id} className="odd:bg-gray-50/30 even:bg-white hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{customer.name}</div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-widest">ID: #{customer.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                             <i className="bi bi-envelope text-[10px] mr-2"></i>{customer.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            <i className="bi bi-telephone text-[10px] mr-2"></i>{customer.phone || 'No phone'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`text-sm font-black ${isClear ? 'text-gray-400' : 'text-red-600'}`}>
                            {Number(balance).toLocaleString()} TZS
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
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic text-sm">
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}