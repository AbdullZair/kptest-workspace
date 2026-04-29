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

// Patient Stack
export type PatientStackParamList = {
  Patients: undefined;
  PatientDetail: { patientId: string };
  PatientForm: { patientId?: string };
};

// Project Stack
export type ProjectStackParamList = {
  Projects: undefined;
  ProjectDetail: { projectId: string };
  ProjectPatients: { projectId: string };
  ProjectForm: { projectId?: string };
};

// Messages Stack
export type MessagesStackParamList = {
  Messages: undefined;
  Conversation: { threadId: string };
  NewMessage: undefined;
};

// Calendar Stack
export type CalendarStackParamList = {
  Calendar: undefined;
  EventDetail: { eventId: string };
  EventForm: { eventId?: string };
};

// Materials Stack
export type MaterialsStackParamList = {
  Materials: undefined;
  MaterialDetail: { materialId: string };
  MaterialViewer: { materialId: string; url?: string };
};

// Settings Stack
export type SettingsStackParamList = {
  SettingsHome: undefined;
  NotificationPreferences: undefined;
  OfflineMode: undefined;
  ComplianceStats: undefined;
  EmergencyContact: undefined;
  Security: undefined;
  Appearance: undefined;
  About: undefined;
  ChangePassword: undefined;
};

// Bottom Tabs
export type TabParamList = {
  HomeTab: undefined;
  PatientsTab: undefined;
  ProjectsTab: undefined;
  MessagesTab: undefined;
  CalendarTab: undefined;
  MaterialsTab: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Modal: { title: string };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const PatientStack = createNativeStackNavigator<PatientStackParamList>();
const ProjectStack = createNativeStackNavigator<ProjectStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const MaterialsStack = createNativeStackNavigator<MaterialsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Import screens from features
const LoginScreen = React.lazy(() => import('@features/auth/screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('@features/auth/screens/RegisterScreen'));
const TwoFaScreen = React.lazy(() => import('@features/auth/screens/TwoFaScreen'));
const ForgotPasswordScreen = () => null; // TODO: Implement

const HomeScreen = React.lazy(() => import('@features/dashboard/screens/DashboardScreen'));
const ProfileScreen = () => null; // TODO: Implement
const SettingsScreen = React.lazy(() => import('@features/settings/screens/SettingsHomeScreen'));

const PatientsScreen = React.lazy(() => import('@features/patients/screens/PatientsScreen'));
const PatientDetailScreen = React.lazy(() => import('@features/patients/screens/PatientDetailScreen'));
const PatientFormScreen = React.lazy(() => import('@features/patients/screens/PatientFormScreen'));

const ProjectsScreen = React.lazy(() => import('@features/projects/screens/ProjectsScreen'));
const ProjectDetailScreen = React.lazy(() => import('@features/projects/screens/ProjectDetailScreen'));
const ProjectPatientsScreen = React.lazy(() => import('@features/projects/screens/ProjectPatientsScreen'));

const MessagesScreen = React.lazy(() => import('@features/messages/screens/MessagesScreen'));
const ConversationScreen = React.lazy(() => import('@features/messages/screens/ConversationScreen'));
const NewMessageScreen = React.lazy(() => import('@features/messages/screens/NewMessageScreen'));

const CalendarScreen = React.lazy(() => import('@features/calendar/screens/CalendarScreen'));
const EventDetailScreen = React.lazy(() => import('@features/calendar/screens/EventDetailScreen'));
const EventFormScreen = React.lazy(() => import('@features/calendar/screens/EventFormScreen'));

const MaterialsScreen = React.lazy(() => import('@features/materials/screens/MaterialsScreen'));
const MaterialDetailScreen = React.lazy(() => import('@features/materials/screens/MaterialDetailScreen'));
const MaterialViewerScreen = React.lazy(() => import('@features/materials/screens/MaterialViewerScreen'));

const NotificationPreferencesScreen = React.lazy(
  () => import('@features/notifications/screens/NotificationPreferencesScreen')
);

// Patient Stack Navigator
function PatientStackNavigator() {
  return (
    <PatientStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Wróć',
      }}
    >
      <PatientStack.Screen
        name="Patients"
        component={PatientsScreen}
        options={{ title: 'Pacjenci' }}
      />
      <PatientStack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: 'Szczegóły pacjenta' }}
      />
      <PatientStack.Screen
        name="PatientForm"
        component={PatientFormScreen}
        options={{ title: 'Formularz pacjenta' }}
      />
    </PatientStack.Navigator>
  );
}

