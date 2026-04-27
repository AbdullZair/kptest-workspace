// Accessibility constants for WCAG 2.1 AA compliance

export const ACCESSIBILITY_LABELS = {
  // Navigation
  BACK_BUTTON: 'Wróć',
  CLOSE_BUTTON: 'Zamknij',
  MENU_BUTTON: 'Menu',
  SETTINGS_BUTTON: 'Ustawienia',
  HOME_BUTTON: 'Strona główna',
  
  // Auth
  LOGIN_BUTTON: 'Zaloguj się',
  LOGOUT_BUTTON: 'Wyloguj się',
  REGISTER_BUTTON: 'Zarejestruj się',
  FORGOT_PASSWORD_BUTTON: 'Przypomnij hasło',
  SHOW_PASSWORD_BUTTON: 'Pokaż hasło',
  HIDE_PASSWORD_BUTTON: 'Ukryj hasło',
  
  // Patients
  ADD_PATIENT_BUTTON: 'Dodaj pacjenta',
  EDIT_PATIENT_BUTTON: 'Edytuj pacjenta',
  DELETE_PATIENT_BUTTON: 'Usuń pacjenta',
  PATIENT_LIST: 'Lista pacjentów',
  
  // Projects
  ADD_PROJECT_BUTTON: 'Dodaj projekt',
  EDIT_PROJECT_BUTTON: 'Edytuj projekt',
  DELETE_PROJECT_BUTTON: 'Usuń projekt',
  PROJECT_LIST: 'Lista projektów',
  
  // Messages
  SEND_MESSAGE_BUTTON: 'Wyślij wiadomość',
  ATTACH_FILE_BUTTON: 'Dołącz plik',
  MESSAGE_LIST: 'Lista wiadomości',
  NEW_MESSAGE_BUTTON: 'Nowa wiadomość',
  
  // Calendar
  ADD_EVENT_BUTTON: 'Dodaj wydarzenie',
  EDIT_EVENT_BUTTON: 'Edytuj wydarzenie',
  DELETE_EVENT_BUTTON: 'Usuń wydarzenie',
  COMPLETE_EVENT_BUTTON: 'Oznacz jako wykonane',
  CALENDAR_VIEW: 'Kalendarz',
  
  // Materials
  DOWNLOAD_MATERIAL_BUTTON: 'Pobierz materiał',
  VIEW_MATERIAL_BUTTON: 'Zobacz materiał',
  MATERIAL_LIST: 'Lista materiałów',
  
  // Notifications
  NOTIFICATION_SETTINGS_BUTTON: 'Ustawienia powiadomień',
  MARK_AS_READ_BUTTON: 'Oznacz jako przeczytane',
  
  // General
  REFRESH_BUTTON: 'Odśwież',
  SEARCH_BUTTON: 'Szukaj',
  FILTER_BUTTON: 'Filtruj',
  SORT_BUTTON: 'Sortuj',
  SAVE_BUTTON: 'Zapisz',
  CANCEL_BUTTON: 'Anuluj',
  CONFIRM_BUTTON: 'Potwierdź',
  EDIT_BUTTON: 'Edytuj',
  DELETE_BUTTON: 'Usuń',
  SHARE_BUTTON: 'Udostępnij',
  COPY_BUTTON: 'Kopiuj',
  
  // Emergency
  EMERGENCY_CALL_BUTTON: 'Zadzwoń na numer alarmowy',
  EMERGENCY_CONTACT_BUTTON: 'Kontakt awaryjny',
  
  // Offline
  OFFLINE_MODE_BUTTON: 'Tryb offline',
  SYNC_BUTTON: 'Synchronizuj',
  
  // Stats
  VIEW_STATS_BUTTON: 'Zobacz statystyki',
  EXPORT_STATS_BUTTON: 'Eksportuj statystyki',
} as const;

export const ACCESSIBILITY_HINTS = {
  // Auth
  LOGIN_FORM: 'Wprowadź email i hasło aby się zalogować',
  REGISTER_FORM: 'Wypełnij formularz rejestracyjny',
  
  // Patients
  PATIENT_CARD: 'Dotknij aby zobaczyć szczegóły pacjenta',
  PATIENT_FORM: 'Wypełnij dane pacjenta',
  
  // Calendar
  EVENT_CARD: 'Dotknij aby zobaczyć szczegóły wydarzenia',
  CALENDAR_DAY: 'Dotknij aby zobaczyć wydarzenia dnia',
  
  // Messages
  MESSAGE_BUBBLE: 'Dotknij aby zobaczyć szczegóły wiadomości',
  CONVERSATION_LIST: 'Przewiń aby zobaczyć wszystkie konwersacje',
  
  // Materials
  MATERIAL_CARD: 'Dotknij aby otworzyć materiał',
  
  // Forms
  REQUIRED_FIELD: 'Pole wymagane',
  OPTIONAL_FIELD: 'Pole opcjonalne',
  INVALID_EMAIL: 'Nieprawidłowy adres email',
  INVALID_PHONE: 'Nieprawidłowy numer telefonu',
  
  // States
  LOADING: 'Ładowanie danych',
  EMPTY_LIST: 'Brak elementów do wyświetlenia',
  ERROR_STATE: 'Wystąpił błąd',
  OFFLINE_STATE: 'Brak połączenia z internetem',
} as const;

export const ACCESSIBILITY_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  IMAGE: 'image',
  TEXT: 'text',
  HEADER: 'header',
  LIST: 'list',
  LIST_ITEM: 'listitem',
  TAB: 'tab',
  TAB_BAR: 'tabbar',
  NAVIGATION_BAR: 'navigation',
  SEARCH_BOX: 'searchbox',
  TEXT_FIELD: 'textfield',
  CHECKBOX: 'checkbox',
  SWITCH: 'switch',
  RADIO: 'radio',
  RADIO_GROUP: 'radiogroup',
  PROGRESS_BAR: 'progressbar',
  ALERT: 'alert',
  STATUS: 'status',
  DIALOG: 'dialog',
  MENU: 'menu',
  MENU_ITEM: 'menuitem',
} as const;

// Minimum touch target size (WCAG 2.1 AA - 44x44 points)
export const MIN_TOUCH_TARGET = 44;

// Minimum contrast ratio (WCAG 2.1 AA)
export const MIN_CONTRAST_RATIO = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3,
  UI_COMPONENTS: 3,
};

// Font size categories
export const FONT_SIZE_CATEGORIES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extraLarge',
} as const;

export default ACCESSIBILITY_LABELS;
