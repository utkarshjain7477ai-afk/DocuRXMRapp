import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { onboardDoctor } from '../api/client';
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

  const valid = doctorName.trim().length >= 2 && clinicName.trim().length >= 2;

  const handleSubmit = async () => {
    if (!valid) { setError('Doctor name and clinic name are required.'); return; }
    setError('');
    setLoading(true);
    try {
      await onboardDoctor({
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
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successOverlay}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={44} color="#22C55E" />
        </View>
        <Text style={styles.successTitle}>Doctor Onboarded!</Text>
        <Text style={styles.successSub}>
          Dr. {doctorName} has been logged under your agent code {agent.agentCode}.
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { width: '100%', marginTop: 28 }]} onPress={onSuccess}>
          <Text style={styles.primaryBtnText}>Onboard Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryBtn, { width: '100%', marginTop: 12 }]} onPress={onBack}>
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
