import 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { AuthProvider } from './src/context/AuthContext';
import { HabitProvider } from './src/context/HabitContext';
import { MainTabParamList, RootStackParamList } from './src/navigation';
import {
  AddHabitScreen,
  EditHabitScreen,
  HabitDetailScreen,
  HomeScreen,
  LoginScreen,
  ProgressScreen,
  SettingsScreen,
  SplashScreen,
} from './src/screens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FAF8F5',
    card: '#FFFFFF',
    border: '#EFECE7',
    primary: '#FF6B00',
    text: '#221C18',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#A39E98',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused, size }) => {
          const iconByRoute: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            Progress: focused ? 'analytics' : 'analytics-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };

          return <Ionicons color={color} name={iconByRoute[route.name]} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <HabitProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style="dark" />
              <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                  name="AddHabit"
                  component={AddHabitScreen}
                  options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
                />
                <Stack.Screen
                  name="HabitDetail"
                  component={HabitDetailScreen}
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                  name="EditHabit"
                  component={EditHabitScreen}
                  options={{ animation: 'slide_from_right' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </HabitProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    height: 70,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopColor: '#EFECE7',
    backgroundColor: '#FFFFFF',
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
});
