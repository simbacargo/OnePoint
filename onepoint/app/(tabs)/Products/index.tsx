import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Updated Types based on your real JSON ---
interface Product {
    id: number;
    name: string;
    description: string;
    brand: string;
    price: string; // API returns this as a string "3000.00"
    part_number: string;
    quantity: number;
    sold_units: number;
}

interface ProductsResponse {
    results: Product[];
}

function thousandSeparator(value: string | number) {
  if (!value) return "0";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function CreateProductButton() {
    return (
        <TouchableOpacity style={styles.fabContainer} onPress={() => router.push('/Products/Register')}>
            <View style={styles.fabButton}>
                <Ionicons name="add" size={30} color="#FFFFFF" />
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <Products />
            <CreateProductButton />
        </SafeAreaView>
    );
}

function Products() {
    const [allProducts, setAllProducts] = useState<Product[] | null>(null);
    const [displayedProducts, setDisplayedProducts] = useState<Product[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // Updated URL to match your provided endpoint
            const request = await fetch("https://msaidizi.nsaro.com/api/products/");
            const response: ProductsResponse = await request.json();
            setAllProducts(response.results);
            setDisplayedProducts(response.results);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setDisplayedProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Use Focus Effect to refresh data when returning to this screen
    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    useEffect(() => {
        if (allProducts) {
            const filteredResults = allProducts.filter(product => {
                const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
                const partMatch = product.part_number?.toLowerCase().includes(searchQuery.toLowerCase());
                const brandMatch = product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
                return nameMatch || partMatch || brandMatch;
            });
            setDisplayedProducts(filteredResults);
        }
    }, [searchQuery, allProducts]);

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity 
            style={styles.productCard} 
            onPress={() => router.push(`/Products/id?id=${item.id}`)} 
        >
            <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.subInfoRow}>
                    {item.part_number ? <Text style={styles.partNumberText}>#{item.part_number}</Text> : null}
                    <Text style={styles.stockText}>Stock: {item.quantity}</Text>
                </View>
            </View>
            
            <View style={styles.priceTag}>
                <Text style={styles.productPriceText}>{thousandSeparator(item.price)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchBarWrapper}>
                <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search name, part # or brand..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#A9A9A9"
                />
            </View>

            {isLoading && !allProducts ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3498DB" />
                    <Text style={styles.loadingText}>Fetching Inventory...</Text>
                </View>
            ) : (
                <FlatList
                    data={displayedProducts}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.flatListContent}
                    ListEmptyComponent={
                        <Text style={styles.noResultsText}>
                            {searchQuery ? "No products match your search." : "No products in inventory."}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA', 
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    searchBarWrapper: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    searchIcon: { marginRight: 10 },
    searchBar: { flex: 1, height: 50, fontSize: 16, color: '#333' },
    flatListContent: { paddingBottom: 100 },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#3498DB',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    productDetails: { flex: 1, marginRight: 10 },
    productName: { fontSize: 17, fontWeight: '600', color: '#2C3E50', marginBottom: 4 },
    subInfoRow: { flexDirection: 'row', alignItems: 'center' },
    partNumberText: { fontSize: 13, color: '#7F8C8D', marginRight: 10 },
    stockText: { fontSize: 13, color: '#3498DB', fontWeight: 'bold' },
    priceTag: {
        backgroundColor: '#E8F6F3',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'flex-end',
    },
    productPriceText: { fontSize: 16, fontWeight: '700', color: '#27AE60' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },
    noResultsText: { textAlign: 'center', marginTop: 40, color: '#95A5A6', fontSize: 16 },
    fabContainer: { position: 'absolute', bottom: 30, right: 20, zIndex: 10 },
    fabButton: {
        backgroundColor: '#3498DB',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    }
});