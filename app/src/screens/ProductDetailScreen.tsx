import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ShoppingBag, Heart, ShieldCheck, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Product } from '../types';

const { width } = Dimensions.get('window');

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const product: Product = route.params?.product;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImg, setSelectedImg] = useState<string>(
    product?.images?.[0] || 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=800'
  );

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Product not found.</Text>
      </View>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert('Added to Cart', `${product.title} has been added to your cart.`);
  };

  const handleWhatsAppOrder = () => {
    const text = `Hello Sai Balaji Silverworks! I am interested in purchasing:\n\n*Product*: ${product.title}\n*SKU*: ${product.sku}\n*Purity*: ${product.silver_purity}\n*Weight*: ${product.weight_g} grams\n*Price*: ₹${product.retail_price.toLocaleString()}\n\nPlease guide me on stock & payment details.`;
    const url = `whatsapp://send?phone=+919876500000&text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp on this device.');
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Gallery Image Display */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImg }} style={styles.mainImage} />
          
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#1A1918" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(product)}
          >
            <Heart color={inWishlist ? '#E53E3E' : '#1A1918'} fill={inWishlist ? '#E53E3E' : 'none'} size={18} />
          </TouchableOpacity>
        </View>

        {/* Image Thumbnails if multiple */}
        {product.images && product.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbScroll}>
            {product.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImg(img)}
                style={[styles.thumbBox, selectedImg === img && styles.activeThumb]}
              >
                <Image source={{ uri: img }} style={styles.thumbImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Meta */}
        <View style={styles.detailsContainer}>
          <View style={styles.purityRow}>
            <View style={styles.purityTag}>
              <ShieldCheck color="#C5A059" size={14} />
              <Text style={styles.purityTagText}>{product.silver_purity} Hallmarked Silver</Text>
            </View>
            <Text style={styles.skuText}>SKU: {product.sku}</Text>
          </View>

          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.weight}>Weight: {product.weight_g} grams</Text>

          {/* Price Box */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Retail Price</Text>
            <Text style={styles.priceValue}>₹{product.retail_price.toLocaleString()}</Text>
            <Text style={styles.priceSub}>Price inclusive of craftsmanship & hallmark certification. +3% GST at checkout.</Text>
          </View>

          {/* Specifications */}
          <View style={styles.specBox}>
            <Text style={styles.specTitle}>Product Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category:</Text>
              <Text style={styles.specVal}>{product.category_slug}</Text>
            </View>
            {product.subcategory && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Subcategory:</Text>
                <Text style={styles.specVal}>{product.subcategory}</Text>
              </View>
            )}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Availability:</Text>
              <Text style={[styles.specVal, { color: product.stock > 0 ? '#276749' : '#C53030' }]}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descBox}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.descText}>{product.description}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.qtyContainer}>
            <Text style={styles.qtyLabel}>Quantity:</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={styles.whatsappBtn}
          onPress={handleWhatsAppOrder}
        >
          <MessageCircle color="#25D366" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={handleAddToCart}
        >
          <ShoppingBag color="#1A1918" size={18} />
          <Text style={styles.addCartText}>Add to Shopping Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#1A1918',
  },
  imageContainer: {
    width: width,
    height: width * 0.9,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  thumbBox: {
    width: 54,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E6E1DA',
  },
  activeThumb: {
    borderColor: '#C5A059',
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  purityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  purityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1A1918',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  purityTagText: {
    color: '#C5A059',
    fontSize: 11,
    fontWeight: '700',
  },
  skuText: {
    color: '#888',
    fontSize: 11,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1918',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  weight: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DA',
    marginVertical: 16,
  },
  priceLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1918',
    marginVertical: 2,
  },
  priceSub: {
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  specBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DA',
    marginBottom: 16,
  },
  specTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1918',
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specLabel: {
    fontSize: 12,
    color: '#888',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1918',
  },
  descBox: {
    marginBottom: 16,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DA',
    marginBottom: 20,
  },
  qtyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1918',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#C5A059',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  qtyVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  footerBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E6E1DA',
    gap: 12,
  },
  whatsappBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#25D366',
  },
  addCartBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#C5A059',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addCartText: {
    color: '#1A1918',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
