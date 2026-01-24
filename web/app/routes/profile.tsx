import { useEffect, useState } from "react";
import type { Route } from "./+types/settings";
import { useAuth } from "~/Context/AppContext";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Settings" },
    { name: "description", content: "Update your profile and system preferences." },
  ];
}

export default function Settings() {
  // Destructured 'logout' from useAuth
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/login");
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-gray-800 text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account details and application preferences.</p>
      </header>

      <div className="space-y-6">
        
        {/* Subscription Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden border-l-4 border-l-blue-600">
          <div className="p-6 border-b border-gray-100 bg-blue-50/30">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <i className="bi bi-credit-card text-blue-600"></i>
                Billing & Subscription
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-widest">
                Active Plan
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
                  <i className="bi bi-rocket-takeoff"></i>
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900">Starter Plan</h4>
                  <p className="text-xs text-gray-500 font-medium">Next billing date: <span className="text-gray-900">Feb 14, 2026</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => navigate("/payment-history")}
                  className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                >
                  View Invoices
                </button>
                <button 
                  onClick={() => navigate("/upgrade-subscription")}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <i className="bi bi-stars"></i>
                  Upgrade to Pro
                </button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-2">
                <span>Inventory Limit</span>
                <span>85 / 100 Products used</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[85%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <i className="bi bi-person-circle text-blue-600"></i>
              Profile Information
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl border-4 border-white shadow-sm">
                  <i className="bi bi-person"></i>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:underline">Change Photo</button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="md:col-span-1">
                  <label className={labelClass}>Full Name</label>
                  <input type="text" defaultValue={user || ""} className={inputClass} disabled />
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>Email Address</label>
                  <input type="email" defaultValue={user + "@nsaro.com"} className={inputClass} disabled />
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" defaultValue="unknown" className={inputClass} disabled />
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>Job Role</label>
                  <input type="text" defaultValue="Administrator" className={inputClass} disabled readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <i className="bi bi-shield-lock text-emerald-600"></i>
              Security & Password
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input type="password" placeholder="••••••••" className={inputClass} disabled />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input type="password" placeholder="Min. 8 characters" className={inputClass} disabled />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input type="password" placeholder="Confirm" className={inputClass} disabled />
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <i className="bi bi-sliders text-purple-600"></i>
              System Preferences
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive daily sales summaries via email.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-blue-600" defaultChecked />
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Low Stock Alerts</p>
                <p className="text-xs text-gray-500">Get notified when products drop below threshold.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-blue-600" defaultChecked />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <i className="bi bi-box-arrow-right text-lg"></i>
            Logout Account
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
              Discard
            </button>
            <button 
              onClick={() => {setLoading(true); setTimeout(() => setLoading(false), 1500); alert("Something Went Wrong! 😔")}}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : <i className="bi bi-cloud-check"></i>}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}