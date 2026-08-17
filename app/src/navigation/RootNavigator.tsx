import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Home, LayoutGrid, Briefcase, ShoppingBag, User } from 'lucide-react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { WholesaleScreen } from '../screens/WholesaleScreen';
import { CartScreen } from '../screens/CartScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { useCart } from '../context/CartContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { totalItemsCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1A1918',
        },
        headerTitleStyle: {
          color: '#FAF9F5',
          fontFamily: 'serif',
          fontWeight: 'bold',
        },
        headerTintColor: '#C5A059',
        tabBarStyle: {
          backgroundColor: '#1A1918',
          borderTopColor: '#C5A059',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#C5A059',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Sai Balaji Silverworks',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          title: 'Silver Collections',
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="WholesaleTab"
        component={WholesaleScreen}
        options={{
          title: 'B2B Wholesale',
          tabBarLabel: 'Wholesale',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Shopping Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <ShoppingBag color={color} size={size} />
              {totalItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItemsCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          title: 'User Account',
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#C5A059',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#1A1918',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
