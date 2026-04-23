import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';
import { lightTheme, darkTheme } from '@app/theme';

// Auth Stack Screens
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  TwoFa: { email: string; tempToken: string };
  ForgotPassword: undefined;
};

// Main App Stack Screens
export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Bottom Tabs
export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ProfileTab: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Modal: { title: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Placeholder screens - to be implemented
const LoginScreen = () => null;
const RegisterScreen = () => null;
const TwoFaScreen = () => null;
const ForgotPasswordScreen = () => null;
const HomeScreen = () => null;
const ProfileScreen = () => null;
const SettingsScreen = () => null;
const SearchScreen = () => null;

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="TwoFa" component={TwoFaScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
    </Tab.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Home" component={MainTabNavigator} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
    </MainStack.Navigator>
  );
}

export function Navigation() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isDarkMode = false; // Can be connected to theme context

  return (
    <NavigationContainer theme={isDarkMode ? darkTheme : lightTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainStackNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        )}
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen
            name="Modal"
            component={SettingsScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// Navigation helpers
export const navigationRef = React.createRef<NavigationContainer>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  navigationRef.current?.navigate(name as string, params);
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function resetTo(route: keyof RootStackParamList) {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: route as string }],
  });
}