// Project Stack Navigator
function ProjectStackNavigator() {
  return (
    <ProjectStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Wróć',
      }}
    >
      <ProjectStack.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: 'Projekty' }}
      />
      <ProjectStack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Szczegóły projektu' }}
      />
      <ProjectStack.Screen
        name="ProjectPatients"
        component={ProjectPatientsScreen}
        options={{ title: 'Pacjenci w projekcie' }}
      />
    </ProjectStack.Navigator>
  );
}

// Messages Stack Navigator
function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Wróć',
      }}
    >
      <MessagesStack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ title: 'Wiadomości' }}
      />
      <MessagesStack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{ title: 'Konwersacja' }}
      />
      <MessagesStack.Screen
        name="NewMessage"
        component={NewMessageScreen}
        options={{ title: 'Nowa wiadomość' }}
      />
    </MessagesStack.Navigator>
  );
}

// Calendar Stack Navigator
function CalendarStackNavigator() {
  return (
    <CalendarStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Wróć',
      }}
    >
      <CalendarStack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Kalendarz' }}
      />
      <CalendarStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Szczegóły wydarzenia' }}
      />
      <CalendarStack.Screen
        name="EventForm"
        component={EventFormScreen}
        options={{ title: 'Formularz wydarzenia' }}
      />
    </CalendarStack.Navigator>
  );
}

// Materials Stack Navigator
function MaterialsStackNavigator() {
  return (
    <MaterialsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Wróć',
      }}
    >
      <MaterialsStack.Screen
        name="Materials"
        component={MaterialsScreen}
        options={{ title: 'Materiały' }}
      />
      <MaterialsStack.Screen
        name="MaterialDetail"
        component={MaterialDetailScreen}
        options={{ title: 'Szczegóły materiału' }}
      />
      <MaterialsStack.Screen
        name="MaterialViewer"
        component={MaterialViewerScreen}
        options={{ title: 'Podgląd' }}
      />
    </MaterialsStack.Navigator>
  );
}

// Settings Stack Navigator
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Wróć',
      }}
    >
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: 'Ustawienia' }}
      />
      <SettingsStack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ title: 'Powiadomienia' }}
      />
      <SettingsStack.Screen
        name="OfflineMode"
        component={React.lazy(() => import('@features/settings/screens/OfflineModeScreen'))}
        options={{ title: 'Tryb offline' }}
      />
      <SettingsStack.Screen
        name="ComplianceStats"
        component={React.lazy(() => import('@features/stats/screens/ComplianceStatsScreen'))}
        options={{ title: 'Statystyki' }}
      />
      <SettingsStack.Screen
        name="EmergencyContact"
        component={React.lazy(() => import('@features/patients/screens/EmergencyContactScreen'))}
        options={{ title: 'Kontakt awaryjny' }}
      />
      <SettingsStack.Screen
        name="Security"
        component={() => null}
        options={{ title: 'Bezpieczeństwo' }}
      />
      <SettingsStack.Screen
        name="Appearance"
        component={() => null}
        options={{ title: 'Wygląd' }}
      />
      <SettingsStack.Screen
        name="About"
        component={() => null}
        options={{ title: 'O aplikacji' }}
      />
      <SettingsStack.Screen
        name="ChangePassword"
        component={React.lazy(() => import('@features/settings/screens/ChangePasswordScreen'))}
        options={{ title: 'Zmień hasło' }}
      />
    </SettingsStack.Navigator>
  );
}

// Main Tab Navigator
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
        name="PatientsTab"
        component={PatientStackNavigator}
        options={{
          tabBarLabel: 'Pacjenci',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectStackNavigator}
        options={{
          tabBarLabel: 'Projekty',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStackNavigator}
        options={{
          tabBarLabel: 'Wiadomości',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStackNavigator}
        options={{
          tabBarLabel: 'Kalendarz',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
      <Tab.Screen
        name="MaterialsTab"
        component={MaterialsStackNavigator}
        options={{
          tabBarLabel: 'Materiały',
          tabBarIcon: ({ color, size }) => null,
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Home" component={MainTabNavigator} />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
      <MainStack.Screen name="Settings" component={SettingsStackNavigator} />
    </MainStack.Navigator>
  );
}

// Auth Stack Navigator
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

export function AppNavigator(): JSX.Element {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isDarkMode = false;

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

// Navigation ref for non-component navigation
import type { NavigationContainerRef } from '@react-navigation/native';
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  // The overloaded signature on `navigate` is hard to satisfy generically; the
  // runtime call is identical so we cast through a narrow shape.
  (navigationRef.current?.navigate as unknown as (n: string, p?: object) => void)(
    name as string,
    params as object | undefined,
  );
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

export default AppNavigator;
