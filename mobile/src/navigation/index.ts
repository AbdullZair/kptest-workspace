// Navigation exports
export {
  AppNavigator,
  navigationRef,
  navigate,
  goBack,
  resetTo,
} from './AppNavigator';

export type {
  AuthStackParamList,
  MainStackParamList,
  PatientStackParamList,
  ProjectStackParamList,
  MessagesStackParamList,
  CalendarStackParamList,
  MaterialsStackParamList,
  SettingsStackParamList,
  TabParamList,
  RootStackParamList,
} from './AppNavigator';

// Deep linking exports
export {
  linking,
  generateDeepLink,
  openDeepLink,
  parseDeepLink,
  addDeepLinkListener,
  getInitialURL,
  DEEP_LINKS,
  DEEP_LINK_PREFIX,
} from './deepLinking';
