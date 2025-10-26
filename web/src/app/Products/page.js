"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
    Search, Plus, Loader2, ChevronUp, ChevronDown, Trash2, Edit, DollarSign, Save, ShoppingCart, TrendingDown 
} from 'lucide-react';

// --- DJANGO API CONFIGURATION ---
// IMPORTANT: Update this URL to match where your Django application is running.
const DJANGO_API_BASE_URL = 'http://localhost:8000/api/products/'; 

// --- REACT UTILITIES & COMPONENTS ---

// Mock Card Component for consistent styling
const Card = ({ children, className }) => (
    <div className={`p-4 bg-white rounded-xl ${className}`}>
        {children}
    </div>
);

const PAGE_SIZE = 1000;

// Helper to convert price string to float for calculations
const parsePrice = (priceStr) => parseFloat(String(priceStr).replace(/[^0-9.-]+/g,"")) || 0;

// --- API FUNCTIONS (REAL DJANGO FETCH CALLS) ---

/**
 * Fetches all products from the Django ProductViewSet list endpoint.
 */
const fetchProductsApi = async () => {
    try {
        console.log(`[API CALL] Attempting to fetch products from: ${DJANGO_API_BASE_URL}`); // Enhanced logging
        const response = await fetch(DJANGO_API_BASE_URL);

        if (!response.ok) {
            // Log full error details for debugging
            const errorText = await response.text(); 
            console.error(`[API ERROR] Fetch failed with status: ${response.status}`, { details: errorText.substring(0, 200) });
            throw new Error(`HTTP error! status: ${response.status}. Check Network/Console for CORS or server errors.`);
        }
        
        const data = await response.json();
        
        console.log("[API SUCCESS] Successfully fetched product data:", data); // Enhanced logging

        // Ensure quantity fields are parsed as numbers if they are strings in Django
        return data.results.map(p => ({
            ...p,
            quantity: Number(p.quantity) || 0,
            sold_units: Number(p.sold_units) || 0,
            amount_collected: Number(p.amount_collected) || 0,
        }));
    } catch (error) {
        console.error("[FETCH ERROR] Could not connect to Django API. Check if server is running and CORS is configured.", error);
        return [];
    }
};

/**
 * Adds a new product via the ProductViewSet create endpoint (POST).
 */
const addProductApi = async (newProduct) => {
    try {
        const response = await fetch(DJANGO_API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}. Details: ${await response.text()}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding product via API:", error);
        throw error;
    }
};

/**
 * Updates a product via the ProductViewSet partial_update endpoint (PATCH).
 */
