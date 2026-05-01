import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { generatePrescription, structureTranscript, uploadAudio } from './api';

const MIN_MS = 1200;

// ─── States ───────────────────────────────────────────────────────────────────
const S = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing', RESULT: 'result', PRESCRIPTION: 'prescription' };

// ─── Timer display ────────────────────────────────────────────────────────────
function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Idle / Recording screen ──────────────────────────────────────────────────
function MicScreen({ state, seconds, onPress, onCancel }) {
  const isRecording = state === S.RECORDING;
  return (
    <View style={ds.centerStage}>
      <TouchableOpacity
        style={[ds.micOuter, isRecording && ds.micOuterActive]}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <View style={[ds.micInner, isRecording && ds.micInnerActive]}>
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color={isRecording ? '#EF4444' : '#2563EB'} />
        </View>
      </TouchableOpacity>
      <Text style={ds.micLabel}>{isRecording ? 'Recording… tap to stop' : 'Tap to start recording'}</Text>
      {isRecording && (
        <>
          <View style={ds.timerRow}>
            <View style={ds.timerDot} />
            <Text style={ds.timerText}>{formatTime(seconds)}</Text>
          </View>
          <TouchableOpacity style={ds.cancelBtn} onPress={onCancel} accessibilityRole="button">
            <Ionicons name="close-circle-outline" size={18} color="#94A3B8" />
            <Text style={ds.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </>
      )}
      {!isRecording && (
        <Text style={ds.micHint}>Speak a short consultation — 30 sec is enough for a demo</Text>
      )}
    </View>
  );
}

// ─── Processing screen ────────────────────────────────────────────────────────
function ProcessingScreen({ step }) {
  return (
    <View style={ds.centerStage}>
      <View style={ds.loaderOrb}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
      <Text style={ds.loaderLabel}>{step === 'transcribing' ? 'Transcribing…' : 'Building notes…'}</Text>
      <Text style={ds.loaderHint}>{step === 'transcribing' ? 'Converting speech to text' : 'Structuring clinical notes with AI'}</Text>
    </View>
  );
}

// ─── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ symptoms, diagnosis, medications, tests, transcript, onGenerate, onRetry, onDiagChange, onMedsChange, onTestsChange }) {
  const [editField, setEditField] = useState(null);
  const [localDiag, setLocalDiag] = useState(diagnosis);
  const [localMeds, setLocalMeds] = useState(medications);
  const [localTests, setLocalTests] = useState(tests);
  const [showTx, setShowTx] = useState(false);

  useEffect(() => { setLocalDiag(diagnosis); }, [diagnosis]);
  useEffect(() => { setLocalMeds(medications); }, [medications]);
  useEffect(() => { setLocalTests(tests); }, [tests]);

  return (
    <ScrollView contentContainerStyle={ds.resultScroll} showsVerticalScrollIndicator={false}>
      <Text style={ds.resultTitle}>Clinical Notes</Text>
      <Text style={ds.resultSub}>Review and edit before generating prescription</Text>

      <View style={ds.notesCard}>
        {/* Symptoms */}
        {symptoms.length > 0 && (
          <View style={ds.section}>
            <Text style={ds.sectionLabel}>SYMPTOMS</Text>
            <View style={ds.chipRow}>
              {symptoms.map((s, i) => <View key={i} style={ds.chip}><Text style={ds.chipText}>{s}</Text></View>)}
            </View>
          </View>
        )}

        {/* Diagnosis */}
        <View style={ds.section}>
          <View style={ds.sectionHead}>
            <Text style={ds.sectionLabel}>DIAGNOSIS</Text>
            {editField !== 'diag' && (
              <TouchableOpacity onPress={() => setEditField('diag')} style={ds.editBtn}>
                <Ionicons name="pencil-outline" size={13} color="#2563EB" />
                <Text style={ds.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {editField === 'diag' ? (
            <>
              <TextInput style={ds.editInput} value={localDiag} onChangeText={setLocalDiag} autoFocus multiline />
              <View style={ds.editActions}>
                <TouchableOpacity style={ds.saveBtnSm} onPress={() => { onDiagChange(localDiag); setEditField(null); }}>
                  <Text style={ds.saveBtnSmText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ds.cancelBtnSm} onPress={() => { setLocalDiag(diagnosis); setEditField(null); }}>
                  <Text style={ds.cancelBtnSmText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={ds.diagBox}><Text style={ds.diagText}>{diagnosis || '—'}</Text></View>
          )}
        </View>

        {/* Medications */}
        <View style={ds.section}>
          <View style={ds.sectionHead}>
            <Text style={ds.sectionLabel}>MEDICATIONS</Text>
            {editField !== 'meds' && (
              <TouchableOpacity onPress={() => setEditField('meds')} style={ds.editBtn}>
                <Ionicons name="pencil-outline" size={13} color="#2563EB" />
                <Text style={ds.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
          {editField === 'meds' ? (
            <>
              {localMeds.map((m, i) => (
                <View key={i} style={ds.medRow}>
                  <TextInput style={[ds.editInput, { flex: 1, marginBottom: 0 }]} value={m} onChangeText={(t) => { const a = [...localMeds]; a[i] = t; setLocalMeds(a); }} placeholder="Medication + dosage" placeholderTextColor="#94A3B8" />
                  <TouchableOpacity onPress={() => setLocalMeds(localMeds.filter((_, j) => j !== i))} style={{ padding: 6 }}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={ds.addBtn} onPress={() => setLocalMeds([...localMeds, ''])}>
                <Ionicons name="add-circle-outline" size={15} color="#2563EB" />
                <Text style={ds.addBtnText}>Add medication</Text>
              </TouchableOpacity>
              <View style={ds.editActions}>
                <TouchableOpacity style={ds.saveBtnSm} onPress={() => { onMedsChange(localMeds.filter(m => m.trim())); setEditField(null); }}>
                  <Text style={ds.saveBtnSmText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ds.cancelBtnSm} onPress={() => { setLocalMeds(medications); setEditField(null); }}>
                  <Text style={ds.cancelBtnSmText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : localMeds.length ? (
            localMeds.map((m, i) => (
              <View key={i} style={ds.bulletRow}>
                <View style={ds.bullet} />
                <Text style={ds.bulletText}>{m}</Text>
              </View>
            ))
          ) : <Text style={ds.emptyText}>Not specified</Text>}
        </View>

        {/* Tests */}
        {(localTests.length > 0 || editField === 'tests') && (
          <View style={[ds.section, { borderBottomWidth: 0 }]}>
            <View style={ds.sectionHead}>
              <Text style={ds.sectionLabel}>TESTS</Text>
              {editField !== 'tests' && (
                <TouchableOpacity onPress={() => setEditField('tests')} style={ds.editBtn}>
                  <Ionicons name="pencil-outline" size={13} color="#2563EB" />
                  <Text style={ds.editBtnText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            {editField === 'tests' ? (
              <>
                {localTests.map((t, i) => (
                  <View key={i} style={ds.medRow}>
                    <TextInput style={[ds.editInput, { flex: 1, marginBottom: 0 }]} value={t} onChangeText={(v) => { const a = [...localTests]; a[i] = v; setLocalTests(a); }} placeholder="e.g. CBC, LFT" placeholderTextColor="#94A3B8" />
                    <TouchableOpacity onPress={() => setLocalTests(localTests.filter((_, j) => j !== i))} style={{ padding: 6 }}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={ds.addBtn} onPress={() => setLocalTests([...localTests, ''])}>
                  <Ionicons name="add-circle-outline" size={15} color="#2563EB" />
                  <Text style={ds.addBtnText}>Add test</Text>
                </TouchableOpacity>
                <View style={ds.editActions}>
                  <TouchableOpacity style={ds.saveBtnSm} onPress={() => { onTestsChange(localTests.filter(t => t.trim())); setEditField(null); }}>
                    <Text style={ds.saveBtnSmText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={ds.cancelBtnSm} onPress={() => { setLocalTests(tests); setEditField(null); }}>
                    <Text style={ds.cancelBtnSmText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : localTests.map((t, i) => (
              <View key={i} style={ds.bulletRow}>
                <View style={[ds.bullet, { backgroundColor: '#0891B2' }]} />
                <Text style={ds.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Transcript toggle */}
      <Pressable style={ds.txCard} onPress={() => setShowTx(!showTx)}>
        <View style={ds.txHeader}>
          <View>
            <Text style={ds.txTitle}>Transcript</Text>
            <Text style={ds.txHint}>Original voice recording</Text>
          </View>
          <Text style={ds.txToggle}>{showTx ? 'Hide' : 'Show'}</Text>
        </View>
        {showTx && (
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200, marginTop: 10 }}>
            <Text style={ds.txText}>{transcript}</Text>
          </ScrollView>
        )}
      </Pressable>

      <TouchableOpacity style={ds.primaryBtn} onPress={onGenerate}>
        <Text style={ds.primaryBtnText}>Generate Prescription</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ds.ghostBtn} onPress={onRetry}>
        <Text style={ds.ghostBtnText}>Record Again</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Prescription screen ───────────────────────────────────────────────────────
function PrescriptionScreen({ text, onRetry, onOnboard, onBack }) {
  const sections = [];
  const lines = text.split('\n');
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[A-Z][A-Z\s\/]+:?\s*$/.test(trimmed)) {
      current = { heading: trimmed.replace(/:$/, ''), items: [] };
      sections.push(current);
    } else if (current) {
      current.items.push(trimmed.replace(/^[-•]\s*/, ''));
    } else {
      sections.push({ heading: null, items: [trimmed] });
    }
  }

  return (
    <ScrollView contentContainerStyle={ds.rxScroll} showsVerticalScrollIndicator={false}>
      <View style={ds.rxHeader}>
        <Ionicons name="document-text" size={22} color="#2563EB" />
        <Text style={ds.rxTitle}>Prescription</Text>
        <View style={ds.demoBadge}><Text style={ds.demoBadgeText}>DEMO</Text></View>
      </View>

      <View style={ds.rxCard}>
        {sections.length > 0 ? sections.map((sec, i) => (
          <View key={i} style={[ds.rxSection, i === sections.length - 1 && { borderBottomWidth: 0 }]}>
            {sec.heading && <Text style={ds.rxSectionHead}>{sec.heading}</Text>}
            {sec.items.map((item, j) => (
              <View key={j} style={ds.rxItemRow}>
                <View style={ds.rxDot} />
                <Text style={ds.rxItem}>{item}</Text>
              </View>
            ))}
          </View>
        )) : (
          <Text style={ds.rxRaw}>{text}</Text>
        )}
      </View>

      <View style={ds.onboardBanner}>
        <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={ds.onboardBannerTitle}>Doctor impressed?</Text>
          <Text style={ds.onboardBannerSub}>Register them now — takes 30 seconds.</Text>
        </View>
      </View>

      <TouchableOpacity style={ds.onboardBtn} onPress={onOnboard}>
        <Ionicons name="person-add-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={ds.onboardBtnText}>Onboard This Doctor</Text>
      </TouchableOpacity>

      <TouchableOpacity style={ds.ghostBtn} onPress={onRetry}>
        <Text style={ds.ghostBtnText}>Run Demo Again</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[ds.ghostBtn, { marginTop: 4 }]} onPress={onBack}>
        <Text style={ds.ghostBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main DemoApp ─────────────────────────────────────────────────────────────
export function DemoApp({ onOnboard, onBack }) {
  const [state, setState] = useState(S.IDLE);
  const [step, setStep] = useState('transcribing');
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([]);
  const [tests, setTests] = useState([]);
  const [prescription, setPrescription] = useState('');
  const [error, setError] = useState('');

  const recRef = useRef(null);
  const startedAt = useRef(0);
  const timerRef = useRef(null);
  const inFlight = useRef(false);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (recRef.current) {
      recRef.current.stopAndUnloadAsync().catch(() => {});
    }
  }, []);

  const reset = () => {
    setState(S.IDLE);
    setSeconds(0);
    setTranscript('');
    setSymptoms([]);
    setDiagnosis('');
    setMedications([]);
    setTests([]);
    setPrescription('');
    setError('');
  };

  const handleMicPress = async () => {
    if (inFlight.current) return;
    if (state === S.IDLE) {
      inFlight.current = true;
      try {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) { Alert.alert('Permission required', 'Microphone access is needed.'); return; }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        recRef.current = recording;
        startedAt.current = Date.now();
        setSeconds(0);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        setState(S.RECORDING);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        inFlight.current = false;
      }
    } else if (state === S.RECORDING) {
      await stopAndProcess();
    }
  };

  const stopAndProcess = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    clearInterval(timerRef.current);

    const elapsed = Date.now() - startedAt.current;
    const rec = recRef.current;
    recRef.current = null;

    let fileUri = null;
    try { fileUri = rec?.getURI(); } catch (_) {}
    try { await rec?.stopAndUnloadAsync(); } catch (_) {}
    try { await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }); } catch (_) {}

    if (elapsed < MIN_MS) {
      if (fileUri) FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
      Alert.alert('Too short', 'Hold the mic a bit longer before stopping.');
      setState(S.IDLE);
      inFlight.current = false;
      return;
    }

    setState(S.PROCESSING);
    setStep('transcribing');

    try {
      const tx = await uploadAudio(fileUri, 'en');
      setTranscript(tx);
      setStep('structuring');
      const structured = await structureTranscript(tx, 'english');
      setSymptoms(structured.symptoms || []);
      setDiagnosis(structured.diagnosis || '');
      setMedications(structured.medications || []);
      setTests(structured.tests || []);
      setState(S.RESULT);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
      setState(S.IDLE);
      Alert.alert('Error', e.message || 'Transcription failed. Check your connection and try again.');
    } finally {
      if (fileUri) FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
      inFlight.current = false;
    }
  };

  const handleCancel = async () => {
    clearInterval(timerRef.current);
    const rec = recRef.current;
    recRef.current = null;
    try {
      const uri = rec?.getURI();
      await rec?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      if (uri) FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
    } catch (_) {}
    setState(S.IDLE);
    setSeconds(0);
    inFlight.current = false;
  };

  const handleGenerate = async () => {
    setState(S.PROCESSING);
    setStep('generating');
    try {
      const rx = await generatePrescription({ transcript, symptoms, diagnosis, medications, tests });
      setPrescription(rx);
      setState(S.PRESCRIPTION);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to generate prescription.');
      setState(S.RESULT);
    }
  };

  if (state === S.IDLE || state === S.RECORDING) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={ds.backRow} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="#2563EB" />
          <Text style={ds.backRowText}>Home</Text>
        </TouchableOpacity>
        <View style={ds.demoLabel}>
          <Ionicons name="play-circle-outline" size={14} color="#2563EB" />
          <Text style={ds.demoLabelText}>LIVE DEMO — Real AI transcription</Text>
        </View>
        <MicScreen state={state} seconds={seconds} onPress={handleMicPress} onCancel={handleCancel} />
      </View>
    );
  }

  if (state === S.PROCESSING) {
    return (
      <View style={{ flex: 1 }}>
        <View style={ds.demoLabel}>
          <Ionicons name="play-circle-outline" size={14} color="#2563EB" />
          <Text style={ds.demoLabelText}>LIVE DEMO — Real AI transcription</Text>
        </View>
        <ProcessingScreen step={step} />
      </View>
    );
  }

  if (state === S.RESULT) {
    return (
      <View style={{ flex: 1 }}>
        <View style={ds.demoLabel}>
          <Ionicons name="play-circle-outline" size={14} color="#2563EB" />
          <Text style={ds.demoLabelText}>LIVE DEMO — Real AI transcription</Text>
        </View>
        <ResultScreen
          symptoms={symptoms}
          diagnosis={diagnosis}
          medications={medications}
          tests={tests}
          transcript={transcript}
          onGenerate={handleGenerate}
          onRetry={reset}
          onDiagChange={setDiagnosis}
          onMedsChange={setMedications}
          onTestsChange={setTests}
        />
      </View>
    );
  }

  if (state === S.PRESCRIPTION) {
    return (
      <View style={{ flex: 1 }}>
        <PrescriptionScreen
          text={prescription}
          onRetry={reset}
          onOnboard={onOnboard}
          onBack={onBack}
        />
      </View>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ds = StyleSheet.create({
  // Back nav
  backRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 6 },
  backRowText: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: '#2563EB' },

  // Demo badge
  demoLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingBottom: 8 },
  demoLabelText: { fontSize: 11, fontFamily: 'Figtree_700Bold', color: '#2563EB', letterSpacing: 0.5 },

  // Mic screen
  centerStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  micOuter: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#EFF6FF', borderWidth: 2, borderColor: '#BFDBFE',
    alignItems: 'center', justifyContent: 'center',
  },
  micOuterActive: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  micInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
  },
  micInnerActive: { backgroundColor: '#FEE2E2' },
  micLabel: { fontSize: 17, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginTop: 28, textAlign: 'center' },
  micHint: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#94A3B8', marginTop: 10, textAlign: 'center', lineHeight: 18 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 6 },
  timerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  timerText: { fontSize: 20, fontFamily: 'Figtree_700Bold', color: '#EF4444' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 5, padding: 10 },
  cancelBtnText: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#94A3B8' },

  // Processing
  loaderOrb: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#EFF6FF', borderWidth: 2, borderColor: '#BFDBFE',
    alignItems: 'center', justifyContent: 'center',
  },
  loaderLabel: { fontSize: 18, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginTop: 24 },
  loaderHint: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#64748B', marginTop: 6 },

  // Result
  resultScroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  resultTitle: { fontSize: 20, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginBottom: 2 },
  resultSub: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#64748B', marginBottom: 16 },
  notesCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionLabel: { fontSize: 10, fontFamily: 'Figtree_700Bold', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  editBtnText: { fontSize: 12, fontFamily: 'Figtree_700Bold', color: '#2563EB' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#2563EB' },
  diagBox: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 10 },
  diagText: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#0F172A', lineHeight: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563EB', marginTop: 6, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#0F172A', lineHeight: 20 },
  emptyText: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#CBD5E1' },
  editInput: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 8,
    padding: 10, fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#0F172A',
    backgroundColor: '#F8FAFC', marginBottom: 8,
  },
  medRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtnSm: { flex: 1, height: 36, borderRadius: 8, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  saveBtnSmText: { fontSize: 13, fontFamily: 'Figtree_700Bold', color: '#FFFFFF' },
  cancelBtnSm: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  cancelBtnSmText: { fontSize: 13, fontFamily: 'Figtree_700Bold', color: '#64748B' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  addBtnText: { fontSize: 13, fontFamily: 'Figtree_700Bold', color: '#2563EB' },
  txCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, marginBottom: 16 },
  txHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txTitle: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: '#0F172A' },
  txHint: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: '#94A3B8' },
  txToggle: { fontSize: 13, fontFamily: 'Figtree_700Bold', color: '#2563EB' },
  txText: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#475569', lineHeight: 20 },

  // Prescription
  rxScroll: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  rxHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  rxTitle: { fontSize: 20, fontFamily: 'Figtree_700Bold', color: '#0F172A', flex: 1 },
  demoBadge: { backgroundColor: '#FEF9C3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  demoBadgeText: { fontSize: 10, fontFamily: 'Figtree_700Bold', color: '#854D0E' },
  rxCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  rxSection: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rxSectionHead: { fontSize: 10, fontFamily: 'Figtree_700Bold', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  rxItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  rxDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2563EB', marginTop: 7, marginRight: 8 },
  rxItem: { flex: 1, fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#1E293B', lineHeight: 20 },
  rxRaw: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#1E293B', lineHeight: 22, padding: 14 },

  // Onboard CTA
  onboardBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0FDF4', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0',
    padding: 14, marginBottom: 12,
  },
  onboardBannerTitle: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: '#15803D' },
  onboardBannerSub: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: '#4ADE80', marginTop: 1 },
  onboardBtn: {
    height: 52, borderRadius: 12, backgroundColor: '#2563EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  onboardBtnText: { fontSize: 15, fontFamily: 'Figtree_700Bold', color: '#FFFFFF' },

  // Shared buttons
  primaryBtn: {
    height: 52, borderRadius: 12, backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  primaryBtnText: { fontSize: 15, fontFamily: 'Figtree_700Bold', color: '#FFFFFF' },
  ghostBtn: {
    height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  ghostBtnText: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: '#64748B' },
});
