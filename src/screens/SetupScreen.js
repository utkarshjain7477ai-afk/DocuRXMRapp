import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { selfRegister } from '../api/client';

export function SetupScreen({ onSetup }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = name.trim().length >= 2 && phone.trim().length === 10;

  const handleActivate = async () => {
    if (!valid) { setError('Enter your full name and 10-digit mobile number.'); return; }
    setError('');
    setLoading(true);
    try {
      const profile = await selfRegister(name.trim(), phone.trim());
      onSetup({ agentCode: profile.agent_code, name: profile.name, phone: profile.phone });
    } catch (e) {
      setError('Registration failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons name="briefcase-outline" size={36} color="#2563EB" />
          </View>
          <Text style={styles.title}>DocuRx MR</Text>
          <Text style={styles.sub}>Register once — your agent code is{'\n'}auto-generated. No approval needed.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Your Full Name</Text>
          <TextInput
            style={[styles.input, nameFocused && styles.inputFocused]}
            value={name}
            onChangeText={(t) => { setName(t); setError(''); }}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#CBD5E1"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            accessibilityLabel="Your full name"
          />

          <Text style={[styles.label, { marginTop: 20 }]}>Mobile Number</Text>
          <View style={[styles.phoneRow, phoneFocused && styles.phoneRowFocused]}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setError(''); }}
              placeholder="10-digit number"
              placeholderTextColor="#CBD5E1"
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="done"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              onSubmitEditing={handleActivate}
              accessibilityLabel="Mobile number"
            />
          </View>
          <Text style={styles.hint}>
            If you've registered before, your same code will be restored.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, (!valid || loading) && styles.btnDisabled]}
            onPress={handleActivate}
            disabled={!valid || loading}
            accessibilityLabel="Get started"
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.btnText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )
            }
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: 16, fontFamily: 'Figtree_600SemiBold' }}>DocuRx MR v1.2</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },

  hero: { alignItems: 'center', marginBottom: 32 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#EFF6FF', borderWidth: 1.5, borderColor: '#BFDBFE',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 26, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#64748B', textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  label: { fontSize: 13, fontFamily: 'Figtree_700Bold', color: '#475569', marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: '#0F172A',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  inputFocused: { borderColor: '#2563EB', backgroundColor: '#FFFFFF' },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  phoneRowFocused: { borderColor: '#2563EB', backgroundColor: '#FFFFFF' },
  prefix: { paddingHorizontal: 14, fontSize: 15, fontFamily: 'Figtree_700Bold', color: '#475569' },
  phoneInput: { flex: 1, padding: 14, paddingLeft: 0, fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: '#0F172A' },
  hint: { fontSize: 11, fontFamily: 'Figtree_600SemiBold', color: '#94A3B8', marginTop: 8 },

  error: { color: '#EF4444', fontSize: 13, fontFamily: 'Figtree_600SemiBold', marginTop: 12 },

  btn: {
    height: 54, borderRadius: 14, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center', marginTop: 24,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontSize: 16, fontFamily: 'Figtree_700Bold', color: '#FFFFFF' },
});
