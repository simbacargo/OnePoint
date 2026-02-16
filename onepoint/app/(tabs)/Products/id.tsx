import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert // Added Alert for error display
    , // Added ActivityIndicator for loading state
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductDetailScreen = () => {
    // You might use the id from useLocalSearchParams() to construct the URL dynamically
    const { id } = useLocalSearchParams();
    const url = `http://127.0.0.1:8080/api/productdetails/${id}/`;
    
    // 1. Add state for the product data, loading, and error
    const [product, setProduct] = useState(null); // Initialize as null to handle loading
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect hook to fetch data
    useEffect(() => {
        const fetchProductDetails = async () => {
  const token = await AsyncStorage.getItem("@authToken")
            try {
                const response = await fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
   "Authorization": `Bearer ${token}`,
  },
});
                if (!response.ok) {
                    // Throw an error if the response status is not 2xx
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Ensure data structure matches expected properties before setting state
                // This adds a simple check for missing vehicle data from the API
                setProduct({
                    ...data,
                    vehicles: data.vehicles || [] // Default to an empty array if 'vehicles' is missing
                });
            } catch (err) {
                console.error("Failed to fetch product details:", err);
                setError(err.message || "An unknown error occurred");
                Alert.alert("Error", `Could not load product details. ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetails();
    }, [url]); // Depend on 'url' (though it's constant here)

    const InfoRow = ({ label, value, icon, color = "#555" }) => (
        <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
                <Ionicons name={icon} size={20} color={color} style={styles.icon} />
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={[styles.value, { color: color === "#555" ? "#000" : color }]}>{value}</Text>
        </View>
    );

    // 3. Handle loading and error states in the return
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading product details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>
                        {error ? `Error: ${error}` : "Product data is missing."}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                        <Text style={styles.retryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                    {/* Add a retry mechanism if appropriate */}
                </View>
            </SafeAreaView>
        );
    }
    
    // Once product is successfully loaded, the rest of the component renders.

    // 4. Helper function to safely format data
    const safeParseFloat = (value) => parseFloat(value || '0').toFixed(2);
    const safeDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    
    // Destructure for cleaner access
    const { 
        name, brand, price, quantity, sold_units, quantity_in_store, 
        part_number, created_at, amount_collected, vehicles, description,vehicle_list
    } = product;


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.navigate("/Products")} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Details</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Main Product Card */}
                <View style={styles.card}>
                    <Text style={styles.productName}>{name || 'Unknown Product'}</Text>
                    <Text style={styles.brandText}>{brand || 'Generic Brand'}</Text>
                    
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>
                            {parseFloat(price || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                </View>

                {/* Inventory Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{quantity || 0}</Text>
                        <Text style={styles.statLabel}>Total Stock</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{sold_units || 0}</Text>
                        <Text style={styles.statLabel}>Sold</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{quantity_in_store || 0}</Text>
                        <Text style={styles.statLabel}>In Store</Text>
                    </View>
                </View>

                {/* Detailed Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General Information</Text>
                    <InfoRow label="Part Number" value={part_number || 'N/A'} icon="barcode-outline" />
                    <InfoRow label="Created At" value={safeDate(created_at)} icon="calendar-outline" />
                    <InfoRow 
                        label="Revenue" 
                        value={`$${safeParseFloat(amount_collected)}`} 
                        icon="cash-outline" 
                        color="#28a745" 
                    />
                </View>

                {/* Vehicles Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compatible Vehicles</Text>
                    {vehicles && vehicles.length > 0 ? (
                        <View style={styles.vehicleList}>
                            {vehicle_list.map((vehicle, index) => (
                                <View key={index} style={styles.vehicleChip}>
                                    <Ionicons name="car-sport-outline" size={14} color="#007AFF" />
									<Text style={styles.vehicleText}>{vehicle}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No vehicle compatibility listed.</Text>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {description || "No additional description provided for this part."}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    // ... existing styles ...
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    scrollContent: { padding: 16 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 3 },
        }),
    },
    productName: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
    brandText: { fontSize: 16, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
    priceBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 15,
    },
    priceText: { fontSize: 20, fontWeight: '800', color: '#007AFF' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statBox: {
        backgroundColor: '#FFF',
        flex: 1,
        marginHorizontal: 4,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    statLabel: { fontSize: 11, color: '#888', marginTop: 4, textTransform: 'uppercase' },
    section: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    labelContainer: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 10 },
    label: { fontSize: 14, color: '#666' },
    value: { fontSize: 14, fontWeight: '600' },
    vehicleList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    vehicleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D0E3FF',
    },
    vehicleText: { fontSize: 15, color: '#007AFF', marginLeft: 4, fontWeight: '600' },
    descriptionText: { fontSize: 14, color: '#555', lineHeight: 20 },
    emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
    
    // New styles for loading and error states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#D9534F',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});

export default ProductDetailScreen;
