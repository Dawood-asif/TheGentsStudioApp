import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  LogBox,
  AppState,
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Share,
  RefreshControl,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const Stack = createStackNavigator();
LogBox.ignoreAllLogs();

// ========== COLORS ==========
const Colors = {
  background: '#0A0A0A',
  cardBackground: '#141414',
  gold: '#D4AF37',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#666666',
  success: '#00C853',
  error: '#D32F2F',
  warning: '#FFC107',
  border: '#2A2A2A',
};

// ========== SPLASH SCREEN ==========
const SplashScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: Colors.gold, fontSize: 48 }}>👑</Text>
      <Text style={{ color: Colors.gold, fontSize: 24, marginTop: 10 }}>THE GENTS STUDIO</Text>
      <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>Ultra Luxury Grooming</Text>
    </View>
  );
};

// ========== SIGNUP SCREEN ==========
const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone || !email || !birthday) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to terms');
      return;
    }
    setLoading(true);
    const referralCode = 'GENTS' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const userData = {
      id: Date.now().toString(),
      name, phone, email, birthday,
      referralCode,
      stamps: 0,
      streak: 0,
      longestStreak: 0,
      points: 0,
      referrals: 0,
      totalVisits: 0,
      joinDate: new Date().toISOString(),
      isVIP: false,
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    await AsyncStorage.setItem('isLoggedIn', 'true');
    setLoading(false);
    navigation.replace('Home');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
      <Text style={{ color: Colors.gold, fontSize: 32, textAlign: 'center', marginTop: 40 }}>👑 THE GENTS STUDIO & SPA</Text>
      <TextInput placeholder="Full Name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} style={{ backgroundColor: Colors.cardBackground, color: 'white', padding: 15, borderRadius: 10, marginVertical: 8 }} />
      <TextInput placeholder="Phone Number (WhatsApp)" placeholderTextColor={Colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ backgroundColor: Colors.cardBackground, color: 'white', padding: 15, borderRadius: 10, marginVertical: 8 }} />
      <TextInput placeholder="Email Address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" style={{ backgroundColor: Colors.cardBackground, color: 'white', padding: 15, borderRadius: 10, marginVertical: 8 }} />
      <TextInput placeholder="Birthday (DD/MM/YYYY)" placeholderTextColor={Colors.textMuted} value={birthday} onChangeText={setBirthday} style={{ backgroundColor: Colors.cardBackground, color: 'white', padding: 15, borderRadius: 10, marginVertical: 8 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
        <Switch value={agreeTerms} onValueChange={setAgreeTerms} trackColor={{ false: Colors.textMuted, true: Colors.gold }} thumbColor={agreeTerms ? Colors.gold : Colors.textSecondary} />
        <Text style={{ color: Colors.textSecondary, marginLeft: 10 }}>I agree to Terms & Privacy Policy</Text>
      </View>
      <TouchableOpacity onPress={handleSignup} disabled={loading} style={{ backgroundColor: Colors.gold, padding: 15, borderRadius: 40, alignItems: 'center' }}>
        <Text style={{ color: Colors.background, fontWeight: 'bold' }}>{loading ? 'CREATING...' : 'CREATE MY ACCOUNT'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert('Call Us', '0301 5092782 or 0335 2279567')} style={{ backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 40, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: Colors.gold }}>
        <Text style={{ color: Colors.gold, fontWeight: 'bold' }}>📞 BOOK BY PHONE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ========== HOME SCREEN ==========
const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadUserData(); setupNetworkListener(); const unsubscribe = navigation.addListener('focus', loadUserData); return unsubscribe; }, []);

  const setupNetworkListener = () => { NetInfo.addEventListener(state => setIsOnline(state.isConnected)); };
  const loadUserData = async () => { const data = await AsyncStorage.getItem('userData'); if (data) setUserData(JSON.parse(data)); };
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadUserData(); setRefreshing(false); }, []);

  const addStamp = async () => {
    if (!userData) return;
    const lastStampDate = await AsyncStorage.getItem('lastStampDate');
    const today = new Date().toDateString();
    if (lastStampDate === today) { Alert.alert('Already Stamped', 'You can only earn 1 stamp per day'); return; }
    const newStamps = userData.stamps + 1;
    const newPoints = (userData.points || 0) + 100;
    const updatedUser = { ...userData, stamps: newStamps, points: newPoints, totalVisits: (userData.totalVisits || 0) + 1, lastVisitDate: new Date().toISOString() };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    await AsyncStorage.setItem('lastStampDate', today);
    setUserData(updatedUser);
    if (newStamps % 10 === 0) Alert.alert('🎉 FREE SERVICE!', 'You earned a free service!');
  };

  const shareReferral = async () => { await Share.share({ message: `Join The Gents Studio & Spa! Use my code: ${userData?.referralCode || userData?.phone} | Get 20% off first visit!` }); };

  if (!userData) return <SplashScreen />;

  const stampsNeeded = 10 - (userData.stamps % 10);
  const progress = (userData.stamps % 10) / 10;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: darkMode ? '#050505' : Colors.background, padding: 20 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
        <View><Text style={{ color: Colors.textSecondary, fontSize: 14 }}>👑 Welcome back,</Text><Text style={{ color: Colors.gold, fontSize: 24 }}>{userData.name.split(' ')[0]}!</Text></View>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBackground, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>{darkMode ? '☀️' : '🌙'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBackground, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>🏆</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cardBackground, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>👤</Text></TouchableOpacity>
        </View>
      </View>
      {!isOnline && <View style={{ backgroundColor: Colors.warning, padding: 10, borderRadius: 10, marginBottom: 15 }}><Text style={{ color: Colors.background, textAlign: 'center' }}>📡 OFFLINE MODE - Changes will sync when online</Text></View>}
      <View style={{ backgroundColor: Colors.cardBackground, borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: Colors.gold }}>
        <Text style={{ color: Colors.gold, fontSize: 14 }}>YOUR LOYALTY STAMPS</Text>
        <Text style={{ color: Colors.gold, fontSize: 48, fontWeight: 'bold' }}>{userData.stamps}</Text>
        <View style={{ backgroundColor: Colors.textMuted, borderRadius: 10, height: 8, width: '100%', marginVertical: 15 }}><View style={{ backgroundColor: Colors.gold, borderRadius: 10, height: 8, width: `${progress * 100}%` }} /></View>
        <Text style={{ color: Colors.gold, fontSize: 12 }}>{stampsNeeded === 0 ? '🎉 Redeem your free service!' : `${stampsNeeded} more stamps for FREE service!`}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Services')} style={{ backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: Colors.gold }}><Text style={{ fontSize: 24 }}>📅</Text><Text style={{ color: Colors.gold, fontSize: 12 }}>BOOK</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Call', '0301 5092782 or 0335 2279567')} style={{ backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: Colors.gold }}><Text style={{ fontSize: 24 }}>📞</Text><Text style={{ color: Colors.gold, fontSize: 12 }}>CALL</Text></TouchableOpacity>
        <TouchableOpacity onPress={shareReferral} style={{ backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: Colors.gold }}><Text style={{ fontSize: 24 }}>👥</Text><Text style={{ color: Colors.gold, fontSize: 12 }}>REFER</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AI')} style={{ backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5, borderWidth: 1, borderColor: Colors.gold }}><Text style={{ fontSize: 24 }}>✨</Text><Text style={{ color: Colors.gold, fontSize: 12 }}>AI</Text></TouchableOpacity>
      </View>
      <View style={{ backgroundColor: Colors.cardBackground, borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: Colors.gold }}>
        <Text style={{ color: Colors.gold, fontSize: 14, textAlign: 'center' }}>YOUR QR CODE</Text>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <View style={{ width: 120, height: 120, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
            <Text style={{ color: Colors.gold, fontSize: 12 }}>📱 QR CODE</Text>
            <Text style={{ color: Colors.textMuted, fontSize: 10, marginTop: 5 }}>ID: {userData.id}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={addStamp} style={{ backgroundColor: Colors.gold, padding: 15, borderRadius: 40, alignItems: 'center', marginBottom: 20 }}><Text style={{ color: Colors.background, fontWeight: 'bold' }}>➕ ADD STAMP (After Service)</Text></TouchableOpacity>
    </ScrollView>
  );
};

