import { useApp } from '@/context/AppProvider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Get screen width for responsive chart
const screenWidth = Dimensions.get('window').width;

// --- CONFIGURATION ---

const COLORS = {
    primary: '#007AFF',       // System Blue
    primaryLight: '#5AC8FA',
    success: '#34C759',
    background: '#F0F2F5',
    card: '#FFFFFF',
    text: '#1C1C1E',
    secondaryText: '#6A737D',
    accent: '#FF9500',
    border: '#EBEBF0',
    // New color for better chart background contrast
    chartGradientFrom: '#E6F0FF', // Very light blue
};

// --- API and DUMMY DATA SETUP ---

const RECENT_SALES_URL = 'http://127.0.0.1:8080/api/sales/';

const DUMMY_SALES_DATA = {
    totalRevenue: 12450.75,
    totalSalesCount: 128,
    averageSaleValue: 97.27,
    topProduct: {
        id: 'AUTC-V2',
        name: "Acme Ultra-Capacitor (V2)",
        unitsSold: 45,
        revenue: 4500.00
    },
    // 📊 IMPROVED CHART DUMMY DATA
    salesTrendData: {
        labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                data: [12000, 14500, 11000, 16200, 15500, 18000],
                color: (opacity = 1) => COLORS.primary, 
                strokeWidth: 3 // Thicker line for emphasis
            }
        ]
    }
};

const transformSaleData = (apiItem) => {
    const amount = parseFloat(apiItem.total_amount || 0);
    const type = amount >= 0 ? 'sale' : 'return';
    const date = apiItem.created_at ? new Date(apiItem.created_at).toLocaleTimeString() : 'Just now'; 
    
    return {
        id: apiItem.id || Math.random().toString(),
        type: type,
        description: apiItem.product_name || `Sale #${apiItem.id}`,
        amount: amount,
        date: date,
    };
};

// --- SUB-COMPONENTS (Skipped for brevity as they are unchanged) ---

const MetricCard = React.memo(({ iconName, title, value, color, subtitle }) => (
    <View style={[dashboardStyles.metricCard, { borderColor: color }]}>
        <View style={[dashboardStyles.iconWrapper, { backgroundColor: color + '10' }]}>
            <Ionicons name={iconName} size={28} color={color} />
        </View>
        <Text style={dashboardStyles.metricTitle}>{title}</Text>
        <Text style={dashboardStyles.metricValue}>{value}</Text>
        {subtitle && <Text style={dashboardStyles.metricSubtitle}>{subtitle}</Text>}
    </View>
));

const RecentActivityItem = ({ type, description, amount, date }) => {
    const isSale = type === 'sale';
    const amountText = isSale ? `+ ${amount.toFixed(0)}` : `- $${Math.abs(amount).toFixed(0)}`;
    const iconName = isSale ? 'arrow-up-circle' : 'arrow-down-circle';
    const amountColor = isSale ? COLORS.success : COLORS.accent;

    return (
        <View style={dashboardStyles.activityItemInner}>
            <Ionicons 
                name={iconName} 
                size={22} 
                color={amountColor} 
                style={{ marginRight: 15 }}
            />
            <View style={{ flex: 1 }}>
                <Text style={dashboardStyles.activityDescription} numberOfLines={1}>{description}</Text>
                <Text style={dashboardStyles.activityDate}>{date}</Text>
            </View>
            <Text style={[dashboardStyles.activityAmount, { color: amountColor }]}>
                {amountText}
            </Text>
        </View>
    );
};


// --- IMPROVED CHART CONFIGURATION ---

const chartConfig = {
    backgroundColor: COLORS.card,
    // Use the custom light blue for the chart area gradient
    backgroundGradientFrom: COLORS.chartGradientFrom, 
    backgroundGradientTo: COLORS.card,
    decimalPlaces: 0, 
    color: (opacity = 1) => COLORS.primary, // Line color
    labelColor: (opacity = 1) => COLORS.secondaryText,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: "5", // Slightly larger dots
        strokeWidth: "2",
        stroke: COLORS.primary, // Use primary for dot stroke
        fill: COLORS.card // White fill for better visibility
    },
    // Use a lighter gradient for the shadow area
    fillShadowGradient: COLORS.primary,
    fillShadowGradientOpacity: 0.2,
    propsForLabels: {
        fontWeight: '600'
    },
    // 💡 Add properties for axis styling
    propsForBackgroundLines: {
        strokeDasharray: '0', // Solid lines instead of dashed
        stroke: COLORS.border // Light border color for grid
    },
    // 💡 Hide the X-axis line for a cleaner look
    hideBorder: true, 
};

