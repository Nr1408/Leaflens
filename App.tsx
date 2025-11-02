import { StatusBar } from 'expo-status-bar';
import RootNavigation from './src/navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { getSettings } from './src/services/settings';
import { setLanguage as setI18nLanguage } from './src/i18n';

export default function App() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    (async () => {
  const s = await getSettings();
      setI18nLanguage(s.language as any);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigation />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
 
