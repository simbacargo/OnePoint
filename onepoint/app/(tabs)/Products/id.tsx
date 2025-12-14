import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ProductDetailScreen = () => {
    // This would typically come from route params: const { product } = useLocalSearchParams();
    const product = {
        "id": 820,
        "name": "4PK 925",
        "description": "No description provided.",
        "brand": "N/A",
        "price": "3000.00",
        "part_number": "PN-820-X",
        "quantity": 5,
        "quantity_in_store": 0,
        "amount": "0.00",
        "sold_units": 0,
        "amount_collected": "0.00",
        "created_at": "2025-11-22T13:27:10.966214Z",
        "deleted": false,
        "vehicles": ["Toyota Hilux", "Nissan Navara"] // Mocked for demonstration
    };

    const InfoRow = ({ label, value, icon, color = "#555" }) => (
        <View style={styles.infoRow}>
            <View style={styles.labelContainer}>
                <Ionicons name={icon} size={20} color={color} style={styles.icon} />
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={[styles.value, { color: color === "#555" ? "#000" : color }]}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.brandText}>{product.brand || 'Generic Brand'}</Text>
                    
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>${parseFloat(product.price).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Inventory Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{product.quantity}</Text>
                        <Text style={styles.statLabel}>Total Stock</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{product.sold_units}</Text>
                        <Text style={styles.statLabel}>Sold</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{product.quantity_in_store}</Text>
                        <Text style={styles.statLabel}>In Store</Text>
                    </View>
                </View>

                {/* Detailed Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>General Information</Text>
                    <InfoRow label="Part Number" value={product.part_number || 'N/A'} icon="barcode-outline" />
                    <InfoRow label="Created At" value={new Date(product.created_at).toLocaleDateString()} icon="calendar-outline" />
                    <InfoRow 
                        label="Revenue" 
                        value={`$${parseFloat(product.amount_collected).toFixed(0)}`} 
                        icon="cash-outline" 
                        color="#28a745" 
                    />
                </View>

                {/* Vehicles Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compatible Vehicles</Text>
                    {product.vehicles.length > 0 ? (
                        <View style={styles.vehicleList}>
                            {product.vehicles.map((vehicle, index) => (
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
                        {product.description || "No additional description provided for this part."}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
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
    vehicleText: { fontSize: 13, color: '#007AFF', marginLeft: 4, fontWeight: '500' },
    descriptionText: { fontSize: 14, color: '#555', lineHeight: 20 },
    emptyText: { fontSize: 14, color: '#999', fontStyle: 'italic' },
});

export default ProductDetailScreen;