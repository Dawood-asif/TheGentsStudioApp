import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider, useApp } from './context/AppContext';
import AppNavigator from './navigation/AppNavigator';
import { BRAND } from './constants/brand';

function AppShell() {
  const { darkMode } = useApp();
  return (
    <NavigationContainer>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={BRAND.colors.black} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
