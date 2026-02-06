import {
  useNavigate,
  Form,
  useNavigation,
  useLoaderData,
  useActionData,
} from "react-router";
import { useEffect, useState } from "react";

// Helper to build the URL dynamically
const get_server_url = (id: string | undefined) =>
  `https://msaidizi.nsaro.com/api/productdetails/${id}/`;

/**
 * 1. LOADER
 * This runs BEFORE the component renders to fetch the product data.
 */
export async function clientLoader({ params }: any) {
  const response = await fetch(`${get_server_url(params.productId)}?t=${Date.now()}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });
  if (!response.ok) throw new Error("Could not fetch product details");
  return response.json();
}

/**
 * 2. ACTION
 * This runs when you click "Submit". It takes the form data and sends it to your API.
 */
export async function clientAction({ request, params }: any) {
  const formData = await request.formData();
  const productId = params.productId;

  // We build the object to match your Product Structure exactly
  const payload = {
    id: parseInt(productId),
    vehicle_list: [], // Kept empty as per your structure
    name: formData.get("name"),
    description: formData.get("description") || "",
    brand: formData.get("brand"),
    price: formData.get("price"),
    part_number: formData.get("part_number"),
    // Numbers must be parsed from strings to integers
    quantity: parseInt(formData.get("quantity") || "0"),
    quantity_in_store: parseInt(formData.get("quantity_in_store") || "0"),
    buying_price: formData.get("buying_price"),
    sold_units: 0,
    amount_collected: "0.00",
    created_at: new Date().toISOString(),
    deleted: false,
    vehicles: [],
  };

  try {
    const response = await fetch(get_server_url(productId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: "error",
        message: errorData?.detail || "Failed to update product.",
      };
    }

    return { status: "success", message: "Product updated successfully!" };
  } catch (err) {
    return { status: "error", message: "A network error occurred." };
  }
}

/**
 * 3. COMPONENT
 * The visual part of your page.
 */
export default function Product() {
  const product = useLoaderData() as any;
  const actionData = useActionData() as { status: string; message: string } | undefined;
  
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [showToast, setShowToast] = useState(false);

  // Show a notification popup when the action finishes
  useEffect(() => {
    if (actionData) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const inputStyle =
    "w-full border-gray-300 border rounded-lg p-2.5 text-gray-500 focus:text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center relative font-sans">
      
      {/* Toast Notification */}
      {showToast && actionData && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center p-4 w-full max-w-xs text-white rounded-lg shadow-2xl ${
            actionData.status === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          <div className="text-sm font-medium flex-1">{actionData.message}</div>
          <button onClick={() => setShowToast(false)} className="ml-4 text-white">✕</button>
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Edit Product</h1>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
              Product ID: {product.id}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Form - Note: method="post" triggers the clientAction above */}
        <Form method="post" className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Product Name</label>
            <input type="text" name="name" className={inputStyle} defaultValue={product.name} required />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
            <textarea name="description" rows={2} className={inputStyle} defaultValue={product.description} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Brand</label>
            <input type="text" name="brand" className={inputStyle} defaultValue={product.brand} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Part Number</label>
            <input type="text" name="part_number" className={inputStyle} defaultValue={product.part_number} />
          </div>

          {/* STOCK SECTION /}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Total Quantity</label>
            <input type="number" name="quantity" className={inputStyle} defaultValue={product.quantity} />
          </div>
{/*  */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-blue-600 uppercase ml-1">Quantity in Store</label>
            <input 
              type="number" 
              name="quantity_in_store" 
              className={`${inputStyle} border-blue-200`} 
              defaultValue={product.quantity_in_store} 
            />
          </div>

          {/* PRICING SECTION */}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Buying Price</label>
            <input type="text" name="buying_price" className={inputStyle} defaultValue={product.buying_price} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Selling Price</label>
            <input type="text" name="price" className={inputStyle} defaultValue={product.price} />
          </div>

          {/* FORM ACTIONS */}
          <div className="md:col-span-2 mt-6 pt-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg disabled:bg-indigo-300 transition-all"
            >
              {isSubmitting ? "Saving..." : "Update Product"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}