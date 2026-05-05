import { Figtree_600SemiBold, Figtree_700Bold, useFonts } from '@expo-google-fonts/figtree';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { DemoApp } from './src/demo/DemoApp';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { OnboardScreen } from './src/screens/OnboardScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { pingAppOpen } from './src/api/client';
import styles from './src/theme/styles';

const AGENT_KEY = 'mr_agent_profile';

export default function App() {
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold, Figtree_700Bold });
  const [agent, setAgent] = useState(null);
  const [agentChecked, setAgentChecked] = useState(false);
  const [screen, setScreen] = useState('demo');
  const [onboardKey, setOnboardKey] = useState(0);

  useEffect(() => {
    SecureStore.getItemAsync(AGENT_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setAgent(parsed);
          pingAppOpen(parsed.agentCode);
        } catch {}
      }
      setAgentChecked(true);
    });
  }, []);

  const handleSetup = async (profile) => {
    await SecureStore.setItemAsync(AGENT_KEY, JSON.stringify(profile));
    setAgent(profile);
    setScreen('demo');
  };

  if (!fontsLoaded || !agentChecked) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.container, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight || 0 }]}>

        {/* Header — shown on all screens except demo (demo has its own inline label) */}
        {agent && screen !== 'demo' && (
          <View style={styles.header}>
            <Ionicons name="briefcase-outline" size={18} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.headerBrand}>DocuRx</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>MR</Text>
            </View>
          </View>
        )}

        {!agent && (
          <SetupScreen onSetup={handleSetup} />
        )}

        {agent && screen === 'demo' && (
          <DemoApp
            onOnboard={() => { setScreen('onboard'); setOnboardKey((k) => k + 1); }}
            onLeads={() => setScreen('leads')}
          />
        )}

        {agent && screen === 'onboard' && (
          <OnboardScreen
            key={onboardKey}
            agent={agent}
            onBack={() => setScreen('demo')}
            onSuccess={() => setOnboardKey((k) => k + 1)}
          />
        )}

        {agent && screen === 'leads' && (
          <LeadsScreen
            agent={agent}
            onBack={() => setScreen('demo')}
          />
        )}

      </View>
    </SafeAreaView>
  );
}
