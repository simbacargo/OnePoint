// app/products/ProductDetailsModal.js

import React, { useEffect, useState } from 'react';
import Modal from '@/components/Modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ProductDetailsModal = ({ productId, show, onClose }) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (show && productId) {
      setIsLoading(true);
      fetch(`${API_URL}/api/products/${productId}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data.product);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch product details:", err);
          setIsLoading(false);
        });
    }
  }, [show, productId]);

  return (
    <Modal show={show} onClose={onClose}>
      {isLoading ? (
        <div className="text-center p-4">Loading product details...</div>
      ) : product ? (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-1">**Part Number:** {product.partNumber}</p>
          <p className="text-gray-600 mb-1">**Quantity:** {product.QTY}</p>
          <p className="text-gray-600 mb-1">**Price:** ${product.AMOUNT.toFixed(2)}</p>
          <p className="mt-4 text-gray-700">**Description:** {product.description || 'No description available.'}</p>
        </div>
      ) : (
        <div className="text-center p-4 text-red-500">Failed to load product details.</div>
      )}
    </Modal>
  );
};

export default ProductDetailsModal;