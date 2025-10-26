'use client';

import React, { Suspense, useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, AreaChart, Area, PieChart, Pie, Cell,
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Users, DollarSign, TrendingUp, Package, Search, Plus, Loader2, ArrowUpDown } from 'lucide-react';

// --- CONSTANTS ---
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const PAGE_SIZE = 8; // Smaller page size for the dashboard view
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Mock Product Data Fetching (as before)
const dummyFetchProducts = async (page = 1, searchQuery = '', sort = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const allProducts = Array.from({ length: 53 }, (_, i) => ({
        id: i + 1,
        name: `Product Alpha ${i + 1}`,
        partNumber: `PN-XYZ-${1000 + i}`,
        QTY: Math.floor(Math.random() * 500),
        AMOUNT: Math.random() * 100 + 10,
        description: `A detailed description for product ${i + 1}. This product is great for its robustness.`,
        status: i % 5 === 0 ? 'Out of Stock' : 'In Stock',
    })).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.partNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    let sortedProducts = [...allProducts];
    if (sort.key) {
        sortedProducts.sort((a, b) => {
            const valA = a[sort.key];
            const valB = b[sort.key];
            if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const paginatedProducts = sortedProducts.slice(start, end);

    return {
        products: paginatedProducts,
        total: totalProducts,
        totalPages: totalPages,
    };
};

// Placeholder components (assuming ActionButtons and Card are external)
const Card = ({ children, className }) => <div className={className}>{children}</div>;
// const ActionButtons = ({ product }) => <div><button>Edit</button></div>; // Uncomment this and replace if you have the actual component
// const ActionButtons = React.lazy(() => import('./ActionButtons')); 
const ActionButtons = () => <button>Action</button>; 

// --- UTILITY COMPONENTS ---

const ChartWrapper = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        {children}
    </div>
);

const KPICard = ({ title, value, icon: Icon, change, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <Icon className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
        <p className={`text-sm mt-1 ${color} font-medium`}>{change}</p>
    </div>
);

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

    return (
        <th
            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition duration-150"
            onClick={handleClick}
        >
            <div className="flex items-center">
                {children}
                <ArrowUpDown className={`w-3 h-3 ml-2 transition ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
        </th>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
    // --- Chart Data ---
    const [lineChartData] = useState([
        { name: 'Jan', sales: 30, revenue: 50 },
        { name: 'Feb', sales: 40, revenue: 65 },
        { name: 'Mar', sales: 35, revenue: 55 },
        { name: 'Apr', sales: 50, revenue: 75 },
        { name: 'May', sales: 60, revenue: 90 },
        { name: 'Jun', sales: 75, revenue: 110 },
    ]);
    const [barChartData] = useState([
        { name: 'Q1', 'North America': 4000, Europe: 2400, Asia: 1800 },
        { name: 'Q2', 'North America': 3000, Europe: 1398, Asia: 2200 },
        { name: 'Q3', 'North America': 2000, Europe: 9800, Asia: 2900 },
        { name: 'Q4', 'North America': 2780, Europe: 3908, Asia: 2000 },
    ]);
    const [pieChartData] = useState([
        { name: 'Electronics', value: 400 },
        { name: 'Apparel', value: 300 },
        { name: 'Home Goods', value: 300 },
        { name: 'Services', value: 200 },
    ]);
    const [scatterData] = useState([
        { x: 33, y: 550, z: 2000 },
        { x: 25, y: 120, z: 500 },
        { x: 40, y: 900, z: 3500 },
        { x: 55, y: 650, z: 1500 },
        { x: 28, y: 300, z: 800 },
        { x: 48, y: 800, z: 2500 },
        { x: 60, y: 150, z: 600 },
        { x: 22, y: 450, z: 1000 },
    ]);
    const kpiData = [
        { title: 'Total Revenue', value: '$45,231', icon: DollarSign, change: '+12.9%', color: 'text-green-500' },
        { title: 'New Customers', value: '1,250', icon: Users, change: '-4.5%', color: 'text-red-500' },
        { title: 'Product Sales', value: '7,890', icon: Package, change: '+20.1%', color: 'text-green-500' },
        { title: 'Avg. Order Value', value: '$120.50', icon: TrendingUp, change: '+5.1%', color: 'text-green-500' },
    ];

    // --- Product Table Data/State ---
    const [productsData, setProductsData] = useState({ products: [], total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sort, setSort] = useState({ key: 'id', direction: 'asc' });

    const tableColumns = [
        { key: 'id', label: '#', sortable: true },
        { key: 'name', label: 'Product Name', sortable: true },
        { key: 'partNumber', label: 'Part Number', sortable: true },
        { key: 'QTY', label: 'QTY', sortable: true },
        { key: 'AMOUNT', label: 'Price', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false },
    ];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // Replace with your actual API call
            const data = await dummyFetchProducts(currentPage, searchQuery, sort);
            setProductsData(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setProductsData({ products: [], total: 0, totalPages: 0 });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, sort]);

    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSort = (key, direction) => {
        setSort({ key, direction });
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleView = (product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const { products, total, totalPages } = productsData;
    const firstItem = (currentPage - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(currentPage * PAGE_SIZE, total);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Comprehensive Analytics Dashboard 🚀</h1>

            {/* --- 1. KPI Cards Section --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            {/* --- 2. Chart Grid (3 Charts per Row) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <ChartWrapper title="Cumulative Monthly Revenue">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={lineChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 'auto']} tickFormatter={(value) => `$${value}K`} />
                            <Tooltip formatter={(value) => `$${value}K`} />
                            <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fillOpacity={1} fill="#f59e0b" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <ChartWrapper title="Regional Sales Performance (Quarterly)">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="4 4" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value / 1000}K`} />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="North America" stackId="a" fill="#ef4444" />
                            <Bar dataKey="Europe" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="Asia" stackId="a" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWrapper>

                <ChartWrapper title="Sales Distribution by Category">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                labelLine={false}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} units`} />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWrapper>
            </div>

            {/* --- 3. Detailed Data Section: Product Table --- */}
            <h2 className="text-3xl font-bold text-gray-900 mt-10 mb-6">Product Inventory Details</h2>
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <a href="/Products/Import" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Add/Import Products
                </a>
            </div>

            <Card className="shadow-2xl rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {tableColumns.map(col => (
                                    col.sortable ? (
                                        <SortableHeader
                                            key={col.key}
                                            sortKey={col.key}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        >
                                            {col.label}
                                        </SortableHeader>
                                    ) : (
                                        <th key={col.key} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            {col.label}
                                        </th>
                                    )
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                [...Array(PAGE_SIZE)].map((_, i) => <TableRowSkeleton key={i} columns={tableColumns.length} />)
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={tableColumns.length} className="px-6 py-10 text-center text-gray-500 text-lg">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}
                                        className="group hover:bg-blue-50/50 transition duration-200 cursor-pointer"
                                        onClick={() => handleView(product)}>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-blue-600">{product.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.partNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${product.QTY < 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {product.QTY}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${product.AMOUNT.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${product.status === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Suspense fallback={<div>...</div>}>
                                                    <ActionButtons product={product} />
                                                </Suspense>
                                            </div>
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
                    Showing <span className="font-semibold">{firstItem}</span> to <span className="font-semibold">{lastItem}</span> of <span className="font-semibold">{total}</span> results.
                </p>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="px-4 py-2 border border-blue-500 rounded-lg text-sm font-bold text-blue-600">
                        {currentPage} / {totalPages}
                    </div>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Product Details: {selectedProduct.name}</h2>
                        <div className="space-y-3">
                            <p><strong>ID:</strong> <span className="text-gray-600">{selectedProduct.id}</span></p>
                            <p><strong>Part Number:</strong> <span className="text-gray-600">{selectedProduct.partNumber}</span></p>
                            <p><strong>Quantity:</strong> <span className="text-gray-600">{selectedProduct.QTY} units</span></p>
                            <p><strong>Price:</strong> <span className="text-lg font-semibold text-green-600">${selectedProduct.AMOUNT.toFixed(2)}</span></p>
                            <p><strong>Status:</strong> <span className={`font-semibold ${selectedProduct.status === 'In Stock' ? 'text-blue-600' : 'text-red-600'}`}>{selectedProduct.status}</span></p>
                            <p><strong>Description:</strong> <span className="text-gray-600 italic">{selectedProduct.description}</span></p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={closeModal} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition duration-150">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}