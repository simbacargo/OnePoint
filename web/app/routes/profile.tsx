import { useEffect, useState } from "react";
import type { Route } from "./+types/settings";
import { useAuth } from "~/Context/AppContext"; 
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Settings & Profile" },
    { name: "description", content: "Update your profile, security, and system preferences." },
  ];
}

export default function Settings() {
  const { isAuthenticated, user, logout, theme, setTheme, language, setLanguage } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user || "",
    email: (user || "user") + "@nsaro.com",
    timezone: "UTC+3 (EAT)",
    currency: "TZS",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/login");
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("All preferences saved successfully! ✨");
    }, 1000);
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-gray-800 text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider";
  const sectionTitleClass = "font-bold text-gray-800 flex items-center gap-2";

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings & Profile</h1>
        <p className="text-sm text-gray-500">Manage your identity, security, and workspace preferences.</p>
      </header>

      <div className="space-y-6">
        
        {/* 1. Subscription Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden border-l-4 border-l-blue-600">
          <div className="p-6 border-b border-gray-100 bg-blue-50/30 flex justify-between items-center">
            <h3 className={sectionTitleClass}>
              <i className="bi bi-credit-card text-blue-600"></i>
              Billing & Subscription
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full tracking-widest">
              Active Plan
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
                  <i className="bi bi-rocket-takeoff"></i>
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900">Starter Plan</h4>
                  <p className="text-xs text-gray-500 font-medium">Next billing date: <span className="text-gray-900 font-bold">Feb 14, 2026</span></p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => navigate("/payment-history")} className="flex-1 px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors">
                  Invoices
                </button>
                <button onClick={() => navigate("/upgrade-subscription")} className="flex-1 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2">
                  <i className="bi bi-stars"></i> Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Profile Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className={sectionTitleClass}>
              <i className="bi bi-person-circle text-blue-600"></i>
              Account Identity
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className="group relative w-24 h-24">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl border-4 border-white shadow-sm overflow-hidden">
                    <i className="bi bi-person"></i>
                  </div>
                  <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity flex items-center justify-center text-xs font-bold">
                    Edit
                  </button>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:underline">Remove Photo</button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={formData.email} className={inputClass} readOnly disabled />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Security Section (New) */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className={sectionTitleClass}>
              <i className="bi bi-shield-lock text-red-600"></i>
              Security & Credentials
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold text-gray-800">Password</p>
              <p className="text-xs text-gray-500 mb-3">Last changed 3 months ago.</p>
              <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">
                Update Password
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500 mb-3">Add an extra layer of security.</p>
              <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* 4. Appearance & Localization */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className={sectionTitleClass}>
              <i className="bi bi-palette text-indigo-600"></i>
              Appearance & Localization
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Display Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                  <option value="en">English (US)</option>
                  <option value="sw">Kiswahili</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Default Currency</label>
                <select className={inputClass} value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                  <option value="TZS">TZS - Shilingi</option>
                  <option value="USD">USD - Dollar</option>
                  <option value="KES">KES - Shilling</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Interface Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                      theme === "light" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <i className="bi bi-sun"></i> Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                      theme === "dark" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <i className="bi bi-moon-stars"></i> Dark
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Timezone</label>
                <select className={inputClass} value={formData.timezone} onChange={(e) => setFormData({...formData, timezone: e.target.value})}>
                  <option>UTC+3 (EAT)</option>
                  <option>UTC+0 (GMT)</option>
                  <option>UTC+1 (CET)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Notification Preferences */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className={sectionTitleClass}>
              <i className="bi bi-sliders text-purple-600"></i>
              Notifications
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { title: "Email Notifications", desc: "Receive daily sales summaries via email.", default: true },
              { title: "Low Stock Alerts", desc: "Get notified when products drop below threshold.", default: true },
              { title: "Marketing Updates", desc: "Tips on using Msaidizi features.", default: false }
            ].map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between ${idx !== 0 ? 'pt-4 border-t border-gray-50' : ''}`}>
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-blue-600" defaultChecked={item.default} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors">
            <i className="bi bi-box-arrow-right text-lg"></i>
            Sign out of account
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-100 transition-colors">
              Reset Changes
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <i className="bi bi-cloud-check"></i>
              )}
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}