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

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function HomeScreen({ agent, onOnboard, onDemo, onLeads }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchMyLeads(agent.agentCode);
      setLeads(data);
    } catch {
      // silently fail — show stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [agent.agentCode]);

  useEffect(() => { load(); }, [load]);

  const thisWeek = leads.filter((l) => {
    const diff = Date.now() - new Date(l.onboarded_at).getTime();
    return diff < 7 * 86400000;
  }).length;

  return (
    <ScrollView
      contentContainerStyle={styles.homeScroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor="#2563EB" />}
    >
      {/* Agent strip */}
      <View style={styles.agentStrip}>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarText}>{initials(agent.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.agentName}>{agent.name}</Text>
          <View style={styles.agentCodeBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.agentCodeText}>{agent.agentCode}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          {loading
            ? <ActivityIndicator size="small" color="#2563EB" />
            : <Text style={styles.statNum}>{leads.length}</Text>
          }
          <Text style={styles.statLabel}>Total{'\n'}Onboarded</Text>
        </View>
        <View style={styles.statCard}>
          {loading
            ? <ActivityIndicator size="small" color="#2563EB" />
            : <Text style={styles.statNum}>{thisWeek}</Text>
          }
          <Text style={styles.statLabel}>This{'\n'}Week</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardPrimary]}
          onPress={onOnboard}
          activeOpacity={0.85}
          accessibilityLabel="Onboard a doctor"
          accessibilityRole="button"
        >
          <View style={[styles.actionCardIcon, styles.actionCardIconPrimary]}>
            <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.actionCardLabel, styles.actionCardLabelPrimary]}>Onboard Doctor</Text>
          <Text style={[styles.actionCardSub, styles.actionCardSubPrimary]}>Add a new lead</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={onDemo}
          activeOpacity={0.85}
          accessibilityLabel="Show demo"
          accessibilityRole="button"
        >
          <View style={styles.actionCardIcon}>
            <Ionicons name="play-circle-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.actionCardLabel}>Show Demo</Text>
          <Text style={styles.actionCardSub}>Present to doctor</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionCard, { marginHorizontal: 16 }]}
        onPress={onLeads}
        activeOpacity={0.85}
        accessibilityLabel="My leads"
        accessibilityRole="button"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.actionCardIcon, { marginRight: 12, marginBottom: 0 }]}>
            <Ionicons name="list-outline" size={22} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionCardLabel}>My Leads</Text>
            <Text style={styles.actionCardSub}>View all doctors you've onboarded</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </View>
      </TouchableOpacity>

      {/* Recent activity */}
      {!loading && leads.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Recent</Text>
          {leads.slice(0, 3).map((lead, i) => (
            <View key={lead.id || i} style={styles.recentCard}>
              <View style={styles.recentDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>Dr. {lead.doctor_name}</Text>
                <Text style={styles.recentMeta}>
                  {[lead.specialty, lead.clinic_name].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Text style={{ fontSize: 11, fontFamily: 'Figtree_600SemiBold', color: '#94A3B8' }}>
                {timeAgo(lead.onboarded_at)}
              </Text>
            </View>
          ))}
        </>
      )}

      {!loading && leads.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={44} color="#BFDBFE" />
          <Text style={styles.emptyTitle}>No leads yet</Text>
          <Text style={styles.emptySub}>
            Tap "Onboard Doctor" after visiting a clinic to log your first lead.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
