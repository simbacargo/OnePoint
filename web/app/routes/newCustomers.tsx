import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

export default function RegisterCustomer() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    remaining_balance: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not logged in
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://127.0.0.1:8080/api/customers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register customer. Check if email exists.");
      }

      setMessage({ type: "success", text: "Customer registered successfully!" });
      
      // Redirect to customers list after 2 seconds
      setTimeout(() => navigate("/customers"), 2000);
      
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "remaining_balance" ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm mb-4"
        >
          <i className="bi bi-arrow-left"></i> Back to List
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Customer Registration</h1>
        <p className="text-sm text-gray-500">Add a new profile to the management system.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Status Messages */}
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 07XXXXXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="customer@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Opening Balance (TZS)</label>
              <input
                type="number"
                name="remaining_balance"
                value={formData.remaining_balance}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full h-4 w-4"></span>
                  Saving...
                </>
              ) : (
                "Register Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}