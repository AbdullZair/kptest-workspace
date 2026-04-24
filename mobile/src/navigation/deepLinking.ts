import { Linking } from 'react-native';
import type { RootStackParamList } from './AppNavigator';

// Deep link prefix - configure in app.json as well
const DEEP_LINK_PREFIX = 'kptest://';

// Deep link paths
export const DEEP_LINKS = {
  // Patient links
  patient: 'patients/:patientId',
  patientForm: 'patients/form/:patientId?',
  
  // Project links
  project: 'projects/:projectId',
  projectPatients: 'projects/:projectId/patients',
  
  // Message links
  messages: 'messages',
  conversation: 'messages/:threadId',
  newMessage: 'messages/new',
  
  // Calendar links
  calendar: 'calendar',
  event: 'calendar/events/:eventId',
  eventForm: 'calendar/events/form/:eventId?',
  
  // Materials links
  materials: 'materials',
  material: 'materials/:materialId',
  materialViewer: 'materials/:materialId/view',
  
  // Settings links
  settings: 'settings',
  notificationPreferences: 'settings/notifications',
} as const;

// Full deep link configuration for NavigationContainer
export const linking = {
  prefixes: [
    DEEP_LINK_PREFIX,
    'https://kptest.com',
    'https://www.kptest.com',
  ],
  config: {
    screens: {
      // Auth screens
      Login: 'login',
      Register: 'register',
      
      // Main tabs
      Main: {
        screens: {
          Home: 'home',
          
          // Patient tab stack
          PatientsTab: {
            screens: {
              Patients: 'patients',
              PatientDetail: {
                path: 'patients/:patientId',
                parse: {
                  patientId: (patientId: string) => `${patientId}`,
                },
              },
              PatientForm: {
                path: 'patients/form/:patientId?',
              },
            },
          },
          
          // Project tab stack
          ProjectsTab: {
            screens: {
              Projects: 'projects',
              ProjectDetail: {
                path: 'projects/:projectId',
                parse: {
                  projectId: (projectId: string) => `${projectId}`,
                },
              },
              ProjectPatients: {
                path: 'projects/:projectId/patients',
              },
            },
          },
          
          // Messages tab stack
          MessagesTab: {
            screens: {
              Messages: 'messages',
              Conversation: {
                path: 'messages/:threadId',
                parse: {
                  threadId: (threadId: string) => `${threadId}`,
                },
              },
              NewMessage: 'messages/new',
            },
          },
          
          // Calendar tab stack
          CalendarTab: {
            screens: {
              Calendar: 'calendar',
              EventDetail: {
                path: 'calendar/events/:eventId',
                parse: {
                  eventId: (eventId: string) => `${eventId}`,
                },
              },
              EventForm: {
                path: 'calendar/events/form/:eventId?',
              },
            },
          },
          
          // Materials tab stack
          MaterialsTab: {
            screens: {
              Materials: 'materials',
              MaterialDetail: {
                path: 'materials/:materialId',
                parse: {
                  materialId: (materialId: string) => `${materialId}`,
                },
              },
              MaterialViewer: {
                path: 'materials/:materialId/view',
              },
            },
          },
          
          // Settings
          Settings: {
            screens: {
              SettingsHome: 'settings',
              NotificationPreferences: 'settings/notifications',
            },
          },
        },
      },
    },
  },
};

/**
 * Generate a deep link URL for a given screen
 */
export function generateDeepLink<RouteName extends keyof RootStackParamList>(
  screen: RouteName,
  params?: RootStackParamList[RouteName]
): string {
  const screenPaths: Record<string, string> = {
    Login: `${DEEP_LINK_PREFIX}login`,
    Register: `${DEEP_LINK_PREFIX}register`,
    Home: `${DEEP_LINK_PREFIX}home`,
  };

  // Handle dynamic paths
  if (screen === 'PatientDetail' && params && 'patientId' in params) {
    return `${DEEP_LINK_PREFIX}patients/${params.patientId}`;
  }
  
  if (screen === 'ProjectDetail' && params && 'projectId' in params) {
    return `${DEEP_LINK_PREFIX}projects/${params.projectId}`;
  }
  
  if (screen === 'Conversation' && params && 'threadId' in params) {
    return `${DEEP_LINK_PREFIX}messages/${params.threadId}`;
  }
  
  if (screen === 'EventDetail' && params && 'eventId' in params) {
    return `${DEEP_LINK_PREFIX}calendar/events/${params.eventId}`;
  }
  
  if (screen === 'MaterialDetail' && params && 'materialId' in params) {
    return `${DEEP_LINK_PREFIX}materials/${params.materialId}`;
  }

  return screenPaths[screen as string] || DEEP_LINK_PREFIX;
}

/**
 * Open a deep link URL
 */
export async function openDeepLink(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    console.warn(`Cannot open URL: ${url}`);
  }
}

/**
 * Handle incoming deep link - parse and navigate
 */
export function parseDeepLink(url: string): { screen?: string; params?: Record<string, string> } {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.replace(/^\//, '');
    const searchParams = parsedUrl.searchParams;
    
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Extract screen name and params from path
    const segments = path.split('/');
    const screen = segments[0];
    
    // Extract ID from path if present
    if (segments.length > 1 && segments[1]) {
      params.id = segments[segments.length - 1];
    }

    return { screen, params };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return {};
  }
}

/**
 * Add deep link listener
 */
export function addDeepLinkListener(
  callback: (url: string) => void
): { remove: () => void } {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    callback(url);
  });

  return {
    remove: () => subscription.remove(),
  };
}

/**
 * Get initial deep link URL if app was opened via deep link
 */
export async function getInitialURL(): Promise<string | null> {
  const url = await Linking.getInitialURL();
  return url || null;
}

export default {
  linking,
  generateDeepLink,
  openDeepLink,
  parseDeepLink,
  addDeepLinkListener,
  getInitialURL,
  DEEP_LINKS,
  DEEP_LINK_PREFIX,
};
