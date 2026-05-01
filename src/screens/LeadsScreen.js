import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchMyLeads } from '../api/client';
import styles from '../theme/styles';

function initials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function LeadsScreen({ agent, onBack }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchMyLeads(agent.agentCode);
      setLeads(data);
    } catch {
      setError('Could not load leads. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [agent.agentCode]);

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView
      contentContainerStyle={styles.leadsScroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor="#2563EB" />}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="#2563EB" />
          <Text style={styles.backBtnText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Leads</Text>
        <Text style={styles.screenSub}>{leads.length} doctor{leads.length !== 1 ? 's' : ''} onboarded under {agent.agentCode}</Text>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 48 }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={36} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Couldn't load</Text>
          <Text style={styles.emptySub}>{error}</Text>
        </View>
      ) : leads.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={44} color="#BFDBFE" />
          <Text style={styles.emptyTitle}>No leads yet</Text>
          <Text style={styles.emptySub}>Onboard your first doctor to see them here.</Text>
        </View>
      ) : (
        leads.map((lead, i) => (
          <View key={lead.id || i} style={styles.leadCard}>
            <View style={styles.leadAvatar}>
              <Text style={styles.leadAvatarText}>{initials(lead.doctor_name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leadName}>Dr. {lead.doctor_name}</Text>
              <Text style={styles.leadMeta}>
                {[lead.specialty, lead.clinic_name, lead.city].filter(Boolean).join(' · ')}
              </Text>
              {lead.doctor_phone ? (
                <Text style={styles.leadDate}>📞 +91 {lead.doctor_phone}</Text>
              ) : null}
              <Text style={styles.leadDate}>{formatDate(lead.onboarded_at)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
