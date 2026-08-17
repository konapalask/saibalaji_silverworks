import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, ArrowRight, ShieldCheck, Award, Sparkles, Star } from 'lucide-react-native';
import api from '../services/api';
import { Category, Product } from '../types';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?is_featured=true&limit=10'),
      ]);
      setCategories(catRes.data);
      setFeaturedProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Luxury Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=1000&q=80' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroSub}>Purity • Precision • Elegance</Text>
          <Text style={styles.heroTitle}>Sai Balaji Silverworks</Text>
          <Text style={styles.heroDesc}>
            Crafted in 92.5% & 99.9% pure hallmarked silver for retail & wholesale.
          </Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate('Categories')}
          >
            <Text style={styles.heroBtnText}>Explore Collections</Text>
            <ArrowRight color="#1A1918" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trust Badges */}
      <View style={styles.badgeBar}>
        <View style={styles.badgeItem}>
          <ShieldCheck color="#C5A059" size={18} />
          <Text style={styles.badgeText}>92.5% & 99.9% Purity</Text>
        </View>
        <View style={styles.badgeItem}>
          <Award color="#C5A059" size={18} />
          <Text style={styles.badgeText}>BIS Hallmarked</Text>
        </View>
        <View style={styles.badgeItem}>
          <Sparkles color="#C5A059" size={18} />
          <Text style={styles.badgeText}>Direct Wholesale</Text>
        </View>
      </View>

      {/* Categories Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTag}>COLLECTIONS</Text>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C5A059" style={{ marginVertical: 30 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              onPress={() => navigation.navigate('Categories', { categorySlug: cat.slug })}
            >
              <Image source={{ uri: cat.image_url }} style={styles.catImage} />
              <View style={styles.catOverlay}>
                <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Featured Products */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTag}>CURATED SELECTION</Text>
        <Text style={styles.sectionTitle}>Featured Silver Creations</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prodScroll}>
        {featuredProducts.map((prod) => (
          <TouchableOpacity
            key={prod.id}
            style={styles.prodCard}
            onPress={() => navigation.navigate('ProductDetail', { product: prod })}
          >
            <Image
              source={{ uri: prod.images?.[0] || 'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=400' }}
              style={styles.prodImage}
            />
            <View style={styles.purityBadge}>
              <Text style={styles.purityText}>{prod.silver_purity}</Text>
            </View>
            <View style={styles.prodInfo}>
              <Text style={styles.prodTitle} numberOfLines={1}>{prod.title}</Text>
              <Text style={styles.prodWeight}>{prod.weight_g} grams</Text>
              <View style={styles.priceRow}>
                <Text style={styles.prodPrice}>₹{prod.retail_price.toLocaleString()}</Text>
                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Wholesale Banner */}
      <View style={styles.wholesaleBanner}>
        <Text style={styles.wholesaleTag}>B2B & WHOLESALE</Text>
        <Text style={styles.wholesaleTitle}>Bulk Orders & Custom Minting</Text>
        <Text style={styles.wholesaleDesc}>
          Partner with Sai Balaji Silverworks for GST registered wholesale supply, temple donations, and custom corporate gifts.
        </Text>
        <TouchableOpacity
          style={styles.wholesaleBtn}
          onPress={() => navigation.navigate('Wholesale')}
        >
          <Text style={styles.wholesaleBtnText}>Request Wholesale Quote</Text>
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
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 25, 24, 0.65)',
    padding: 24,
    justifyContent: 'center',
  },
  heroSub: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 4,
    marginBottom: 8,
  },
  heroDesc: {
    color: '#D4CEB8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroBtnText: {
    color: '#1A1918',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1918',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#FAF9F5',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTag: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: '#1A1918',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 2,
  },
  catScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  catCard: {
    width: 140,
    height: 170,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
    backgroundColor: '#1A1918',
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 25, 24, 0.45)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  catName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  prodScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  prodCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E6E1DA',
    position: 'relative',
  },
  prodImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
  },
  purityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#1A1918',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  purityText: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
  },
  prodInfo: {
    padding: 12,
  },
  prodTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1918',
  },
  prodWeight: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  prodPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  viewBtn: {
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#C5A059',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewBtnText: {
    color: '#1A1918',
    fontSize: 10,
    fontWeight: '700',
  },
  wholesaleBanner: {
    margin: 20,
    backgroundColor: '#1A1918',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  wholesaleTag: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  wholesaleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  wholesaleDesc: {
    color: '#D4CEB8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  wholesaleBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  wholesaleBtnText: {
    color: '#1A1918',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
