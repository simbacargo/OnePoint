import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics'; // Optional: requires expo-haptics
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SALE_API_URL = 'http://127.0.0.1:8080/sales/';
const PRODUCTS_API_URL = 'http://127.0.0.1:8080/api/products/'; 


function thousandSeparator(value: string | number) {
  if (!value) return "0";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const BetterProductSaleScreen = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [saleQuantity, setSaleQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(PRODUCTS_API_URL);
            const data = await response.json();
            setProducts(data || []);
        } catch (e) {
            Alert.alert("Sync Error", "Could not refresh product list.");
        }
    };

    const totalAmount = useMemo(() => {
        const q = parseFloat(saleQuantity) || 0;
        const p = parseFloat(unitPrice) || 0;
        return (q * p).toFixed(0);
    }, [saleQuantity, unitPrice]);

    const isStockAvailable = useMemo(() => {
        if (!selectedProduct) return true;
        return (parseInt(saleQuantity) || 0) <= selectedProduct.quantity;
    }, [saleQuantity, selectedProduct]);

    const handleSelect = (product) => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedProduct(product);
        setUnitPrice(parseFloat(product.price).toFixed(0));
        setIsModalVisible(false);
    };

    const handleProcessSale = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);
    
    // THE PAYLOAD MUST MATCH YOUR ERROR MESSAGE KEYS
    const saleData = {
        "product": selectedProduct.id,       // Ensure this is the ID (integer)
        "quantity_sold": parseInt(saleQuantity, 10), 
        "price_per_unit": unitPrice,         // Ensure this is a string "3000.00"
        "total_amount": totalAmount,
        "date_sold": new Date().toISOString(),
    };

    try {
        const response = await fetch(SALE_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // If you use authentication, add it here:
                // 'Authorization': 'Token your_token_here' 
            },
            body: JSON.stringify(saleData),
        });

        const result = await response.json();

        if (response.ok) {
            Alert.alert('Success', 'Sale recorded!');
            router.replace('/Sales');
        } else {
            // This will help you see EXACTLY what the server didn't like
            console.log("Server Error Details:", result);
            Alert.alert('Submission Error', JSON.stringify(result));
        }
    } catch (error) {
        Alert.alert('Network Error', 'Could not reach server.');
    } finally {
        setIsLoading(false);
    }
};

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, backgroundColor: '#FFF'}}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                
                {/* Header Section */}
                <View style={styles.headerBox}>
                    <Text style={styles.title}>New Transaction</Text>
                    <Text style={styles.subtitle}>Fill in the details to record a sale</Text>
                </View>

                {/* Product Selector Card */}
                <Pressable 
                    style={({pressed}) => [styles.selectorCard, pressed && {opacity: 0.7}]}
                    onPress={() => setIsModalVisible(true)}
                >
                    <View style={styles.selectorIcon}>
                        <Ionicons name="cart" size={24} color="#007AFF" />
                    </View>
                    <View style={{flex: 1, marginLeft: 15}}>
                        <Text style={styles.selectorLabel}>Product</Text>
                        <Text style={styles.selectorValue} numberOfLines={1}>
                            {selectedProduct ? selectedProduct.name : "Choose a product..."}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#AEAEB2" />
                </Pressable>

                {selectedProduct && (
                    <View style={styles.formContainer}>
                        {/* Stock & Price Row */}
                        <View style={styles.inputRow}>
                            <View style={styles.inputHalf}>
                                <Text style={styles.fieldLabel}>Quantity</Text>
                                <TextInput
                                    style={[styles.input, !isStockAvailable && styles.inputError]}
                                    value={saleQuantity}
                                    onChangeText={setSaleQuantity}
                                    keyboardType="number-pad"
                                    placeholder="0"
                                />
                                {!isStockAvailable && <Text style={styles.errorText}>Max: {selectedProduct.quantity}</Text>}
                            </View>
                            <View style={styles.inputHalf}>
                                <Text style={styles.fieldLabel}>Price/Unit</Text>
                                <TextInput
                                    style={styles.input}
                                    value={unitPrice}
                                    onChangeText={setUnitPrice}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Summary View */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>{thousandSeparator(totalAmount)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <TouchableOpacity 
                                style={[styles.mainBtn, (!isStockAvailable || !saleQuantity) && styles.btnDisabled]}
                                disabled={isLoading || !isStockAvailable || !saleQuantity}
                                onPress={handleProcessSale}
                            >
                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Finalize Sale</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Selection Modal */}
            <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Inventory</Text>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.closeBtn}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="#8E8E93" />
                        <TextInput 
                            placeholder="Search name or part #..." 
                            style={styles.searchBar}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>
                    <FlatList
                        data={products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.productItem} onPress={() => handleSelect(item)}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemSub}>Stock: {item.quantity} | PN: {item.part_number}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{thousandSeparator(parseFloat(item.price).toFixed(0))}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 24, paddingTop: 60 },
    headerBox: { marginBottom: 30 },
    title: { fontSize: 28, fontWeight: '800', color: '#1C1C1E', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
    selectorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 16,
        borderRadius: 16,
        marginBottom: 25
    },
    selectorIcon: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    selectorLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
    selectorValue: { fontSize: 17, fontWeight: '600', color: '#000', marginTop: 2 },
    formContainer: { marginTop: 10 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    inputHalf: { width: '47%' },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: '#3A3A3C', marginBottom: 8 },
    input: { backgroundColor: '#F2F2F7', height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 17, fontWeight: '500' },
    inputError: { borderWidth: 1, borderColor: '#FF3B30', backgroundColor: '#FFF2F2' },
    errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, fontWeight: '600' },
    summaryCard: { backgroundColor: '#ddd', borderRadius: 24, padding: 24, marginTop: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    summaryLabel: { fontSize: 16, color: '#000' },
    summaryValue: { fontSize: 24, fontWeight: '800', color: '#111' },
    divider: { height: 1, backgroundColor: '#3A3A3C', marginBottom: 20 },
    mainBtn: { backgroundColor: '#34C759', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    btnDisabled: { backgroundColor: '#242426', opacity: 0.5 },
    btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    modalContent: { flex: 1, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    closeBtn: { color: '#007AFF', fontSize: 17, fontWeight: '600' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 15, borderRadius: 12, marginBottom: 15 },
    searchBar: { flex: 1, height: 44, marginLeft: 10 },
    productItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    itemName: { fontSize: 16, fontWeight: '600' },
    itemSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    itemPrice: { fontSize: 16, fontWeight: '700', color: '#34C759' }
});

export default BetterProductSaleScreen;
