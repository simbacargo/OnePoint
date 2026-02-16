import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text, 
    TextInput,
    TouchableOpacity,
    View,
    Animated
} from 'react-native';

const SALE_API_URL = 'http://127.0.0.1:8080/sales/';
const PRODUCTS_API_URL = 'http://127.0.0.1:8080/api/products/'; 
const CUSTOMERS_API_URL = 'http://127.0.0.1:8080/api/customers/';

const RecordSaleScreen = () => {
    // --- Data State ---
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    
    // --- Form State ---
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    
    // --- UI State ---
    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // --- Pretty Toast State ---
    const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // 1. Initialize Data & Check Auth
    useEffect(() => {
        fetchInitialData();
    }, []);

    const triggerToast = (msg, type = 'error') => {
        setToast({ visible: true, message: msg, type: type });
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

        setTimeout(() => {
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                setToast({ visible: false, message: '', type: 'error' });
                // If it was a success, redirect after toast disappears
                if (type === 'success') {
                    router.replace('/Sales'); 
                }
            });
        }, 2000);
    };

    const handleAuthError = () => {
        triggerToast("Authentication failed. Redirecting to login...");
        setTimeout(() => {
            router.replace('/login'); 
        }, 2000);
    };

    const fetchInitialData = async () => {
        try {
            const token = await AsyncStorage.getItem('@authToken');
            if (!token) return handleAuthError();

            const headers = { 'Authorization': `Bearer ${token}` };
            const [prodRes, custRes] = await Promise.all([
                fetch(PRODUCTS_API_URL, { headers }),
                fetch(CUSTOMERS_API_URL, { headers })
            ]);

            if (prodRes.status === 401 || custRes.status === 401) return handleAuthError();

            const prodData = await prodRes.json();
            const custData = await custRes.json();

            setProducts(prodData || []);
            setCustomers(custData || []);
        } catch (e) {
            triggerToast("Network Error: Could not load data");
        }
    };

    // --- Cart Actions ---
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setIsProductModalVisible(false);
        setProductSearchTerm('');
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => 
            item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        ));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const totalAmount = useMemo(() => {
        return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
    }, [cart]);

    // --- Final Submission ---
    const handlePostSale = async () => {
        if (cart.length === 0) return triggerToast("Cart is empty");

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('@authToken');
            
            const saleData = {
                customer_id: selectedCustomer?.id || null,
                customer_name: customerSearch || "Walking Customer",
                transaction_date: new Date().toISOString(),
                items: cart.map(item => ({
                    product: item.id,
                    quantity_sold: item.qty,
                    price_per_unit: parseFloat(item.price).toFixed(2)
                })),
                total_amount: totalAmount.toFixed(2)
            };

            const response = await fetch(SALE_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(saleData),
            });

            if (response.status === 401) return handleAuthError();

            if (response.ok) {
                triggerToast("Sale recorded successfully!", "success");
            } else {
                const err = await response.json();
                // Show server validation errors
                triggerToast(JSON.stringify(err));
            }
        } catch (error) {
            triggerToast("Network Error: Check server status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.main}>
            
            {/* Pretty Toast Notification */}
            {toast.visible && (
                <Animated.View style={[
                    styles.toast, 
                    { opacity: fadeAnim, backgroundColor: toast.type === 'success' ? '#34C759' : '#FF3B30' }
                ]}>
                    <Ionicons name={toast.type === 'success' ? "checkmark-circle" : "alert-circle"} size={20} color="#fff" />
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}

            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={28} /></TouchableOpacity>
                    <Text style={styles.title}>Record Sale</Text>
                    <View style={{width: 28}} />
                </View>

                {/* Customer Section */}
                <Text style={styles.label}>Customer</Text>
                <TouchableOpacity style={styles.card} onPress={() => setIsCustomerModalVisible(true)}>
                    <Text style={styles.cardValue}>{customerSearch || "Select or Type Name"}</Text>
                    <Ionicons name="person-outline" size={20} color="#007AFF" />
                </TouchableOpacity>

                {/* Cart Section */}
                <View style={styles.cartHeader}>
                    <Text style={styles.label}>Items</Text>
                    <TouchableOpacity onPress={() => setIsProductModalVisible(true)}>
                        <Text style={styles.addBtn}>+ Add Product</Text>
                    </TouchableOpacity>
                </View>

                {cart.length === 0 ? (
                    <Text style={styles.emptyText}>No items added yet</Text>
                ) : (
                    cart.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={{flex: 1}}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{parseFloat(item.price).toLocaleString()} TZS</Text>
                            </View>
                            <View style={styles.qtyBox}>
                                <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
                                <Text style={styles.qtyText}>{item.qty}</Text>
                                <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{marginLeft: 15}}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Bottom Summary & Button */}
            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{totalAmount.toLocaleString()} TZS</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.mainBtn, cart.length === 0 && styles.disabledBtn]} 
                    onPress={handlePostSale}
                    disabled={isLoading || cart.length === 0}
                >
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Post Transaction</Text>}
                </TouchableOpacity>
            </View>

            {/* Product Modal */}
            <Modal visible={isProductModalVisible} animationType="slide">
                <View style={styles.modal}>
                    <TouchableOpacity onPress={() => setIsProductModalVisible(false)}><Text style={styles.closeModal}>Close</Text></TouchableOpacity>
                    <TextInput 
                        placeholder="Search product..." 
                        style={styles.searchInput} 
                        value={productSearchTerm}
                        onChangeText={setProductSearchTerm}
                    />
                    <FlatList 
                        data={products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.listItem} onPress={() => addToCart(item)}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>{item.price} TZS</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Customer Modal */}
            <Modal visible={isCustomerModalVisible} animationType="fade" transparent={true}>
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Customer Name</Text>
                        <TextInput 
                            placeholder="Enter name..." 
                            style={styles.searchInput}
                            value={customerSearch}
                            onChangeText={(t) => { setCustomerSearch(t); setSelectedCustomer(null); }}
                        />
                        <FlatList 
                            style={{maxHeight: 150}}
                            data={customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.listItem} onPress={() => { setSelectedCustomer(item); setCustomerSearch(item.name); setIsCustomerModalVisible(false); }}>
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setIsCustomerModalVisible(false)} style={styles.confirmBtn}><Text style={{color: '#fff'}}>Confirm</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#F8F9FA' },
    container: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold' },
    label: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    cardValue: { fontSize: 16, fontWeight: '600' },
    cartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    addBtn: { color: '#007AFF', fontWeight: 'bold' },
    itemRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
    itemName: { fontSize: 15, fontWeight: '700' },
    itemPrice: { fontSize: 12, color: '#8E8E93' },
    qtyBox: { flexDirection: 'row', alignItems: 'center' },
    qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
    qtyText: { marginHorizontal: 10, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 20 },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    totalLabel: { fontSize: 16, color: '#8E8E93' },
    totalValue: { fontSize: 20, fontWeight: '800', color: '#007AFF' },
    mainBtn: { backgroundColor: '#000', padding: 18, borderRadius: 12, alignItems: 'center' },
    disabledBtn: { backgroundColor: '#ccc' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    toast: { position: 'absolute', top: 60, left: 20, right: 20, padding: 15, borderRadius: 30, zIndex: 1000, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    toastText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
    modal: { flex: 1, padding: 20, paddingTop: 40 },
    closeModal: { alignSelf: 'flex-end', color: '#007AFF', fontWeight: 'bold' },
    searchInput: { backgroundColor: '#F2F2F7', padding: 15, borderRadius: 12, marginVertical: 10 },
    listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    modalTitle: { fontWeight: 'bold', marginBottom: 10 },
    confirmBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 }
});

export default RecordSaleScreen;