const updateProductApi = async (productId, updatedData) => {
    const url = `${DJANGO_API_BASE_URL}${productId}/`;
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. Details: ${await response.text()}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error updating product ${productId} via API:`, error);
        throw error;
    }
};

/**
 * Deletes a product via the ProductViewSet destroy endpoint (DELETE).
 */
const deleteProductApi = async (productId) => {
    const url = `${DJANGO_API_BASE_URL}${productId}/`;
    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });
        if (response.status !== 204) { // 204 No Content is standard for successful DELETE
             throw new Error(`HTTP error! status: ${response.status}. Details: ${await response.text()}`);
        }
        return true;
    } catch (error) {
        console.error(`Error deleting product ${productId} via API:`, error);
        throw error;
    }
};


// --- CORE APPLICATION COMPONENT ---

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [totalNumberOfProducts, setTotalNumberOfProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState({ key: 'id', direction: 'asc' });
    
    // Routing state: 'list', 'edit', 'sell'
    const [currentView, setCurrentView] = useState('list'); 
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Function to reload data from API
    const loadProducts = useCallback(async () => {
        setLoading(true);
        // Note: The caching in your Django ViewSet means the response might be fast if the cache is hit.
        const data = await fetchProductsApi(); 
        setProducts(data);
        setTotalNumberOfProducts(data.length);
        setLoading(false);
    }, []);

    // 1. INITIAL DATA FETCHING
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);


    // 2. DATA PROCESSING (Filtering, Sorting, Pagination)
    const displayedProducts = useMemo(() => {
        let list = products.filter(p => 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.part_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        list.sort((a, b) => {
            const aValue = a[sort.key];
            const bValue = b[sort.key];
            
            if (aValue === undefined || bValue === undefined) return 0; 

            // Handle numeric sort for quantity, sold_units, and price
            const numA = parsePrice(aValue);
            const numB = parsePrice(bValue);

            let comparison = 0;
            if (!isNaN(numA) && !isNaN(numB) && (sort.key === 'quantity' || sort.key === 'price' || sort.key === 'sold_units')) {
                comparison = numA - numB;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else {
                if (aValue < bValue) comparison = -1;
                if (aValue > bValue) comparison = 1;
            }
            
            return sort.direction === 'asc' ? comparison : -comparison;
        });

        const start = (currentPage - 1) * PAGE_SIZE;
        // Update total count based on filtered list length for correct pagination display
        setTotalNumberOfProducts(list.length); 
        return list.slice(start, start + PAGE_SIZE);

    }, [products, searchQuery, sort, currentPage]);

    const totalPages = Math.ceil(totalNumberOfProducts / PAGE_SIZE);

    // --- HANDLERS ---
    const handleSort = (key, direction) => {
        setSort({ key, direction });
        setCurrentPage(1); 
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    const handleNavigate = useCallback((view, product = null) => {
        setSelectedProduct(product);
        setCurrentView(view);
    }, []);

    const handleAddProduct = async () => {
        const newProductData = {
            name: "New Unnamed Product",
            description: "Default description",
            brand: "Unbranded",
            part_number: `PN-${Date.now() % 10000}`,
            vehicles: 'N/A',
            quantity: '10', // Send as string to Django
            price: '0.00', // Send as string to Django
            amount: '0.00',
            sold_units: '0',
            amount_collected: '0.00',
        };

        try {
            await addProductApi(newProductData);
            await loadProducts(); // Reload data after successful creation
            console.log("Added new product successfully via API.");
        } catch (error) {
            console.error("Error adding product:", error);
            // Handle error message display here
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete ${productName} (ID: ${productId})? This action is permanent.`)) {
            return;
        }
        try {
            await deleteProductApi(productId);
            await loadProducts(); // Reload data after successful deletion
            console.log("Product deleted successfully via API.");
        } catch (error) {
            console.error("Error deleting product:", error);
            // Handle error message display here
        }
    };


    // --- VIEW 2: UPDATE PRODUCT FORM ---
    const UpdateProductView = ({ product, onSave, onCancel }) => {
        // Use the API response values directly, but ensure numbers are converted to string for form submission
        const [formData, setFormData] = useState({
            name: product.name || '',
            description: product.description || '',
            brand: product.brand || '',
            part_number: product.part_number || '',
            vehicles: product.vehicles || '',
            quantity: String(product.quantity || 0), // Use string for form input
            price: String(product.price || '0.00'), // Use string for form input
        });
        const [isSaving, setIsSaving] = useState(false);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!product.id) return;
            setIsSaving(true);
            
            try {
                // Send current form data directly, Django will handle string to number conversions
                await updateProductApi(product.id, formData);
                await loadProducts(); // Reload data after successful update
                onSave(); // Navigate back to list
            } catch (error) {
                console.error("Error updating product:", error);
                // Custom error display here
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <Card className="shadow-2xl max-w-2xl mx-auto p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Edit className="w-6 h-6 mr-2 text-blue-600" /> Update Product: {product.name}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Part Number</label>
                            <input type="text" name="part_number" value={formData.part_number} onChange={handleChange} required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Compatible Vehicles</label>
                            <input type="text" name="vehicles" value={formData.vehicles} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Ford F-150, Sedan"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity In Stock</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="0" required
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unit Price (USD)</label>
                            <div className="relative mt-1 rounded-lg shadow-sm">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <input type="text" name="price" value={formData.price} onChange={handleChange} required
                                    className="block w-full border border-gray-300 rounded-lg p-3 pl-8 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </Card>
        );
    };

    // --- VIEW 3: SELL PRODUCT FORM ---
    const SellProductView = ({ product, onSaleComplete, onCancel }) => {
        const [quantitySold, setQuantitySold] = useState(1);
        const [isSelling, setIsSelling] = useState(false);
        
        // Ensure initial quantity is a number
        const currentQuantity = Number(product.quantity);
        const unitPrice = parsePrice(product.price);

        const handleSellSubmit = async (e) => {
            e.preventDefault();
            if (!product.id) return;
            const unitsToSell = Number(quantitySold);

            if (unitsToSell <= 0 || unitsToSell > currentQuantity) {
                 console.warn(`Invalid quantity. Available stock: ${currentQuantity}`);
                return;
            }
            setIsSelling(true);

            try {
                // 1. Calculate new values based on current state (product prop)
                const newQuantity = currentQuantity - unitsToSell;
                const revenueFromSale = unitsToSell * unitPrice;
                
                const oldSoldUnits = Number(product.sold_units || 0);
                const oldAmountCollected = Number(product.amount_collected || 0);

                const newSoldUnits = oldSoldUnits + unitsToSell;
                const newAmountCollected = oldAmountCollected + revenueFromSale;

                // 2. Prepare data for PATCH request
                const updatedData = {
                    quantity: String(newQuantity), // Convert back to string for Django model
                    sold_units: String(newSoldUnits),
                    amount_collected: String(newAmountCollected.toFixed(2)),
                    // Recalculate status based on new quantity (Frontend logic for display)
                    status: newQuantity === 0 ? 'Out of Stock' : (newQuantity < 50 ? 'Low Stock' : 'In Stock'), 
                };
                
                // 3. Send update request
                await updateProductApi(product.id, updatedData);
                await loadProducts(); // Reload data to reflect change
                
                onSaleComplete(); // Navigate back to list
            } catch (error) {
                console.error("Error recording sale:", error);
                // Custom error display here
            } finally {
                setIsSelling(false);
            }
        };

        return (
            <Card className="shadow-2xl max-w-xl mx-auto p-8 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <TrendingDown className="w-6 h-6 mr-2 text-red-600" /> Record Sale
                </h2>
                <div className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">
                    {product.name} ({product.part_number})
                </div>
                
                <form onSubmit={handleSellSubmit} className="space-y-4">
                    <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">Available Stock:</span>
                        <span className="text-xl font-bold text-blue-800">{currentQuantity}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity to Sell</label>
                        <input type="number" value={quantitySold} onChange={(e) => setQuantitySold(Number(e.target.value))} 
                            min="1" max={currentQuantity} required
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-2xl text-center focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    
                    <div className="text-center text-sm text-gray-600">
                        Total Sale Value: <span className="font-bold text-green-600">${(unitPrice * quantitySold).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSelling || currentQuantity === 0 || Number(quantitySold) > currentQuantity || Number(quantitySold) <= 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50"
                        >
                            {isSelling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
                            Process Sale
                        </button>
                    </div>
                </form>
            </Card>
        );
    };

    // --- VIEW 1: PRODUCT LIST TABLE ---
    const ProductList = () => {
        const columns = [
            { key: 'name', label: 'Product Name' },
            { key: 'brand', label: 'Brand', sortable: true },
            { key: 'quantity', label: 'QTY Stock', sortable: true }, 
            { key: 'sold_units', label: 'QTY Sold', sortable: true },
            { key: 'price', label: 'Unit Price', sortable: true }, 
            { key: 'status', label: 'Status', sortable: true },
            { key: 'actions', label: 'Actions', sortable: false },
        ];
        
        const TableRowSkeleton = ({ columns }) => (
            <tr className="animate-pulse">
                {[...Array(columns)].map((_, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                ))}
            </tr>
        );

        const SortableHeader = ({ children, sortKey, currentSort, onSort }) => {
            const isCurrent = currentSort.key === sortKey;
            const direction = currentSort.direction;

            const handleClick = () => {
                const newDirection = isCurrent && direction === 'asc' ? 'desc' : 'asc';
                onSort(sortKey, newDirection);
            };

            const SortIcon = () => {
                if (!isCurrent) {
                    return <ChevronUp className="w-3 h-3 ml-2 text-gray-400 opacity-50 transition-opacity" />;
                }
                return direction === 'asc' 
                    ? <ChevronUp className="w-4 h-4 ml-1 text-blue-600 transition-transform" />
                    : <ChevronDown className="w-4 h-4 ml-1 text-blue-600 transition-transform" />;
            };

            return (
                <th 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition duration-150"
                    onClick={handleClick}
                >
                    <div className="flex items-center">
                        {children}
                        {sortKey && <SortIcon />}
                    </div>
                </th>
            );
        };

        const ActionButtons = ({ product }) => (
            <div className="flex space-x-2 justify-end">
                <button 
                    title="Record Sale"
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                    onClick={(e) => { e.stopPropagation(); handleNavigate('sell', product); }}
                >
                    <DollarSign className="w-4 h-4" />
                </button>
                <button 
                    title="Edit Product"
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                    onClick={(e) => { e.stopPropagation(); handleNavigate('edit', product); }}
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button 
                    title="Delete Product"
                    className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition"
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteProduct(product.id, product.name);
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        );
        
        const firstItem = (currentPage - 1) * PAGE_SIZE + 1;

        return (
            <>
                {/* Header and Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    
                    {/* Search Input */}
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Search by name, part number, or brand..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handleAddProduct}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Product
                    </button>
                </div>

                <Card className="shadow-2xl rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map(col => (
                                        <SortableHeader 
                                            key={col.key} 
                                            sortKey={col.key} 
                                            currentSort={sort} 
                                            onSort={col.sortable !== false ? handleSort : () => {}}
                                        >
                                            {col.label}
                                        </SortableHeader>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    [...Array(PAGE_SIZE)].map((_, i) => <TableRowSkeleton key={i} columns={columns.length} />)
                                ) : displayedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500 text-lg">
                                            No products found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedProducts.map((product) => (
                                        <tr key={product.id} 
                                            className={`group transition duration-200 
                                                ${product.quantity < 5 ? 'bg-red-50/50' : product.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                                hover:bg-blue-50/70
                                            `}
                                            >
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="text-base font-semibold text-gray-900 group-hover:text-blue-600">{product.name}</div>
                                                <div className="text-xs text-gray-500 truncate w-48">PN: {product.part_number} | Vehicles: {product.vehicles}</div>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand}</td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold 
                                                    ${product.quantity < 50 && product.quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                    product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                `}>
                                                    {product.quantity}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {product.sold_units || 0}
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900"> ${product.price}</td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full 
                                                    ${product.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                                                    product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <ActionButtons product={product} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            
                {/* Pagination and Summary */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{Math.min(firstItem, totalNumberOfProducts)}</span> to <span className="font-semibold">{Math.min(firstItem + PAGE_SIZE - 1, totalNumberOfProducts)}</span> of <span className="font-semibold">{totalNumberOfProducts}</span> results.
                    </p>

                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                        >
                            Previous
                        </button>
                        
                        <div className="px-4 py-2 border border-blue-500 rounded-lg text-sm font-bold text-blue-600">
                            {currentPage} / {totalPages}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                            disabled={currentPage >= totalPages || totalPages === 0}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </>
        );
    };


    // --- MAIN RENDER LOGIC ---
    let content;
    let title;

    if (loading) {
        content = <div className="text-center p-12 text-gray-500 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-medium">Connecting to Django API at: {DJANGO_API_BASE_URL}</p>
        </div>;
        title = "Loading...";
    } else {
        switch (currentView) {
            case 'edit':
                title = `Editing: ${selectedProduct?.name || 'Product'}`;
                content = (
                    <UpdateProductView 
                        product={selectedProduct} 
                        onSave={() => handleNavigate('list')}
                        onCancel={() => handleNavigate('list')} 
                    />
                );
                break;
            case 'sell':
                title = `Record Sale: ${selectedProduct?.name || 'Product'}`;
                content = (
                    <SellProductView 
                        product={selectedProduct} 
                        onSaleComplete={() => handleNavigate('list')}
                        onCancel={() => handleNavigate('list')} 
                    />
                );
                break;
            case 'list':
            default:
                title = "Product Inventory List";
                content = <ProductList />;
                break;
        }
    }


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                {currentView === 'list' ? (
                    'Inventory Dashboard (Django Powered)'
                ) : (
                    <>
                        <button onClick={() => handleNavigate('list')} className="text-blue-500 hover:text-blue-700 mr-3 text-xl font-medium">&larr; Back to List</button> 
                        | {title}
                    </>
                )}
            </h1>
            <div className="mt-8">
                {content}
            </div>
            
            <div className="mt-10 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                Connected to Django backend at: <span className="font-mono text-gray-600">{DJANGO_API_BASE_URL}</span>
            </div>
        </div>
    );
}
