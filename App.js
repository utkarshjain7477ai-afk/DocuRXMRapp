import { Figtree_600SemiBold, Figtree_700Bold, useFonts } from '@expo-google-fonts/figtree';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { DemoApp } from './src/demo/DemoApp';
import { HomeScreen } from './src/screens/HomeScreen';
import { LeadsScreen } from './src/screens/LeadsScreen';
import { OnboardScreen } from './src/screens/OnboardScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import styles from './src/theme/styles';

const AGENT_KEY = 'mr_agent_profile';

export default function App() {
  const [fontsLoaded] = useFonts({ Figtree_600SemiBold, Figtree_700Bold });
  const [agent, setAgent] = useState(null);
  const [agentChecked, setAgentChecked] = useState(false);
  const [screen, setScreen] = useState('home');
  const [onboardKey, setOnboardKey] = useState(0);

  useEffect(() => {
    SecureStore.getItemAsync(AGENT_KEY).then((raw) => {
      if (raw) {
        try { setAgent(JSON.parse(raw)); } catch {}
      }
      setAgentChecked(true);
    });
  }, []);

  const handleSetup = async (profile) => {
    await SecureStore.setItemAsync(AGENT_KEY, JSON.stringify(profile));
    setAgent(profile);
    setScreen('home');
  };

  if (!fontsLoaded || !agentChecked) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.container, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight || 0 }]}>

        {/* Header — shown on all screens except demo */}
        {screen !== 'demo' && (
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

        {agent && screen === 'home' && (
          <HomeScreen
            agent={agent}
            onOnboard={() => setScreen('onboard')}
            onDemo={() => setScreen('demo')}
            onLeads={() => setScreen('leads')}
          />
        )}

        {agent && screen === 'onboard' && (
          <OnboardScreen
            key={onboardKey}
            agent={agent}
            onBack={() => setScreen('home')}
            onSuccess={() => setOnboardKey((k) => k + 1)}
          />
        )}

        {agent && screen === 'leads' && (
          <LeadsScreen
            agent={agent}
            onBack={() => setScreen('home')}
          />
        )}

        {agent && screen === 'demo' && (
          <DemoApp
            onBack={() => setScreen('home')}
            onOnboard={() => { setScreen('onboard'); setOnboardKey((k) => k + 1); }}
          />
        )}

      </View>
    </SafeAreaView>
  );
}
