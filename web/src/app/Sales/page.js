'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, TrendingUp, Package, Search, Loader2 } from 'lucide-react';

// --- CONFIGURATION AND DUMMY DATA ---

const TIME_FILTERS = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
];

// Mock Product List with 100+ items
const generateProducts = (count) => {
    const names = [];
    for (let i = 1; i <= count; i++) {
        names.push(`Product Alpha-${i.toString().padStart(3, '0')}`);
    }
    return ['All Products', ...names];
};
const dummyProductList = generateProducts(120);

// Mock Data Structure (using the generated names)
const dummySalesData = [
    { date: '2024-05-01', product: 'Product Alpha-005', sales: 1500, profit: 450, quantity: 15, period: 'day' },
    { date: '2024-05-01', product: 'Product Alpha-010', sales: 800, profit: 200, quantity: 8, period: 'day' },
    { date: '2024-05-02', product: 'Product Alpha-005', sales: 1200, profit: 300, quantity: 12, period: 'day' },
    { date: '2024-05-08', product: 'Product Alpha-005', sales: 3000, profit: 900, quantity: 30, period: 'week' },
    { date: '2024-05-08', product: 'Product Alpha-050', sales: 1500, profit: 400, quantity: 10, period: 'week' },
    { date: 'May 2024', product: 'Product Alpha-005', sales: 15000, profit: 5000, quantity: 150, period: 'month' },
    { date: 'May 2024', product: 'Product Alpha-010', sales: 8000, profit: 2500, quantity: 80, period: 'month' },
    { date: '2024', product: 'Product Alpha-005', sales: 120000, profit: 40000, quantity: 1200, period: 'year' },
];

// --- UTILITY COMPONENTS ---

const KPICard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
);

const FilterButton = ({ label, value, current, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
            current === value ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
    >
        {label}
    </button>
);


// --- MAIN SALES PAGE COMPONENT ---

export default function SalesPage() {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTime, setSelectedTime] = useState('month');
    
    // Autocomplete/Searchable Dropdown States
    const [productSearchTerm, setProductSearchTerm] = useState(''); // Text in the input field
    const [selectedProduct, setSelectedProduct] = useState('All Products'); // The value applied as the filter
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filtered options based on user input
    const filteredOptions = useMemo(() => {
        if (!productSearchTerm) return dummyProductList;

        const lowerCaseSearch = productSearchTerm.toLowerCase();
        return dummyProductList.filter(
            product => product.toLowerCase().includes(lowerCaseSearch)
        ).slice(0, 50); // Limit visible options for performance/UX
    }, [productSearchTerm]);


    // MOCK DATA FETCHING FUNCTION
    const fetchSalesData = useCallback(async (timePeriod, product) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        let filteredData = dummySalesData.filter(d => d.period === timePeriod);
        
        if (product !== 'All Products') {
            filteredData = filteredData.filter(d => d.product === product);
        }

        setSalesData(filteredData);
        setLoading(false);
    }, []);

    useEffect(() => {
        // Fetch when the time period or the selected product changes
        fetchSalesData(selectedTime, selectedProduct);
    }, [fetchSalesData, selectedTime, selectedProduct]);

    // Handler to select a product from the list
    const handleProductSelect = (productName) => {
        setSelectedProduct(productName);
        setProductSearchTerm(productName === 'All Products' ? '' : productName);
        setIsDropdownOpen(false);
    };


    // --- COMPUTED VALUES (KPIs) ---
    const { totalSales, totalProfit, totalUnits } = useMemo(() => {
        const sales = salesData.reduce((sum, item) => sum + item.sales, 0);
        const profit = salesData.reduce((sum, item) => sum + item.profit, 0);
        const units = salesData.reduce((sum, item) => sum + item.quantity, 0);
        return { totalSales: sales, totalProfit: profit, totalUnits: units };
    }, [salesData]);
    
    // --- CHART DATA (Transformation remains the same) ---
    const chartData = useMemo(() => {
        const aggregated = {};
        salesData.forEach(d => {
            if (!aggregated[d.date]) {
                aggregated[d.date] = { date: d.date, totalSales: 0, totalProfit: 0 };
            }
            aggregated[d.date].totalSales += d.sales;
            aggregated[d.date].totalProfit += d.profit;
        });
        return Object.values(aggregated);
    }, [salesData]);

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Sales Performance Overview 📊</h1>

            {/* --- 1. Filter Panel --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    
                    {/* Time Filters */}
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Aggregate By:</p>
                        <div className="flex space-x-2">
                            {TIME_FILTERS.map(filter => (
                                <FilterButton
                                    key={filter.value}
                                    label={filter.label}
                                    value={filter.value}
                                    current={selectedTime}
                                    onClick={setSelectedTime}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Searchable Product Dropdown (NEW/IMPROVED FILTER) */}
                    <div className="w-full md:w-1/3 relative z-10">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Filter Product:</p>
                        
                        {/* Input Field (Combobox) */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search or select a product..."
                                value={productSearchTerm}
                                onChange={(e) => {
                                    setProductSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} // Delay closing to allow click
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        {/* Dropdown Options */}
                        {isDropdownOpen && (
                            <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <ul className="py-1">
                                    {filteredOptions.length > 0 ? (
                                        filteredOptions.map((product) => (
                                            <li
                                                key={product}
                                                onClick={() => handleProductSelect(product)}
                                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 ${
                                                    selectedProduct === product ? 'bg-blue-50 font-semibold' : ''
                                                }`}
                                            >
                                                {product}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-sm text-gray-500 italic">No products match "{productSearchTerm}"</li>
                                    )}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            **Selected:** <span className="font-medium text-blue-600">{selectedProduct}</span>
                        </p>
                    </div>

                </div>
            </div>

            {/* --- 2. KPI Cards (Remain the same) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <KPICard 
                    title="Total Sales" 
                    value={`$${totalSales.toLocaleString()}`} 
                    icon={DollarSign} 
                    color="text-green-600" 
                />
                <KPICard 
                    title="Total Profit" 
                    value={`$${totalProfit.toLocaleString()}`} 
                    icon={TrendingUp} 
                    color="text-indigo-600" 
                />
                <KPICard 
                    title="Total Units Sold" 
                    value={totalUnits.toLocaleString()} 
                    icon={Package} 
                    color="text-blue-600" 
                />
            </div>

            {/* --- 3. Sales Chart (Remain the same) --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Sales & Profit Over Time ({selectedTime} View)</h3>
                
                {loading ? (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Sales Data...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="sales" orientation="left" stroke="#10b981" tickFormatter={(value) => `$${value/1000}K`} />
                            <YAxis yAxisId="profit" orientation="right" stroke="#3b82f6" tickFormatter={(value) => `$${value/1000}K`} />
                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Line yAxisId="sales" type="monotone" dataKey="totalSales" stroke="#10b981" name="Total Sales" dot={false} strokeWidth={2} />
                            <Line yAxisId="profit" type="monotone" dataKey="totalProfit" stroke="#3b82f6" name="Total Profit" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* --- 4. Detailed Sales Breakdown Table (Remain the same) --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Detailed Breakdown (Filtered by {selectedProduct})</h3>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{selectedTime}</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Units Sold</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {salesData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.product}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">${item.sales.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-indigo-600">${item.profit.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {salesData.length === 0 && !loading && (
                    <div className="p-10 text-center text-gray-500">
                        No sales data found for the current combination of time period and product filter.
                    </div>
                )}
            </div>
        </div>
    );
}