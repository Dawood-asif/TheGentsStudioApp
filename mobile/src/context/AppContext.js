import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVICES } from '../data/services';
import { calculatePackageTotals } from '../utils/packageTotals';
import { registerForPushNotifications } from '../utils/notifications';

const AppContext = createContext(null);

const defaultCustomer = {
  id: 'TGSS-DEMO-0001',
  customerCode: 'TGSS-DEMO-0001',
  fullName: 'Boss',
  phone: '0301 5092782',
  email: 'customer@example.com',
  birthday: '1998-01-01',
  referralCode: 'TGSSDEMO1',
  profileImageUrl: null,
  stamps: 6,
  points: 600,
  visits: 6,
  currentStreak: 4,
  longestStreak: 4,
  joinDate: new Date().toISOString(),
};

export function AppProvider({ children }) {
  const [customer, setCustomer] = useState(defaultCustomer);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(value => {
      if (value !== null) setDarkMode(value === 'true');
    });
  }, []);

  useEffect(() => {
    registerForPushNotifications(customer.uuid || customer.databaseId || null).catch(() => {});
  }, [customer.uuid, customer.databaseId]);

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem('darkMode', String(next));
  };

  const toggleService = service => {
    setSelectedServices(current => {
      const exists = current.some(item => item.id === service.id);
      return exists ? current.filter(item => item.id !== service.id) : [...current, service];
    });
  };

  const clearPackage = () => setSelectedServices([]);
  const packageTotals = useMemo(() => calculatePackageTotals(selectedServices), [selectedServices]);

  const value = {
    customer,
    setCustomer,
    darkMode,
    toggleDarkMode,
    services: SERVICES,
    selectedServices,
    toggleService,
    clearPackage,
    packageTotals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
