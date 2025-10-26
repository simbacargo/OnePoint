import React from 'react'

export default function ProductModal({ product, show, onClose }) {
  // If the modal isn't supposed to be shown, return null
  if (!show) {
    return null;
  }

  // Helper function to format keys (e.g., "partNumber" -> "Part Number")
  const formatKey = (key) => {
    return key
      .split(/(?=[A-Z_])/) // Splits by uppercase letters or underscore
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizes each word
      .join(' ')
      .replace(/_/g, ' '); // Replaces underscores with spaces
  };

  return (
    // The modal overlay, which closes the modal when clicked
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" onClick={onClose}>
      
      {/* The modal content box, which prevents the click from propagating to the overlay */}
      <div className="relative p-8 w-96 max-w-lg mx-auto bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        
        {/* Close button */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors">
          &times;
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Product Details</h2>
        
        {/* Displaying product information in a clean list */}
        <ul className="space-y-2">
          {Object.entries(product).map(([key, value]) => (
            <li key={key} className="flex justify-between items-center text-gray-700">
              <span className="font-semibold text-gray-600">{formatKey(key)}:</span>
              <span className="text-right">{value === null ? "N/A" : value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}