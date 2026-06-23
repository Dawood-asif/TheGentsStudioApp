import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { BRAND } from '../constants/brand';
import { SUGGESTED_QUESTIONS } from '../data/suggestedQuestions';
import { getAssistantReply } from '../utils/aiAssistant';
import GoldButton from '../components/GoldButton';
import LuxuryScreen from '../components/LuxuryScreen';

export default function AIScreen() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Salaam Boss 👑 Ask me about services, prices, hours, location, loyalty, streaks, referrals, or packages.' }]);
  const [input, setInput] = useState('');

  const send = text => {
    const question = text || input;
    if (!question.trim()) return;
    setMessages(current => [...current, { role: 'user', text: question }, { role: 'assistant', text: getAssistantReply(question) }]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <LuxuryScreen contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(480)}>
          <Text style={styles.title}>AI Salon Assistant</Text>
          <Text style={styles.subtitle}>Voice input ready • No staff names rule enforced</Text>
        </Animated.View>
        <View style={styles.chips}>
          {SUGGESTED_QUESTIONS.map((q, index) => (
            <Animated.View key={q} entering={FadeInDown.delay(index * 40).duration(360)}>
              <Pressable onPress={() => send(q)} style={styles.chip}><Text style={styles.chipText}>{q}</Text></Pressable>
            </Animated.View>
          ))}
        </View>
        {messages.map((message, index) => (
          <Animated.View
            key={`${message.role}-${index}`}
            entering={(message.role === 'user' ? FadeInRight : FadeInLeft).duration(320)}
            style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}
          >
            <Text style={styles.bubbleText}>{message.text}</Text>
          </Animated.View>
        ))}
      </LuxuryScreen>
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Ask anything..." placeholderTextColor="#777" value={input} onChangeText={setInput} />
        <GoldButton title="Send" onPress={() => send()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.colors.black },
  content: { paddingBottom: 100 },
  title: { color: BRAND.colors.gold, fontSize: 31, fontWeight: '900', letterSpacing: 0.4 },
  subtitle: { color: BRAND.colors.muted, marginTop: 4, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: 'rgba(21,21,21,0.92)', borderColor: '#2A2415', borderWidth: 1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, shadowColor: BRAND.colors.gold, shadowOpacity: 0.1, shadowRadius: 8 },
  chipText: { color: BRAND.colors.gold, fontWeight: '800', fontSize: 12 },
  bubble: { padding: 13, borderRadius: 18, marginBottom: 10, maxWidth: '88%', shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 10, elevation: 3 },
  userBubble: { backgroundColor: '#2A2415', alignSelf: 'flex-end', borderWidth: 1, borderColor: BRAND.colors.gold },
  assistantBubble: { backgroundColor: 'rgba(21,21,21,0.95)', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#252525' },
  bubbleText: { color: BRAND.colors.white, lineHeight: 20 },
  inputRow: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, padding: 12, backgroundColor: 'rgba(5,5,5,0.97)', borderTopColor: '#2A2415', borderTopWidth: 1 },
  input: { flex: 1, backgroundColor: '#151515', color: BRAND.colors.white, borderRadius: 14, paddingHorizontal: 14, borderColor: '#252525', borderWidth: 1 },
});