// ========== SERVICES SCREEN ==========
const ServicesScreen = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const services = [
    { id: 1, name: 'Classic Cut', price: 349, category: 'haircut' },
    { id: 2, name: 'Wolf Cut', price: 699, category: 'haircut' },
    { id: 3, name: 'Mullet Cut', price: 599, category: 'haircut' },
    { id: 4, name: 'Bullet Cut', price: 549, category: 'haircut' },
    { id: 5, name: 'Premium Textured Cut', price: 799, category: 'haircut' },
    { id: 6, name: 'Fade + Design', price: 649, category: 'haircut' },
    { id: 7, name: 'Classic Shave', price: 249, category: 'beard' },
    { id: 8, name: 'Trimming + Shape', price: 299, category: 'beard' },
    { id: 9, name: 'Italian Beard Styling', price: 399, category: 'beard' },
    { id: 10, name: 'Royal Italian Beard', price: 499, category: 'beard' },
    { id: 11, name: 'Premium Shave (Hot Towel)', price: 449, category: 'beard' },
    { id: 12, name: 'Black Polish', price: 1599, category: 'polish' },
    { id: 13, name: 'Brown Polish', price: 1599, category: 'polish' },
    { id: 14, name: 'Elitek Color', price: 499, category: 'polish' },
    { id: 15, name: 'Protein Treatment (Short)', price: 2999, category: 'protein' },
    { id: 16, name: 'Protein Treatment (Long)', price: 5999, category: 'protein' },
    { id: 17, name: 'Keratin Smoothing (Short)', price: 10999, category: 'keratin' },
    { id: 18, name: 'Keratin Smoothing (Long)', price: 25999, category: 'keratin' },
    { id: 19, name: 'Manicure', price: 1899, category: 'mani' },
    { id: 20, name: 'Pedicure', price: 2499, category: 'pedi' },
    { id: 21, name: 'Combo Mani+Pedi', price: 3999, category: 'combo' },
    { id: 22, name: 'Whitening Facial', price: 1499, category: 'facial' },
    { id: 23, name: 'Zafrani Facial', price: 1299, category: 'facial' },
    { id: 24, name: '7 Shine Facial', price: 1099, category: 'facial' },
    { id: 25, name: 'Herbal Facial', price: 1699, category: 'facial' },
    { id: 26, name: 'Luminous Saffron Facial', price: 999, category: 'facial' },
    { id: 27, name: 'Gold Facial', price: 2099, category: 'facial' },
    { id: 28, name: 'Hydra Facial', price: 3499, category: 'facial' },
    { id: 29, name: 'Swiss Care Facial', price: 7499, category: 'facial' },
    { id: 30, name: "Johnson's Facial", price: 4999, category: 'facial' },
    { id: 31, name: 'CeraVe Facial', price: 4499, category: 'facial' },
    { id: 32, name: 'Head Massage (Hands)', price: 499, category: 'massage' },
    { id: 33, name: 'Head Massage (Machine)', price: 499, category: 'massage' },
    { id: 34, name: 'Steam (+Facial)', price: 499, category: 'addon' },
    { id: 35, name: 'Hydra Machine (+Facial)', price: 3499, category: 'addon' },
    { id: 36, name: 'Disposable Razor', price: 129, category: 'addon' },
    { id: 37, name: 'Threading', price: 299, category: 'addon' },
    { id: 38, name: 'Hairstyling', price: 399, category: 'addon' },
    { id: 39, name: 'Charcoal Mask', price: 299, category: 'addon' },
    { id: 40, name: 'Nose Strip', price: 149, category: 'addon' },
    { id: 41, name: 'Legs Waxing', price: 1699, category: 'waxing' },
    { id: 42, name: 'Arms Waxing', price: 1199, category: 'waxing' },
    { id: 43, name: 'Face Waxing', price: 899, category: 'waxing' },
  ];

  const categories = [
    { id: 'all', name: 'ALL', icon: '📋' },
    { id: 'haircut', name: 'HAIR', icon: '💇' },
    { id: 'beard', name: 'BEARD', icon: '🧔' },
    { id: 'facial', name: 'FACIAL', icon: '🌸' },
    { id: 'massage', name: 'MASSAGE', icon: '💆' },
    { id: 'addon', name: 'ADD-ONS', icon: '⚙️' },
  ];

  const filteredServices = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory);

  const addToPackage = (service) => { setSelectedServices([...selectedServices, service]); };
  const removeFromPackage = (id) => { setSelectedServices(selectedServices.filter(s => s.id !== id)); };
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const discount = subtotal * 0.2;
  const total = subtotal - discount;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView>
        <Text style={{ color: Colors.gold, fontSize: 24, textAlign: 'center', marginVertical: 20 }}>✨ OUR SERVICES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 15, paddingLeft: 20 }}>
          {categories.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => setActiveCategory(cat.id)} style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: activeCategory === cat.id ? Colors.gold : Colors.cardBackground, marginRight: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.gold }}>
              <Text style={{ fontSize: 16, marginRight: 5 }}>{cat.icon}</Text>
              <Text style={{ color: activeCategory === cat.id ? Colors.background : Colors.gold }}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filteredServices.map(service => (
          <TouchableOpacity key={service.id} onPress={() => addToPackage(service)} style={{ backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 10, marginBottom: 10, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.gold }}>
            <View><Text style={{ color: 'white' }}>{service.name}</Text><Text style={{ color: Colors.gold }}>₨{service.price}</Text></View>
            <Text style={{ color: Colors.gold, fontSize: 24 }}>+</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedServices.length > 0 && (
        <TouchableOpacity onPress={() => setShowPackageBuilder(true)} style={{ position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 40, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 2, borderColor: Colors.gold }}>
          <Text style={{ color: Colors.gold }}>{selectedServices.length} services selected</Text>
          <Text style={{ color: Colors.gold, fontWeight: 'bold' }}>₨{Math.round(total)}</Text>
          <Text style={{ color: Colors.success }}>20% OFF</Text>
        </TouchableOpacity>
      )}
      <Modal visible={showPackageBuilder} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20, justifyContent: 'center' }}>
          <Text style={{ color: Colors.gold, fontSize: 24, textAlign: 'center', marginBottom: 20 }}>📦 YOUR CUSTOM PACKAGE</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {selectedServices.map(s => (
              <View key={s.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: Colors.cardBackground, marginBottom: 5, borderRadius: 8 }}>
                <Text style={{ color: 'white', flex: 1 }}>{s.name}</Text>
                <Text style={{ color: Colors.gold, marginHorizontal: 10 }}>₨{s.price}</Text>
                <TouchableOpacity onPress={() => removeFromPackage(s.id)}><Text style={{ color: Colors.error, fontSize: 16 }}>✖</Text></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={{ marginTop: 20, padding: 15, backgroundColor: Colors.cardBackground, borderRadius: 10 }}>
            <Text style={{ color: 'white' }}>Subtotal: ₨{subtotal}</Text>
            <Text style={{ color: Colors.gold }}>Discount (20%): -₨{Math.round(discount)}</Text>
            <Text style={{ color: Colors.gold, fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>TOTAL: ₨{Math.round(total)}</Text>
          </View>
          <TouchableOpacity onPress={() => { Alert.alert('Package Saved', 'Show this package to our staff'); setShowPackageBuilder(false); }} style={{ backgroundColor: Colors.gold, padding: 15, borderRadius: 40, alignItems: 'center', marginTop: 20 }}><Text style={{ color: Colors.background, fontWeight: 'bold' }}>✅ USE THIS PACKAGE</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPackageBuilder(false)}><Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 20 }}>Close</Text></TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

// ========== AI SCREEN ==========
const AIScreen = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [conversation, setConversation] = useState([]);

  const getAnswer = (q) => {
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes('history')) return "The word 'salon' comes from French meaning 'large room' (1664). First barbers in ancient Egypt (5000 BC). The barber pole's red represents blood, white represents bandages, blue represents veins.";
    if (lowerQ.includes('service')) return "We offer 54+ services including haircuts (₨349-₨799), beard (₨249-₨499), facials (₨999-₨7499), massages (₨499), protein treatments (₨2999-₨5999), keratin smoothing (₨10999-₨25999).";
    if (lowerQ.includes('hour')) return "Open 8:00 AM to 9:00 PM, 7 days a week. Closed only on 9th and 10th Muharram.";
    if (lowerQ.includes('location')) return "Shop street 18, Mehar Fiaz Colony Bb, Lahore, 54000, Pakistan";
    if (lowerQ.includes('phone')) return "0301 5092782 or 0335 2279567";
    if (lowerQ.includes('stamp')) return "Earn 1 stamp per visit. 10 stamps = FREE service! Birthday month gives double stamps. Refer friends for bonus stamps.";
    if (lowerQ.includes('streak')) return "2 weeks = 50 pts, 4 weeks = 100 pts + 1 stamp, 6 weeks = 200 pts + 2 stamps, 10 weeks = FREE SERVICE!";
    if (lowerQ.includes('refer')) return "Refer a friend using your code. When they visit, you get +2 stamps and +200 points!";
    return "Thank you for asking! Please visit our services page or call 0301 5092782 for assistance.";
  };

  const handleAsk = () => {
    if (!question.trim()) return;
    const response = getAnswer(question);
    setAnswer(response);
    setConversation(prev => [...prev, { question, answer: response }]);
    setQuestion('');
  };

  const suggestedQuestions = ['What services?', 'Tell me the history', 'How do stamps work?', 'What are your hours?', 'Where are you located?', 'How does streak work?'];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Text style={{ color: Colors.gold, fontSize: 24, textAlign: 'center', marginTop: 20, marginBottom: 10 }}>✨ AI SALON ASSISTANT</Text>
      <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>Ask me anything about The Gents Studio & Spa</Text>
      <ScrollView style={{ flex: 1, paddingHorizontal: 15 }}>
        {conversation.map((item, index) => (
          <View key={index} style={{ marginBottom: 15 }}>
            <View style={{ alignSelf: 'flex-end', backgroundColor: Colors.cardBackground, padding: 12, borderRadius: 20, maxWidth: '85%', marginBottom: 5 }}>
              <Text style={{ color: Colors.gold }}>👤 {item.question}</Text>
            </View>
            <View style={{ alignSelf: 'flex-start', backgroundColor: Colors.cardBackground, padding: 12, borderRadius: 20, maxWidth: '85%', borderLeftWidth: 3, borderLeftColor: Colors.gold }}>
              <Text style={{ color: 'white' }}>✨ {item.answer}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 10 }}>
        {suggestedQuestions.map((q, index) => (
          <TouchableOpacity key={index} onPress={() => setQuestion(q)} style={{ backgroundColor: Colors.cardBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: Colors.gold }}>
            <Text style={{ color: Colors.gold }}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: Colors.border }}>
        <TextInput style={{ flex: 1, backgroundColor: Colors.cardBackground, color: 'white', padding: 12, borderRadius: 25 }} placeholder="Type your question..." placeholderTextColor={Colors.textMuted} value={question} onChangeText={setQuestion} />
        <TouchableOpacity onPress={handleAsk} style={{ backgroundColor: Colors.gold, width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}><Text style={{ fontSize: 20 }}>✨</Text></TouchableOpacity>
      </View>
    </View>
  );
};

// ========== LEADERBOARD SCREEN ==========
const LeaderboardScreen = () => {
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'Usman Ali', points: 2850, streak: 12, visits: 24, rank: 1, isVIP: true },
    { id: 2, name: 'Bilal Khan', points: 2100, streak: 8, visits: 18, rank: 2, isVIP: false },
    { id: 3, name: 'Hamza Ahmed', points: 1750, streak: 6, visits: 15, rank: 3, isVIP: false },
    { id: 4, name: 'Farhan Raza', points: 1420, streak: 5, visits: 12, rank: 4, isVIP: false },
    { id: 5, name: 'Zain Malik', points: 1180, streak: 4, visits: 10, rank: 5, isVIP: false },
    { id: 6, name: 'Omar Farooq', points: 950, streak: 3, visits: 8, rank: 6, isVIP: false },
    { id: 7, name: 'Ali Raza', points: 820, streak: 3, visits: 7, rank: 7, isVIP: false },
    { id: 8, name: 'Hassan Tariq', points: 710, streak: 2, visits: 6, rank: 8, isVIP: false },
    { id: 9, name: 'Saad Ahmed', points: 620, streak: 2, visits: 5, rank: 9, isVIP: false },
    { id: 10, name: 'Imran Ali', points: 550, streak: 1, visits: 5, rank: 10, isVIP: false },
  ]);

  const [timeFrame, setTimeFrame] = useState('month');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
      <Text style={{ color: Colors.gold, fontSize: 28, textAlign: 'center', marginBottom: 20, marginTop: 20 }}>🏆 LEADERBOARD</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 }}>
        <TouchableOpacity onPress={() => setTimeFrame('week')} style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: timeFrame === 'week' ? Colors.gold : Colors.cardBackground }}><Text style={{ color: timeFrame === 'week' ? Colors.background : Colors.textSecondary }}>THIS WEEK</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTimeFrame('month')} style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: timeFrame === 'month' ? Colors.gold : Colors.cardBackground }}><Text style={{ color: timeFrame === 'month' ? Colors.background : Colors.textSecondary }}>THIS MONTH</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setTimeFrame('all')} style={{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: timeFrame === 'all' ? Colors.gold : Colors.cardBackground }}><Text style={{ color: timeFrame === 'all' ? Colors.background : Colors.textSecondary }}>ALL TIME</Text></TouchableOpacity>
      </View>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: item.rank === 1 ? 2 : 1, borderColor: item.rank === 1 ? Colors.gold : Colors.border }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', width: 50, color: item.rank === 1 ? Colors.gold : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : 'white' }}>{item.rank === 1 ? '👑' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}</Text>
            <Text style={{ color: 'white', flex: 1, marginLeft: 10, fontWeight: 'bold' }}>{item.name}{item.isVIP && <Text style={{ color: Colors.gold }}> 👑VIP</Text>}</Text>
            <Text style={{ color: Colors.gold }}>{item.points} pts</Text>
            <Text style={{ color: Colors.warning, marginLeft: 10 }}>🔥{item.streak}</Text>
            <Text style={{ color: Colors.textMuted, marginLeft: 10 }}>📅{item.visits}</Text>
          </View>
        )}
      />
      <View style={{ marginTop: 20, padding: 20, backgroundColor: Colors.cardBackground, borderRadius: 15, alignItems: 'center', borderWidth: 2, borderColor: Colors.gold }}>
        <Text style={{ color: Colors.textMuted, fontSize: 12 }}>YOUR RANK</Text>
        <Text style={{ color: Colors.gold, fontSize: 36, fontWeight: 'bold' }}>#15</Text>
        <Text style={{ color: 'white', fontSize: 16 }}>You</Text>
        <Text style={{ color: Colors.gold, marginTop: 5 }}>420 points</Text>
        <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 10 }}>Need 580 more points for top 10!</Text>
      </View>
    </View>
  );
};

