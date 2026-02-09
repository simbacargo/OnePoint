import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SALES_LIST_API_URL = 'http://127.0.0.1:8080/api/sales/'; // 'http://localhost:8080/api/sales/'; 

const SalesListScreen = () => {
    // Initial state is an empty array
    const [sales, setSales] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 1. 🚀 Calculate Sales Statistics based on Real API Fields
    const salesStats = useMemo(() => {
        const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
        const transactionCount = sales.length;
        const averageSale = transactionCount > 0 ? totalSales / transactionCount : 0;

        return {
            totalSales: totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            transactionCount,
            averageSale: averageSale.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        };
    }, [sales]);

    // 2. 🌐 Real API Fetch Function
    const fetchSales = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        
        try {
            const response = await fetch(SALES_LIST_API_URL);
            const json = await response.json();
            // Your API returns data in a "results" array
            if (json && json) {
                setSales(json);
            } else {
                setSales([]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch sales list. Check network connection.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSales(sales.length === 0); 
        }, [fetchSales])
    );

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchSales(false);
    };


function thousandSeparator(value: string | number) {
  if (!value) return "0";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

    // --- Helper Components ---

    const SalesStatistics = ({ stats }) => (
        <View style={listStyles.statsContainer}>
            <StatBox label="Total Sales" value={`${stats.totalSales}`} color="#007AFF" />
            <StatBox label="Transactions" value={stats.transactionCount} color="#FF9500" />
            <StatBox label="Average" value={`${stats.averageSale}`} color="#34C759" />
        </View>
    );

    const StatBox = ({ label, value, color }) => (
        <View style={listStyles.statBox}>
            <Text style={[listStyles.statValue, { color }]}>{value}</Text>
            <Text style={listStyles.statLabel}>{label}</Text>
        </View>
    );

    const renderSaleItem = ({ item }) => (
        <View style={listStyles.saleItem}>
            <View style={listStyles.headerRow}>
                <Text style={listStyles.saleId}>ID: #{item.id}</Text>
                <Text style={listStyles.saleDate}>
                    {new Date(item.date_sold).toLocaleDateString()} {new Date(item.date_sold).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
            </View>
            
            <Text style={listStyles.productName} numberOfLines={1}>{item.product_name}</Text>
            
            <View style={listStyles.detailRow}>
                {/* Updated to use item.quantity_sold and item.price_per_unit from your API */}
                <Text style={listStyles.detailText}>Qty: {item.quantity_sold}</Text>
                <Text style={listStyles.detailText}>Price: {parseFloat(item.price_per_unit).toFixed(0)}</Text>
            </View>
            
            <View style={listStyles.totalRow}>
                <Text style={listStyles.totalLabel}>TOTAL:</Text>
                <Text style={listStyles.totalValue}>{thousandSeparator(parseFloat(item.total_amount).toFixed(0))}</Text>
            </View>
        </View>
    );

    const handlePress = () => {
        router.push('/Sales/Create');
    };

    return (
        <SafeAreaView style={listStyles.container}>
            <Text style={listStyles.header}>Sales Dashboard</Text>
            
            <SalesStatistics stats={salesStats} />

            <View style={listStyles.listHeader}>
                <Text style={listStyles.listTitle}>Recent Transactions</Text>
            </View>
            
            {isLoading ? (
                <View style={listStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{marginTop: 10}}>Loading Sales...</Text>
                </View>
            ) : (
                <FlatList
                    data={sales}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSaleItem}
                    contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for FAB
                    ListEmptyComponent={
                        <Text style={listStyles.emptyText}>No sales recorded yet.</Text>
                    }
                    refreshControl={
                        <RefreshControl 
                            refreshing={isRefreshing} 
                            onRefresh={onRefresh} 
                            colors={['#007AFF']}
                        />
                    }
                />
            )}

            <TouchableOpacity
                style={listStyles.fab}
                onPress={handlePress}>
                <View style={listStyles.fabIconContainer}>
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const listStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
    statLabel: { fontSize: 11, color: '#6c757d', textTransform: 'uppercase' },
    listHeader: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    saleItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
        marginBottom: 8,
    },
    saleId: { fontSize: 13, fontWeight: 'bold', color: '#007AFF' },
    saleDate: { fontSize: 12, color: '#999' },
    productName: { fontSize: 17, fontWeight: '600', color: '#2c3e50', marginBottom: 4 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailText: { fontSize: 14, color: '#7f8c8d' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    totalValue: { fontSize: 18, fontWeight: '800', color: '#2ecc71' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#95a5a6' },
    fab: {
        position: 'absolute',
        right: 25,
        bottom: 25,
    },
    fabIconContainer: {
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
    }
});

export default SalesListScreen;
