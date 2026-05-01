import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { verifyAgent } from '../api/client';
import styles from '../theme/styles';

export function SetupScreen({ onSetup }) {
  const [agentCode, setAgentCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [codeFocused, setCodeFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = agentCode.trim().length >= 4 && name.trim().length >= 2 && phone.trim().length === 10;

  const handleActivate = async () => {
    if (!valid) { setError('Fill in all fields correctly.'); return; }
    setError('');
    setLoading(true);
    try {
      await verifyAgent(agentCode.trim().toUpperCase());
      onSetup({ agentCode: agentCode.trim().toUpperCase(), name: name.trim(), phone: phone.trim() });
    } catch (e) {
      setError('Agent code not recognised. Check with your manager.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.setupScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.setupHero}>
          <View style={styles.setupIconWrap}>
            <Ionicons name="briefcase-outline" size={36} color="#2563EB" />
          </View>
          <Text style={styles.setupTitle}>DocuRx MR</Text>
          <Text style={styles.setupSub}>
            Enter your agent code to activate{'\n'}this device as your field tool.
          </Text>
        </View>

        <View style={styles.setupCard}>
          <Text style={styles.fieldLabel}>Agent Code</Text>
          <TextInput
            style={[styles.agentCodeInput, codeFocused && styles.agentCodeInputFocused]}
            value={agentCode}
            onChangeText={(t) => { setAgentCode(t.toUpperCase().replace(/[^A-Z0-9]/g, '')); setError(''); }}
            placeholder="MR0001"
            placeholderTextColor="#CBD5E1"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            onFocus={() => setCodeFocused(true)}
            onBlur={() => setCodeFocused(false)}
            returnKeyType="next"
            accessibilityLabel="Agent code"
          />
          <Text style={styles.inputHint}>Issued by your manager — 4–10 characters</Text>

          <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Your Full Name</Text>
          <TextInput
            style={[styles.input, nameFocused && styles.inputFocused]}
            value={name}
            onChangeText={(t) => { setName(t); setError(''); }}
            placeholder="Your name"
            placeholderTextColor="#CBD5E1"
            autoCapitalize="words"
            autoCorrect={false}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            returnKeyType="next"
            accessibilityLabel="Your name"
          />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Mobile Number</Text>
          <View style={[styles.phoneRow, phoneFocused && styles.phoneRowFocused]}>
            <Text style={styles.phonePrefix}>+91</Text>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setError(''); }}
              placeholder="10-digit number"
              placeholderTextColor="#CBD5E1"
              keyboardType="phone-pad"
              maxLength={10}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              onSubmitEditing={handleActivate}
              returnKeyType="done"
              accessibilityLabel="Mobile number"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryBtn, (!valid || loading) && styles.primaryBtnDisabled]}
            onPress={handleActivate}
            disabled={!valid || loading}
            accessibilityLabel="Activate"
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.primaryBtnText}>Activate Device</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
