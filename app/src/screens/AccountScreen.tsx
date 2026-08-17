import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User as UserIcon, Mail, Phone, Building2, ShieldCheck, Heart, LogOut, Lock, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export const AccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, login, register, logout, isAdmin } = useAuth();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Required Fields', 'Please fill in Email, Password, and Full Name');
      return;
    }
    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        phone,
        company_name: companyName,
        gstin,
      });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not register');
    } finally {
      setLoading(false);
    }
  };

  // If Logged In View
  if (user) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <Text style={styles.profileName}>{user.full_name || 'Valued Customer'}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          <View style={styles.roleBadge}>
            <ShieldCheck color="#C5A059" size={14} />
            <Text style={styles.roleBadgeText}>{user.role || 'CUSTOMER'}</Text>
          </View>
        </View>

        {/* Profile Info Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Profile</Text>

          {user.phone && (
            <View style={styles.infoRow}>
              <Phone color="#888" size={16} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          )}

          {user.company_name && (
            <View style={styles.infoRow}>
              <Building2 color="#888" size={16} />
              <Text style={styles.infoText}>{user.company_name}</Text>
            </View>
          )}

          {user.gstin && (
            <View style={styles.infoRow}>
              <ShieldCheck color="#888" size={16} />
              <Text style={styles.infoText}>GSTIN: {user.gstin}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut color="#E53E3E" size={16} />
            <Text style={styles.logoutBtnText}>Sign Out of Account</Text>
          </TouchableOpacity>
        </View>

        {/* Wishlist Preview */}
        <View style={styles.card}>
          <View style={styles.wishlistHeader}>
            <Text style={styles.cardTitle}>Saved Wishlist ({wishlist.length})</Text>
            <Heart color="#C5A059" size={18} />
          </View>

          {wishlist.length === 0 ? (
            <Text style={styles.emptyText}>No saved items in your wishlist.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {wishlist.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.wishCard}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                >
                  <Image source={{ uri: item.images?.[0] }} style={styles.wishImg} />
                  <Text style={styles.wishTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.wishPrice}>₹{item.retail_price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  // Login / Register Form View
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.authHeader}>
        <Text style={styles.authTag}>WELCOME TO SAI BALAJI</Text>
        <Text style={styles.authTitle}>Account Access</Text>
      </View>

      {/* Auth Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'login' && styles.activeTab]}
          onPress={() => setActiveTab('login')}
        >
          <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'register' && styles.activeTab]}
          onPress={() => setActiveTab('register')}
        >
          <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>New Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {activeTab === 'register' && (
          <>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 00000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Company / Business Name (Wholesale Buyers)</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional Business Name"
              placeholderTextColor="#999"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Text style={styles.label}>GSTIN (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional GSTIN Number"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              value={gstin}
              onChangeText={setGstin}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={activeTab === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#1A1918" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>
              {activeTab === 'login' ? 'Sign In to Account' : 'Register Account'}
            </Text>
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
  profileHeader: {
    backgroundColor: '#1A1918',
    padding: 24,
    alignItems: 'center',
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#C5A059',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 12,
    color: '#D4CEB8',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(197, 160, 89, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#444',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E6E1DA',
  },
  logoutBtnText: {
    color: '#E53E3E',
    fontSize: 13,
    fontWeight: '600',
  },
  wishlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#888',
    marginVertical: 8,
  },
  wishCard: {
    width: 100,
    marginRight: 10,
  },
  wishImg: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  wishTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1918',
    marginTop: 4,
  },
  wishPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A1918',
  },
  authHeader: {
    padding: 24,
    backgroundColor: '#1A1918',
    alignItems: 'center',
  },
  authTag: {
    color: '#C5A059',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  authTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#E6E1DA',
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#1A1918',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#E6E1DA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1A1918',
  },
  submitBtn: {
    backgroundColor: '#C5A059',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#1A1918',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