// ========== PROFILE SCREEN ==========
const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => { const data = await AsyncStorage.getItem('userData'); if (data) setUserData(JSON.parse(data)); };

  if (!userData) return <SplashScreen />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.cardBackground, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.gold }}>
          <Text style={{ fontSize: 50 }}>👑</Text>
        </View>
        <Text style={{ color: Colors.gold, fontSize: 24, marginTop: 10 }}>{userData.name}</Text>
        <Text style={{ color: Colors.textSecondary }}>{userData.phone}</Text>
        <Text style={{ color: Colors.textSecondary }}>{userData.email}</Text>
        {userData.isVIP && <View style={{ backgroundColor: Colors.gold, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 10 }}><Text style={{ color: Colors.background, fontWeight: 'bold' }}>👑 VIP MEMBER</Text></View>}
      </View>
      <View style={{ backgroundColor: Colors.cardBackground, borderRadius: 15, padding: 20, marginTop: 20, borderWidth: 1, borderColor: Colors.gold }}>
        <Text style={{ color: Colors.gold, fontSize: 18, marginBottom: 15 }}>📊 STATISTICS</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: Colors.gold, fontSize: 28, fontWeight: 'bold' }}>{userData.stamps}</Text><Text style={{ color: Colors.textSecondary }}>Stamps</Text></View>
          <View style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: Colors.gold, fontSize: 28, fontWeight: 'bold' }}>{userData.points || 0}</Text><Text style={{ color: Colors.textSecondary }}>Points</Text></View>
          <View style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: Colors.gold, fontSize: 28, fontWeight: 'bold' }}>{userData.totalVisits || 0}</Text><Text style={{ color: Colors.textSecondary }}>Visits</Text></View>
        </View>
      </View>
      <View style={{ backgroundColor: Colors.cardBackground, borderRadius: 15, padding: 20, marginTop: 15, borderWidth: 1, borderColor: Colors.gold }}>
        <Text style={{ color: Colors.gold, fontSize: 18, marginBottom: 15 }}>🎁 REFERRAL CODE</Text>
        <Text style={{ color: Colors.textPrimary, fontSize: 16, textAlign: 'center', backgroundColor: Colors.background, padding: 10, borderRadius: 10 }}>{userData.referralCode}</Text>
        <TouchableOpacity onPress={() => Share.share({ message: `Join The Gents Studio & Spa! Use my referral code: ${userData.referralCode} and get 20% off your first visit!` })} style={{ backgroundColor: Colors.gold, padding: 12, borderRadius: 40, alignItems: 'center', marginTop: 10 }}><Text style={{ color: Colors.background, fontWeight: 'bold' }}>📤 SHARE CODE</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ========== APP NAVIGATION ==========
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => { checkLogin(); }, []);

  const checkLogin = async () => { const loggedIn = await AsyncStorage.getItem('isLoggedIn'); setIsLoggedIn(loggedIn === 'true'); setIsLoading(false); };

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.gold, headerTitleStyle: { fontWeight: 'bold' } }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Services" component={ServicesScreen} options={{ title: '✨ SERVICES' }} />
            <Stack.Screen name="AI" component={AIScreen} options={{ title: '✨ AI ASSISTANT' }} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: '🏆 LEADERBOARD' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: '👤 MY PROFILE' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;