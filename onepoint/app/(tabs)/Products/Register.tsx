import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Using your real production domain
const API_URL = 'https://msaidizi.nsaro.com/api/products/';

const ProductRegistrationScreen = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [brand, setBrand] = useState('');
    const [vehicles, setVehicles] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegisterProduct = async () => {
        // Validation
        if (!name || !price || !quantity) {
            Alert.alert('Required Fields', 'Please fill in Product Name, Price, and Quantity.');
            return;
        }

        setIsSubmitting(true);

        // Prepare data to match your API JSON structure
        const productData = {
            name: name.trim(),
            description: description.trim() || "",
            brand: brand.trim() || "",
            price: parseFloat(price).toFixed(0), // API expects string like "3000.00"
            part_number: partNumber.trim() || "",
            quantity: parseInt(quantity, 10),
            // Default fields as seen in your GET response
            quantity_in_store: 0,
            amount: "0.00",
            sold_units: 0,
            amount_collected: "0.00",
            deleted: false,
            // Parsing vehicle IDs from "1, 2" string into [1, 2] array
            vehicles: vehicles ? vehicles.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : []
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (response.ok || response.status === 201) {
                Alert.alert('Success', 'Product added to inventory!', [
                    { text: 'OK', onPress: () => router.back() } // Go back to product list
                ]);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', JSON.stringify(errorData));
            }
        } catch (error) {
            Alert.alert('Network Error', 'Check your internet connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f8f9fa' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* <SafeAreaView style={{ flex: 0, backgroundColor: '#fff' }} /> */}
            
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Product</Text>
                <View style={{ width: 28 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Basic Information</Text>
                    
                    <Text style={styles.inputLabel}>Product Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 4PK 925"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.inputLabel}>Brand</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Toyota, Bosch"
                        value={brand}
                        onChangeText={setBrand}
                    />

                    <Text style={styles.inputLabel}>Part Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. PN-1002"
                        value={partNumber}
                        onChangeText={setPartNumber}
                    />
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Inventory & Pricing</Text>
                    
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.inputLabel}>Price ($) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inputLabel}>Initial Stock *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionLabel}>Additional Details</Text>
                    
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        style={[styles.input, { height: 80, paddingTop: 12 }]}
                        placeholder="Add product notes..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={styles.inputLabel}>Compatible Vehicle IDs (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 10, 22 (comma separated)"
                        value={vehicles}
                        onChangeText={setVehicles}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
                    onPress={handleRegisterProduct}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Product</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    scrollContainer: { padding: 20 },
    formSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#007AFF', marginBottom: 15, textTransform: 'uppercase' },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 6 },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
        fontSize: 16,
        marginBottom: 15,
        color: '#333'
    },
    row: { flexDirection: 'row' },
    submitButton: {
        backgroundColor: '#34C759',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        elevation: 4,
    },
    disabledButton: { backgroundColor: '#A5D6A7' },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ProductRegistrationScreen;