import { StyleSheet } from 'react-native';

const blue = '#2563EB';
const blueDark = '#1D4ED8';
const bluePale = '#EFF6FF';
const slate = '#64748B';
const slateLight = '#94A3B8';
const border = '#E2E8F0';
const white = '#FFFFFF';
const red = '#EF4444';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: white },
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: white, borderBottomWidth: 1, borderBottomColor: border,
  },
  headerBrand: { fontSize: 17, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginRight: 4 },
  headerBadge: {
    backgroundColor: bluePale, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
  },
  headerBadgeText: { fontSize: 11, fontFamily: 'Figtree_600SemiBold', color: blue },

  // Setup screen
  setupScroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  setupHero: { alignItems: 'center', paddingTop: 48, paddingBottom: 32 },
  setupIconWrap: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: bluePale,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  setupTitle: { fontSize: 24, fontFamily: 'Figtree_700Bold', color: '#0F172A', textAlign: 'center' },
  setupSub: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: slate, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  setupCard: {
    backgroundColor: white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  fieldLabel: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: '#475569', marginBottom: 6 },
  input: {
    height: 48, borderRadius: 10, borderWidth: 1.5, borderColor: border,
    paddingHorizontal: 14, fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: '#0F172A',
    backgroundColor: '#FAFAFA',
  },
  inputFocused: { borderColor: blue, backgroundColor: white },
  agentCodeInput: {
    height: 56, borderRadius: 10, borderWidth: 1.5, borderColor: border,
    paddingHorizontal: 16, fontSize: 20, fontFamily: 'Figtree_700Bold', color: '#0F172A',
    backgroundColor: '#FAFAFA', letterSpacing: 3, textAlign: 'center',
  },
  agentCodeInputFocused: { borderColor: blue, backgroundColor: white },
  inputHint: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: slateLight, marginTop: 5 },

  // Buttons
  primaryBtn: {
    height: 52, borderRadius: 12, backgroundColor: blue,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  primaryBtnDisabled: { backgroundColor: '#BFDBFE' },
  primaryBtnText: { fontSize: 15, fontFamily: 'Figtree_700Bold', color: white },
  secondaryBtn: {
    height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: blue,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontFamily: 'Figtree_700Bold', color: blue },

  // Error
  errorText: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: red, marginTop: 8 },

  // Home screen
  homeScroll: { flexGrow: 1, paddingBottom: 40 },
  agentStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: white, paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: border,
  },
  agentAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: bluePale,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  agentAvatarText: { fontSize: 16, fontFamily: 'Figtree_700Bold', color: blue },
  agentName: { fontSize: 15, fontFamily: 'Figtree_700Bold', color: '#0F172A' },
  agentCodeBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  agentCodeText: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: slate },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: border, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  statNum: { fontSize: 28, fontFamily: 'Figtree_700Bold', color: blue },
  statLabel: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: slate, marginTop: 4, textAlign: 'center' },

  actionGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  actionCard: {
    flex: 1, backgroundColor: white, borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: border, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  actionCardPrimary: { backgroundColor: blue, borderColor: blue },
  actionCardIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: bluePale,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionCardIconPrimary: { backgroundColor: 'rgba(255,255,255,0.2)' },
  actionCardLabel: { fontSize: 13, fontFamily: 'Figtree_700Bold', color: '#0F172A', textAlign: 'center' },
  actionCardLabelPrimary: { color: white },
  actionCardSub: { fontSize: 11, fontFamily: 'Figtree_600SemiBold', color: slate, textAlign: 'center', marginTop: 2 },
  actionCardSubPrimary: { color: 'rgba(255,255,255,0.75)' },

  sectionLabel: { fontSize: 11, fontFamily: 'Figtree_700Bold', color: slateLight, letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },

  recentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: white, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: border,
  },
  recentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 12 },
  recentName: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: '#0F172A' },
  recentMeta: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: slate, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontFamily: 'Figtree_700Bold', color: '#0F172A', marginTop: 12 },
  emptySub: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: slate, textAlign: 'center', marginTop: 6, lineHeight: 20 },

  // Onboard screen
  onboardScroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 20, fontFamily: 'Figtree_700Bold', color: '#0F172A', paddingTop: 20, marginBottom: 4 },
  screenSub: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: slate, marginBottom: 20, lineHeight: 18 },
  formCard: {
    backgroundColor: white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
    marginBottom: 16,
  },
  formSectionHead: { fontSize: 12, fontFamily: 'Figtree_700Bold', color: blue, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 14 },
  phoneRow: {
    height: 48, flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1.5, borderColor: border, backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  phoneRowFocused: { borderColor: blue, backgroundColor: white },
  phonePrefix: { paddingHorizontal: 12, fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: slate, borderRightWidth: 1, borderRightColor: border },
  phoneInput: { flex: 1, paddingHorizontal: 12, fontSize: 15, fontFamily: 'Figtree_600SemiBold', color: '#0F172A' },
  textArea: {
    minHeight: 72, borderRadius: 10, borderWidth: 1.5, borderColor: border,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: '#0F172A',
    backgroundColor: '#FAFAFA', textAlignVertical: 'top',
  },
  textAreaFocused: { borderColor: blue, backgroundColor: white },
  specialtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specialtyChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: border, backgroundColor: white,
  },
  specialtyChipActive: { backgroundColor: bluePale, borderColor: blue },
  specialtyChipText: { fontSize: 13, fontFamily: 'Figtree_600SemiBold', color: slate },
  specialtyChipTextActive: { color: blue },

  successOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontFamily: 'Figtree_700Bold', color: '#0F172A', textAlign: 'center' },
  successSub: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: slate, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  // Demo screen
  demoScroll: { flexGrow: 1 },
  slideContainer: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 32, paddingBottom: 16 },
  slideIllustration: {
    width: 100, height: 100, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  slideTitle: { fontSize: 22, fontFamily: 'Figtree_700Bold', color: '#0F172A', textAlign: 'center', lineHeight: 30 },
  slideBody: { fontSize: 14, fontFamily: 'Figtree_600SemiBold', color: slate, textAlign: 'center', lineHeight: 22, marginTop: 10 },
  slideNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
  slideIndicators: { flexDirection: 'row', gap: 6 },
  slideDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: border },
  slideDotActive: { width: 20, backgroundColor: blue },
  navBtn: {
    height: 44, paddingHorizontal: 20, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
  },
  navBtnPrimary: { backgroundColor: blue },
  navBtnGhost: { borderWidth: 1.5, borderColor: border },
  navBtnText: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: white },
  navBtnTextGhost: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: slate },

  // Leads screen
  leadsScroll: { flexGrow: 1, paddingBottom: 40 },
  leadCard: {
    backgroundColor: white, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: border,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  leadAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: bluePale,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  leadAvatarText: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: blue },
  leadName: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: '#0F172A' },
  leadMeta: { fontSize: 12, fontFamily: 'Figtree_600SemiBold', color: slate, marginTop: 2 },
  leadDate: { fontSize: 11, fontFamily: 'Figtree_600SemiBold', color: slateLight, marginTop: 3 },

  // Back button
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 6 },
  backBtnText: { fontSize: 14, fontFamily: 'Figtree_700Bold', color: blue },
});
