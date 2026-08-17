import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Trash2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    gstTax,
    shippingFee,
    grandTotal,
  } = useCart();

  // Shipping Form State
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    if (!customerName || !customerPhone || !address || !city || !pincode) {
      Alert.alert('Missing Details', 'Please complete your shipping address and contact details.');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        shipping_address: address,
        shipping_city: city,
        shipping_pincode: pincode,
        items: cartItems.map(i => ({
          product_id: i.product.id,
          title: i.product.title,
          quantity: i.quantity,
          price: i.product.retail_price,
        })),
        subtotal,
        gst_tax: gstTax,
        shipping_fee: shippingFee,
        grand_total: grandTotal,
      };

      const res = await api.post('/orders', payload);
      if (res.data) {
        clearCart();
        setCompletedOrderNum(res.data.order_number || 'SBS-ORD-SUCCESS');
      }
    } catch (err: any) {
      Alert.alert('Order Error', err?.response?.data?.detail || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (completedOrderNum) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 color="#276749" size={64} />
        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.orderNum}>Order #{completedOrderNum}</Text>
        <Text style={styles.successMessage}>
          Thank you for choosing Sai Balaji Silverworks. Your hallmarked silver items are being prepared for insured dispatch.
        </Text>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => {
            setCompletedOrderNum(null);
            navigation.navigate('Home');
          }}
        >
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingBag color="#C5A059" size={48} />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyDesc}>Discover our pure hallmarked silver jewelry and temple collections.</Text>
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.exploreBtnText}>Explore Collections</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Items List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shopping Cart ({cartItems.length} items)</Text>
      </View>

      {cartItems.map(item => (
        <View key={item.product.id} style={styles.cartCard}>
          <Image
            source={{ uri: item.product.images?.[0] || 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=300' }}
            style={styles.cartImg}
          />
          <View style={styles.cartInfo}>
            <Text style={styles.cartTitle} numberOfLines={1}>{item.product.title}</Text>
            <Text style={styles.cartSub}>{item.product.silver_purity} | {item.product.weight_g}g</Text>
            <Text style={styles.cartPrice}>₹{item.product.retail_price.toLocaleString()}</Text>

            <View style={styles.qtyRow}>
              <View style={styles.qtyBox}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  style={styles.qtyAction}
                >
                  <Text style={styles.qtyActionText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  style={styles.qtyAction}
                >
                  <Text style={styles.qtyActionText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => removeFromCart(item.product.id)}
                style={styles.trashBtn}
              >
                <Trash2 color="#E53E3E" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Address Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shipping & Contact Details</Text>
        
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Name for delivery invoice"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="+91 98765 00000"
          keyboardType="phone-pad"
          value={customerPhone}
          onChangeText={setCustomerPhone}
        />

        <Text style={styles.label}>Shipping Address *</Text>
        <TextInput
          style={[styles.input, { height: 70 }]}
          placeholder="Door No, Street Name, Landmark"
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tenali"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              placeholder="500001"
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bill Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryVal}>₹{subtotal.toLocaleString()}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GST (3% Silver Tax)</Text>
          <Text style={styles.summaryVal}>₹{gstTax.toLocaleString()}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Insured Shipping</Text>
          <Text style={styles.summaryVal}>
            {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}
          </Text>
        </View>

        <View style={[styles.summaryRow, { borderTopWidth: 1, borderColor: '#E6E1DA', paddingTop: 10, marginTop: 6 }]}>
          <Text style={styles.grandLabel}>Grand Total</Text>
          <Text style={styles.grandVal}>₹{grandTotal.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutBtn, placingOrder && { opacity: 0.6 }]}
          onPress={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#1A1918" size="small" />
          ) : (
            <Text style={styles.checkoutBtnText}>Confirm Order (₹{grandTotal.toLocaleString()})</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1918',
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#1A1918',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#C5A059',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DA',
  },
  cartImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1918',
  },
  cartSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  cartPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E1DA',
  },
  qtyAction: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  qtyNumber: {
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  trashBtn: {
    padding: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DA',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#E6E1DA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1A1918',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1918',
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  grandVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  checkoutBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutBtnText: {
    color: '#1A1918',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1918',
    marginTop: 16,
  },
  orderNum: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C5A059',
    marginTop: 4,
  },
  successMessage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 18,
  },
  continueBtn: {
    backgroundColor: '#1A1918',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueBtnText: {
    color: '#FAF9F5',
    fontSize: 12,
    fontWeight: '700',
  },
});
