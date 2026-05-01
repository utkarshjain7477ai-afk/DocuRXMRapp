import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from '../theme/styles';

const SLIDES = [
  {
    icon: 'mic-outline',
    color: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'One tap to start notes',
    body: 'Doctor taps the mic, speaks naturally during the consultation — no typing, no distraction from the patient.',
  },
  {
    icon: 'document-text-outline',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'AI structures the notes',
    body: 'DocuRx automatically extracts diagnosis, medications, dosage, and next visit — formatted as a clean prescription.',
  },
  {
    icon: 'qr-code-outline',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    title: 'Patient gets a QR code',
    body: 'A unique QR is generated instantly. Patient scans it to view their prescription in English or Hindi — no app download needed.',
  },
  {
    icon: 'phone-portrait-outline',
    color: '#FDF4FF',
    iconColor: '#9333EA',
    title: 'Patient app (optional)',
    body: 'Patients can install the DocuRx Health app to track all prescriptions, set medication reminders, and share reports.',
  },
  {
    icon: 'shield-checkmark-outline',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'Secure & private',
    body: 'All data is encrypted. Doctors keep full control. No patient data is sold or shared. DPDP-compliant design.',
  },
  {
    icon: 'rocket-outline',
    color: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'Free to start',
    body: 'DocuRx is free during early access. Doctors who sign up now lock in the founding-member rate — forever.',
  },
];

export function DemoScreen({ onBack }) {
  const [slide, setSlide] = useState(0);

  const prev = () => setSlide((s) => Math.max(0, s - 1));
  const next = () => setSlide((s) => Math.min(SLIDES.length - 1, s + 1));

  const current = SLIDES[slide];
  const isFirst = slide === 0;
  const isLast = slide === SLIDES.length - 1;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="#2563EB" />
          <Text style={styles.backBtnText}>Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.demoScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.slideContainer}>
          <View style={[styles.slideIllustration, { backgroundColor: current.color }]}>
            <Ionicons name={current.icon} size={48} color={current.iconColor} />
          </View>
          <Text style={styles.slideTitle}>{current.title}</Text>
          <Text style={styles.slideBody}>{current.body}</Text>
        </View>
      </ScrollView>

      <View style={styles.slideNav}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnGhost, isFirst && { opacity: 0.3 }]}
          onPress={prev}
          disabled={isFirst}
          accessibilityLabel="Previous slide"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={16} color="#64748B" />
          <Text style={styles.navBtnTextGhost}>Back</Text>
        </TouchableOpacity>

        <View style={styles.slideIndicators}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.slideDot, i === slide && styles.slideDotActive]} />
          ))}
        </View>

        {isLast ? (
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary]}
            onPress={onBack}
            accessibilityLabel="Done"
            accessibilityRole="button"
          >
            <Text style={styles.navBtnText}>Done</Text>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrimary]}
            onPress={next}
            accessibilityLabel="Next slide"
            accessibilityRole="button"
          >
            <Text style={styles.navBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