// --- MAIN COMPONENT ---

const SalesDashboardScreen = () => {
    const { userInfo } = useApp()
    const [recentActivities, setRecentActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
	const [totalSales, setTotalSales] = useState(0);

    console.log('User Info:', userInfo);

    useEffect(() => {
        const fetchRecentSales = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(RECENT_SALES_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                const transformedData = data.map(transformSaleData);
                console.log('====================================');
                console.log("transformedData: ",data);
                console.log('====================================');
				const totalSum = transformedData.reduce((accumulator, currentItem) => {
					    return accumulator + (currentItem.amount || 0);
						}, 0);
						setTotalSales(totalSum);
                setRecentActivities(transformedData);

            } catch (e) {
                console.error('Error fetching recent sales:', e);
                setError('Failed to load activities. Check connection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentSales();
    }, []);

    const navigateToNewSale = useCallback(() => {
        router.push('/Sales/Create'); 
    }, []);

    const navigateToProductDetails = useCallback((productId) => {
        console.log(`Navigating to product details for: ${productId}`);
    }, []);

    const handleDataPointClick = (data) => {
        // Implement navigation or modal display for the selected month/data point
        alert(`You clicked ${DUMMY_SALES_DATA.salesTrendData.labels[data.index]} with revenue: $${data.value.toLocaleString()}`);
    };

    const renderActivityContent = () => {
        if (isLoading) {
            return (
                <View style={dashboardStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={dashboardStyles.placeholderTextSmall}>Loading recent sales...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={dashboardStyles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={30} color={COLORS.accent} />
                    <Text style={[dashboardStyles.placeholderText, { color: COLORS.accent }]}>{error}</Text>
                </View>
            );
        }

        if (recentActivities.length === 0) {
            return (
                <View style={dashboardStyles.loadingContainer}>
                    <Ionicons name="document-text-outline" size={30} color={COLORS.secondaryText} />
                    <Text style={dashboardStyles.placeholderText}>No recent activities found.</Text>
                </View>
            );
        }

        return (
            <>
                {recentActivities.map((activity, index) => (
                    <View key={activity.id} style={index === recentActivities.length - 1 ? dashboardStyles.activityItemNoBorder : dashboardStyles.activityItem}>
                        <RecentActivityItem {...activity} />
                    </View>
                ))}
            </>
        );
    };

    return (
        <View style={dashboardStyles.container}>
            <ScrollView 
                contentContainerStyle={dashboardStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                
                {/* 1. Header and Quick Action Button */}
                <View style={dashboardStyles.header}>
                    <Text style={dashboardStyles.title}>Sales Overview</Text>
                    <TouchableOpacity 
                        style={dashboardStyles.actionButton}
                        onPress={navigateToNewSale}
                    >
                        <Ionicons name="add" size={20} color={COLORS.card} />
                        <Text style={dashboardStyles.actionButtonText}>New Sale</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. Key Performance Indicators (KPIs) */}
                <Text style={dashboardStyles.sectionTitle}>Key Metrics (This Month)</Text>
                <View style={dashboardStyles.metricsRow}>
                    <MetricCard 
                        iconName="wallet-outline" 
                        title="Total Revenue" 
                        value={`${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        color={COLORS.success}
                        // subtitle="2.5% increase from last month"
                    />
                    <MetricCard 
                        iconName="bar-chart-outline" 
                        title="Sales Count" 
                        value={DUMMY_SALES_DATA.totalSalesCount}
                        color={COLORS.primary}
                        subtitle="Target: 150"
                    />
                </View>
                <View style={dashboardStyles.metricsRow}>
                    <MetricCard 
                        iconName="pricetag-outline" 
                        title="Avg. Sale Value" 
                        value={`$${DUMMY_SALES_DATA.averageSaleValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        color={COLORS.accent}
                        subtitle="Stable"
                    />
                     <MetricCard 
                        iconName="rocket-outline" 
                        title="Top Seller Units" 
                        value={`${DUMMY_SALES_DATA.topProduct.unitsSold} units`}
                        color={COLORS.text} 
                        subtitle="Acme Ultra-Capacitor"
                    />
                </View>

                {/* 3. Top Performing Product Card /}
                <Text style={dashboardStyles.sectionTitle}>Product Focus</Text>
                <TouchableOpacity
                    style={dashboardStyles.topProductCard}
                    onPress={() => navigateToProductDetails(DUMMY_SALES_DATA.topProduct.id)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="star" size={24} color={COLORS.accent} />
                    <View style={{flex: 1, marginHorizontal: 15}}>
                        <Text style={dashboardStyles.topProductTitle} numberOfLines={1}>
                            {DUMMY_SALES_DATA.topProduct.name}
                        </Text>
                        <Text style={dashboardStyles.topProductSub}>
                            Revenue: **${DUMMY_SALES_DATA.topProduct.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}**
                        </Text>
                    </View>
                    <Text style={dashboardStyles.detailButtonText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.secondaryText} style={{marginLeft: 5}}/>
                </TouchableOpacity>

                {/* 4. Sales Trend Chart (IMPROVED) */}
                <Text style={dashboardStyles.sectionTitle}>Sales Trend (Last 6 Months)</Text>
                <View style={dashboardStyles.chartContainer}>
                    <LineChart
                        data={DUMMY_SALES_DATA.salesTrendData}
                        width={screenWidth - 40} 
                        height={200}
                        chartConfig={chartConfig}
                        bezier 
                        style={dashboardStyles.chartStyle}
                        formatYLabel={(y) => `$${(parseFloat(y)/1000).toFixed(0)}k`} // Professional formatting
                        onDataPointClick={handleDataPointClick} // Added interaction
                    />
                </View>

                {/* 5. Recent Activity Feed */}
                <Text style={dashboardStyles.sectionTitle}>Recent Activity</Text>
                <View style={dashboardStyles.activityFeedContainer}>
                    {renderActivityContent()}
                    <TouchableOpacity style={dashboardStyles.viewAllButton}
                      onPress={() => router.push('/Sales')}
                    >
                        <Text style={dashboardStyles.viewAllButtonText}>View All Sales</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
};

// --- DASHBOARD STYLES (Unchanged styles omitted for brevity) ---

const dashboardStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    
    // Header & Action styles...
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 35,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    actionButtonText: {
        color: COLORS.card,
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 6,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondaryText,
        marginTop: 20,
        marginBottom: 12,
        textTransform: 'uppercase',
    },

    // Metrics styles...
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metricCard: {
        width: '48.5%',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16, 
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.secondaryText,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 25,
        fontWeight: '700',
        color: COLORS.text,
    },
    metricSubtitle: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.secondaryText,
        marginTop: 4,
    },
    
    // Top Product Card styles...
    topProductCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 18,
        borderRadius: 16,
        marginBottom: 25,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.accent,
    },
    topProductTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
    },
    topProductSub: {
        fontSize: 13,
        color: COLORS.secondaryText,
        marginTop: 4,
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // 📈 Chart Container (IMPROVED STYLING)
    chartContainer: {
        borderRadius: 16,
        backgroundColor: COLORS.chartGradientFrom, // Use the gradient start color as the container background
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 25,
    },
    chartStyle: {
        marginVertical: 0,
        borderRadius: 16,
        // Push the chart to the left edge of the container to align with card content
        marginLeft: -10, 
    },

    // Recent Activity styles...
    activityFeedContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    activityItem: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    activityItemNoBorder: { 
        // No border for the last item
    },
    activityItemInner: { 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    activityDescription: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.text,
    },
    activityDate: {
        fontSize: 12,
        color: COLORS.secondaryText,
        marginTop: 2,
    },
    activityAmount: {
        fontSize: 15,
        fontWeight: '600',
    },
    viewAllButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    viewAllButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 15,
    },
    // Loading/Error states
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default SalesDashboardScreen;
