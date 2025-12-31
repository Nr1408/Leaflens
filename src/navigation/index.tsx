import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme, Appearance } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { applyThemeMode } from '../ui/theme';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
// import DiagnoseScreen from '../screens/DiagnoseScreen'; // removed in favor of inline diagnosis on Home
import ResultScreen from '../screens/ResultScreen';
import DiseaseDetailScreen from '../screens/DiseaseDetailScreen';
import MyPlantsScreen from '../screens/MyPlantsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { AuthProvider, useAuth } from '../state/AuthContext';
import { getSettings, subscribeSettings } from '../services/settings';
import LandingScreen from '../screens/LandingNew';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CommunityScreen from '../screens/CommunityScreen';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  Home: undefined;
  Community: undefined;
  History: undefined;
  Profile: undefined;
  Result: {
    label: string;
    probability: number;
    topK?: { label: string; probability: number }[];
    imageUri?: string;
  };
  DiseaseDetail: { label: string; probability?: number };
  MyPlants: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function StackContent() {
  const { user } = useAuth();
  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="DiseaseDetail" component={DiseaseDetailScreen} />
          <Stack.Screen name="MyPlants" component={MyPlantsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ResetPassword" component={require('../screens/ResetPasswordScreen').default} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ResetPassword" component={require('../screens/ResetPasswordScreen').default} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigation() {
  const systemScheme = useColorScheme();
  const [effectiveMode, setEffectiveMode] = React.useState<'light'|'dark'>('light');

  React.useEffect(() => {
    let mounted = true;
    let currentTheme: 'system' | 'light' | 'dark' = 'system';
    const applyFrom = async () => {
      const s = await getSettings();
      currentTheme = s.theme || 'system';
      const mode = currentTheme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : currentTheme;
      applyThemeMode(mode);
      if (mounted) setEffectiveMode(mode);
    };
    applyFrom();
    const unsubSettings = subscribeSettings(async (s) => {
      currentTheme = s.theme || 'system';
      const mode = currentTheme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : currentTheme;
      applyThemeMode(mode);
      if (mounted) setEffectiveMode(mode);
    });
    return () => { mounted = false; unsubSettings(); };
  }, [systemScheme]);

  return (
    <AuthProvider>
      <NavigationContainer theme={effectiveMode === 'dark' ? DarkTheme : DefaultTheme}
        linking={{
          prefixes: ['leaflens://'],
          config: {
            screens: {
              ResetPassword: 'reset-password',
              // Fallbacks; other routes handled normally
            },
          },
        }}
      >
        <StackContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
