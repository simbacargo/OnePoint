'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Loader2, CheckCircle, XCircle } from 'lucide-react';

// --- MOCK COMPONENTS (Assume these are imported from your components directory) ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg transition duration-300 ${className}`}>
    {children}
  </div>
);

// --- CONSTANTS ---
const API_URL = process.env.NEXT_PUBLIC_API_ULR || 'http://127.0.0.1:8000';

// --- API SIMULATION (Replace with your actual async function) ---
const SubmitProduct = async (productData) => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (
  !productData.name ||
  !productData.brand ||
  !productData.vehicles ||
  productData.amount <= 0 ||
  productData.sold_units <= 0 ||
  productData.amount_collected <= 0 ||
  productData.price <= 0 ||
  productData.quantity < 0
) {
  throw new Error("Validation failed: Please check all required fields (Name, Brand, Vehicles, Amount, Sold Units, Amount Collected, Price, Quantity).");
}

const req = await fetch(`${API_URL}/products/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData),
});

const responseData = await req.json();
console.log(responseData); // Log the API response to debug

if (!req.ok) {
  throw new Error(responseData.message || "Failed to create product due to server error.");
}

  
  console.log("Simulating API POST to create product:", productData);
  return {
    success: true,
    newId: Math.floor(Math.random() * 1000) + 100,
  };
};

// --- Form Input Component ---
const FormInput = ({ label, id, type = 'text', value, onChange, placeholder, required = false, isTextArea = false }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        rows="3"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? (id === 'quantity' ? 0 : 0.01) : undefined}
        step={type === 'number' && id === 'price' ? '0.01' : undefined}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
      />
    )}
  </div>
);

// --- MAIN COMPONENT: CREATE PRODUCT PAGE ---

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
  name: '',
  part_number: '',
  quantity: 0,
  price: 0.00,
  description: '',
  brand: '', // Add this field
  vehicles: '', // Add this field
  amount: 0, // Add this field
  sold_units: 0, // Add this field
  amount_collected: 0 // Add this field
});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' }); // type: 'success', 'error', ''

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    let processedValue = value;

    if (id === 'quantity') {
      processedValue = Math.max(0, parseInt(value, 10) || 0);
    }
    if (id === 'price') {
      processedValue = parseInt(value) || 0.00;
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: processedValue
    }));
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      part_number: '',
      quantity: 0,
      price: 0.00,
      description: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setLoading(true);

    try {
      const result = await SubmitProduct(formData); // Using simulation for demo

      if (result.success) {
        setStatus({ 
          message: `Product "${formData.name}" created successfully with ID: ${result.newId}!`, 
          type: 'success' 
        });
        resetForm(); // Clear the form on successful submission
      } else {
        setStatus({ message: "Failed to create product. Please try again.", type: 'error' });
      }

    } catch (error) {
      console.error("Submission error:", error);
      setStatus({ 
        message: error.message || "An unexpected error occurred during submission.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Status Message Display
  const StatusMessage = () => {
    if (!status.message) return null;

    const isSuccess = status.type === 'success';
    const bgColor = isSuccess ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
      <div className={`flex items-center p-4 mb-6 rounded-lg border-l-4 font-medium ${bgColor}`} role="alert">
        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
        <p>{status.message}</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Product</h1>
      <p className="text-gray-500 mb-6">Enter the details for the new inventory item below.</p>

      <StatusMessage />

      <Card className="shadow-2xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <FormInput
              label="Product Name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Oil Filter (Premium)"
              required
            />
            <FormInput
              label="Part Number"
              id="part_number"
              value={formData.part_number}
              onChange={handleInputChange}
              placeholder="e.g., K-4902-12345 (Optional)"
            />
          </div>

          {/* Section 2: Inventory & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <FormInput
              label="Starting Quantity (QTY)"
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
            <FormInput
              label="Price (USD)"
              id="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>
          
          {/* Section 3: Description */}
          <div>
            <FormInput
              label="Description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="A brief description of the product, its use, and compatibility."
              isTextArea
            />
          </div>
<FormInput
  label="Brand"
  id="brand"
  value={formData.brand}
  onChange={handleInputChange}
  placeholder="e.g., Bosch"
  required
/>

<FormInput
  label="Vehicles"
  id="vehicles"
  value={formData.vehicles}
  onChange={handleInputChange}
  placeholder="e.g., Honda Accord"
  required
/>

<FormInput
  label="Amount"
  id="amount"
  type="number"
  value={formData.amount}
  onChange={handleInputChange}
  placeholder="e.g., 100"
  required
/>

<FormInput
  label="Sold Units"
  id="sold_units"
  type="number"
  value={formData.sold_units}
  onChange={handleInputChange}
  placeholder="e.g., 10"
  required
/>

<FormInput
  label="Amount Collected"
  id="amount_collected"
  type="number"
  value={formData.amount_collected}
  onChange={handleInputChange}
  placeholder="e.g., 1000.00"
  required
/>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 disabled:opacity-50"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={loading || !formData.name || formData.price <= 0} // Disable if loading or required fields are empty
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
