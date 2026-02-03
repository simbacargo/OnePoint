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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const brand = formData.get("brand") as string;
    const price = formData.get("price") as string;
    const partNumber = formData.get("part_number") as string;
    const quantity = formData.get("quantity") as string;
    const vehiclesString = formData.get("vehicles") as string;

    // Formatting data according to your requirement
    const productData = {
      name: name.trim(),
      description: description.trim() || "",
      brand: brand.trim() || "",
      price: parseFloat(price).toFixed(2), // Ensuring string like "3000.00"
      part_number: partNumber.trim() || "",
      quantity: parseInt(quantity, 10) || 0,
      quantity_in_store: 0,
      amount: "0.00",
      sold_units: 0,
      amount_collected: "0.00",
      deleted: false,
      // Parsing "1, 2" -> [1, 2]
      vehicles: vehiclesString
        ? vehiclesString
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id))
        : [],
    };
    try {
      const response = await fetch("https://msaidizi.nsaro.com/api/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        navigate("/products");
      } else {
        const errorData = await response.json();
        console.error("Submission failed:", errorData);
        // alert("Failed to register product. Please check your input.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-800";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Register New Product
        </h1>
        <p className="text-sm text-gray-500">
          Fill in the details below to add a product to the system inventory.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Product Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. TOTAL RUBIA"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Brand / Size</label>
                <input
                  name="brand"
                  type="text"
                  placeholder="e.g. 1L or 4L"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Part Number</label>
                <input
                  name="part_number"
                  type="text"
                  placeholder="e.g. SAE 40"
                  className={inputClass}
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Selling Price (TZS)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Initial Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  placeholder="0"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Vehicle IDs (Comma separated)
                </label>
                <input
                  name="vehicles"
                  type="text"
                  placeholder="1, 2, 3"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description (Optional)</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Add any extra details..."
                className={inputClass}
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                {loading ? "Saving..." : "Register Product"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="text-blue-800 font-bold mb-2">Quick Tips</h3>
            <ul className="text-sm text-blue-700 space-y-3">
              <li>
                • Enter <strong>Vehicle IDs</strong> separated by commas to link
                this product to specific vehicles.
              </li>
              <li>
                • Ensure <strong>Price</strong> is the amount you want to sell
                at.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
