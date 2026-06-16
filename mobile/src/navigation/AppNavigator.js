import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BRAND } from '../constants/brand';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import SplashScreen from '../screens/SplashScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/ServicesScreen';
import AIScreen from '../screens/AIScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import AppointmentCalendarScreen from '../screens/AppointmentCalendarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = symbol => ({ color, focused }) => <AnimatedTabIcon color={color} focused={focused}>{symbol}</AnimatedTabIcon>;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(5,5,5,0.96)',
          borderTopColor: '#2A2415',
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: BRAND.colors.gold,
          shadowOpacity: 0.18,
          shadowRadius: 14,
          elevation: 14,
        },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
        tabBarActiveTintColor: BRAND.colors.gold,
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon('⌂') }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarIcon: icon('✂') }} />
      <Tab.Screen name="Book" component={AppointmentCalendarScreen} options={{ tabBarIcon: icon('◷') }} />
      <Tab.Screen name="AI" component={AIScreen} options={{ title: 'AI', tabBarIcon: icon('◆') }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} options={{ tabBarIcon: icon('★') }} />
      <Tab.Screen name="Scan" component={QRScannerScreen} options={{ tabBarIcon: icon('▣') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('♙') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
