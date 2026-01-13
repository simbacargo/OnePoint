import { useEffect, useState } from "react";
import type { Route } from "./+types/register-product";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Register Product" },
    { name: "description", content: "Add a new product to your inventory." },
  ];
}

export default function RegisterProduct() {
    const {isAuthenticated} = useAuth(); // Replace with real authentication logic
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [loading, setLoading] = useState(false);

  // Example handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Add your fetch logic here to POST to https://api.juma.com/products/
    setTimeout(() => setLoading(false), 1000); 
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Register New Product</h1>
        <p className="text-sm text-gray-500">Fill in the details below to add a product to the system inventory.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Product Name</label>
                <input type="text" placeholder="e.g. TOTAL RUBIA" className={inputClass} required />
              </div>
              
              <div>
                <label className={labelClass}>Brand / Size</label>
                <input type="text" placeholder="e.g. 1L or 4L" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Part Number</label>
                <input type="text" placeholder="e.g. SAE 40" className={inputClass} />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Pricing & Stock Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Selling Price (TZS)</label>
                <input type="number" placeholder="0.00" className={inputClass} required />
              </div>
              
              <div>
                <label className={labelClass}>Buying Price (TZS)</label>
                <input type="number" placeholder="0.00" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Initial Quantity</label>
                <input type="number" placeholder="0" className={inputClass} required />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description (Optional)</label>
              <textarea rows={3} placeholder="Add any extra details about this product..." className={inputClass}></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button 
                type="button" 
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i>
                    Register Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Side Tip Panel */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
              <i className="bi bi-lightbulb"></i> Quick Tips
            </h3>
            <ul className="text-sm text-blue-700 space-y-3">
              <li>• Use <strong>Part Numbers</strong> to make searching easier in the Sales screen.</li>
              <li>• Ensure <strong>Buying Price</strong> is accurate to help generate profit reports.</li>
              <li>• Double-check quantities to prevent overselling.</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
            <i className="bi bi-box-seam text-4xl text-gray-300 mb-2 block"></i>
            <p className="text-sm text-gray-600">Need to import products in bulk? <br />
              <button className="text-blue-600 font-semibold hover:underline">Upload Excel/CSV</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}