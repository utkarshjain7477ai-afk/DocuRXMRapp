import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { onboardDoctor, confirmSubscription } from '../api/client';
import styles from '../theme/styles';

const SPECIALTIES = [
  'General Physician', 'Paediatrician', 'Gynaecologist', 'Cardiologist',
  'Dermatologist', 'Orthopaedic', 'ENT', 'Neurologist', 'Diabetologist', 'Other',
];

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function OnboardScreen({ agent, onBack, onSuccess }) {
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const [focused, setFocused] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [mode, setMode] = useState('form'); // 'form' | 'success' | 'onboardNow'
  const [confirmCode, setConfirmCode] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmDone, setConfirmDone] = useState(false);

  const valid = doctorName.trim().length >= 2 && clinicName.trim().length >= 2;

  const handleSubmit = async () => {
    if (!valid) { setError('Doctor name and clinic name are required.'); return; }
    setError('');
    setLoading(true);
    try {
      const data = await onboardDoctor({
        agent_code: agent.agentCode,
        doctor_name: doctorName.trim(),
        clinic_name: clinicName.trim(),
        clinic_address: clinicAddress.trim(),
        doctor_phone: phone.trim(),
        specialty: specialty || null,
        city: city.trim(),
        notes: notes.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReferralCode(data.referral_code || '');
      setMode('success');
    } catch (e) {
      setError(e.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubscription = async () => {
    if (confirmCode.trim().length < 4) { Alert.alert('Enter the confirmation code the doctor gives you'); return; }
    setConfirmLoading(true);
    try {
      await confirmSubscription(referralCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConfirmDone(true);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not confirm. Try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const shareOnboardInstructions = () => {
    const msg = `Hi Dr. ${doctorName.trim()}!\n\nI've registered you on DocuRx — AI-powered prescription system.\n\n*Your activation code: ${referralCode}*\n\n📱 Download the app:\nhttps://expo.dev/accounts/utkarsh7477/projects/prescriva/builds\n\nOnce you download and subscribe, enter this code to activate. I'll be in touch!`;
    Linking.openURL('whatsapp://send?text=' + encodeURIComponent(msg)).catch(() =>
      Alert.alert('WhatsApp not found', 'Share the code manually with the doctor.')
    );
  };

  if (mode === 'onboardNow') {
    if (confirmDone) {
      return (
        <View style={styles.successOverlay}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={44} color="#22C55E" />
          </View>
          <Text style={styles.successTitle}>Subscription Confirmed!</Text>
          <Text style={styles.successSub}>Dr. {doctorName.trim()} is now an active DocuRx user. Commission attributed to you.</Text>
          <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 28 }]} onPress={onSuccess}>
            <Text style={styles.primaryBtnText}>Onboard Another Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { width: '100%', marginTop: 12 }]} onPress={onBack}>
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={[styles.onboardScroll, { paddingTop: 20 }]} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => setMode('success')} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="#2563EB" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Onboard Dr. {doctorName.trim()}</Text>
        <Text style={styles.screenSub}>Follow these steps to complete subscription</Text>

        {/* Referral Code */}
        <View style={{ backgroundColor: '#EFF6FF', borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'center', borderWidth: 2, borderColor: '#BFDBFE' }}>
          <Text style={{ fontSize: 11, fontFamily: 'Figtree_700Bold', color: '#64748B', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Doctor's Activation Code</Text>
          <Text style={{ fontSize: 38, fontFamily: 'Figtree_700Bold', color: '#1D4ED8', letterSpacing: 8 }}>{referralCode}</Text>
          <Text style={{ fontSize: 12, color: '#64748B', marginTop: 6, textAlign: 'center' }}>Give this code to Dr. {doctorName.trim()}</Text>
        </View>

        {/* Steps */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionHead}>How it works</Text>
          {[
            { n: '1', t: 'Share code with doctor', s: `Tell Dr. ${doctorName.trim()} their code is ${referralCode}` },
            { n: '2', t: 'Doctor downloads DocuRx', s: 'They search "DocuRx" on Play Store or you send them the link below' },
            { n: '3', t: 'Doctor subscribes in app', s: 'They enter the code and complete payment (₹2,500/mo)' },
            { n: '4', t: 'Get confirmation code', s: 'Doctor gets a 4-digit code after paying — enter it below' },
          ].map((step) => (
            <View key={step.n} style={{ flexDirection: 'row', gap: 14, marginBottom: 16 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Text style={{ color: '#fff', fontFamily: 'Figtree_700Bold', fontSize: 13 }}>{step.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginBottom: 2 }}>{step.t}</Text>
                <Text style={{ fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#64748B', lineHeight: 18 }}>{step.s}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* WhatsApp share */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: '#16A34A', marginBottom: 12 }]}
          onPress={shareOnboardInstructions}
          accessibilityRole="button"
        >
          <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Send Instructions via WhatsApp</Text>
        </TouchableOpacity>

        {/* Confirmation code entry */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionHead}>Confirm Subscription</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 12, fontFamily: 'Figtree_600SemiBold' }}>Once the doctor pays, they'll get a code. Enter it here to mark them as active.</Text>
          <TextInput
            style={[styles.input, focused === 'confirmCode' && styles.inputFocused, { letterSpacing: 4, fontSize: 20, fontFamily: 'Figtree_700Bold', textAlign: 'center' }]}
            value={confirmCode}
            onChangeText={(t) => setConfirmCode(t.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8))}
            placeholder="CODE"
            placeholderTextColor="#CBD5E1"
            autoCapitalize="characters"
            onFocus={() => setFocused('confirmCode')}
            onBlur={() => setFocused('')}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, (confirmLoading || confirmCode.trim().length < 4) && styles.primaryBtnDisabled]}
          onPress={handleConfirmSubscription}
          disabled={confirmLoading || confirmCode.trim().length < 4}
          accessibilityRole="button"
        >
          {confirmLoading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.primaryBtnText}>Confirm Subscription</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (mode === 'success') {
    return (
      <View style={styles.successOverlay}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={44} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>Lead Saved!</Text>
        <Text style={styles.successSub}>
          Dr. {doctorName.trim()} registered under your code {agent.agentCode}.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { width: '100%', marginTop: 28 }]}
          onPress={() => setMode('onboardNow')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>Onboard Now →</Text>
        </TouchableOpacity>
        <Text style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 8, fontFamily: 'Figtree_600SemiBold' }}>Doctor subscribes in app, you confirm with their code</Text>
        <TouchableOpacity style={[styles.secondaryBtn, { width: '100%', marginTop: 14 }]} onPress={onSuccess}>
          <Text style={styles.secondaryBtnText}>Save & Onboard Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryBtn, { width: '100%', marginTop: 10 }]} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.onboardScroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="#2563EB" />
          <Text style={styles.backBtnText}>Home</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Onboard a Doctor</Text>
        <Text style={styles.screenSub}>You fill this in — the doctor doesn't need to do anything.</Text>

        <View style={styles.formCard}>
          <Text style={styles.formSectionHead}>Doctor Details</Text>

          <Field label="Doctor's Full Name *">
            <TextInput
              style={[styles.input, focused === 'docName' && styles.inputFocused]}
              value={doctorName}
              onChangeText={(t) => { setDoctorName(t); setError(''); }}
              placeholder="Dr. Sharma"
              placeholderTextColor="#CBD5E1"
              autoCapitalize="words"
              onFocus={() => setFocused('docName')}
              onBlur={() => setFocused('')}
              returnKeyType="next"
              accessibilityLabel="Doctor name"
            />
          </Field>

          <Field label="Specialisation">
            <View style={styles.specialtyRow}>
              {SPECIALTIES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.specialtyChip, specialty === s && styles.specialtyChipActive]}
                  onPress={() => setSpecialty(specialty === s ? '' : s)}
                  accessibilityRole="button"
                  accessibilityLabel={s}
                >
                  <Text style={[styles.specialtyChipText, specialty === s && styles.specialtyChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Doctor's Mobile (optional)">
            <View style={[styles.phoneRow, focused === 'phone' && styles.phoneRowFocused]}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                placeholderTextColor="#CBD5E1"
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
                returnKeyType="next"
                accessibilityLabel="Doctor phone"
              />
            </View>
          </Field>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formSectionHead}>Clinic Details</Text>

          <Field label="Clinic / Hospital Name *">
            <TextInput
              style={[styles.input, focused === 'clinic' && styles.inputFocused]}
              value={clinicName}
              onChangeText={(t) => { setClinicName(t); setError(''); }}
              placeholder="City Clinic"
              placeholderTextColor="#CBD5E1"
              autoCapitalize="words"
              onFocus={() => setFocused('clinic')}
              onBlur={() => setFocused('')}
              returnKeyType="next"
              accessibilityLabel="Clinic name"
            />
          </Field>

          <Field label="City">
            <TextInput
              style={[styles.input, focused === 'city' && styles.inputFocused]}
              value={city}
              onChangeText={setCity}
              placeholder="Mumbai"
              placeholderTextColor="#CBD5E1"
              autoCapitalize="words"
              onFocus={() => setFocused('city')}
              onBlur={() => setFocused('')}
              returnKeyType="next"
              accessibilityLabel="City"
            />
          </Field>

          <Field label="Address (optional)">
            <TextInput
              style={[styles.textArea, focused === 'addr' && styles.textAreaFocused]}
              value={clinicAddress}
              onChangeText={setClinicAddress}
              placeholder="Street, area, landmark…"
              placeholderTextColor="#CBD5E1"
              multiline
              numberOfLines={2}
              onFocus={() => setFocused('addr')}
              onBlur={() => setFocused('')}
              accessibilityLabel="Clinic address"
            />
          </Field>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formSectionHead}>Notes</Text>
          <TextInput
            style={[styles.textArea, focused === 'notes' && styles.textAreaFocused, { minHeight: 88 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Reaction to demo, interest level, follow-up needed…"
            placeholderTextColor="#CBD5E1"
            multiline
            numberOfLines={3}
            onFocus={() => setFocused('notes')}
            onBlur={() => setFocused('')}
            accessibilityLabel="Notes"
          />
        </View>

        {error ? <Text style={[styles.errorText, { paddingHorizontal: 4 }]}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryBtn, (!valid || loading) && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={!valid || loading}
          accessibilityLabel="Submit"
          accessibilityRole="button"
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.primaryBtnText}>Submit Lead</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
