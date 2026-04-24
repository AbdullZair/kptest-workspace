export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  notes?: string;
  projectId?: string;
  projectName?: string;
  isCompleted: boolean;
  completedAt?: string;
  userNotes?: string;
  reminders: EventReminder[];
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | 'appointment'
  | 'therapy_session'
  | 'medication_reminder'
  | 'exercise'
  | 'measurement'
  | 'other';

export interface EventReminder {
  id: string;
  time: string; // ISO date string
  type: 'push' | 'email' | 'sms';
  isTriggered: boolean;
}

export interface EventListParams {
  startDate?: string;
  endDate?: string;
  type?: EventType;
  projectId?: string;
  status?: 'upcoming' | 'completed' | 'overdue';
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  notes?: string;
  projectId?: string;
  reminders?: {
    time: string;
    type: 'push' | 'email' | 'sms';
  }[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  notes?: string;
  isCompleted?: boolean;
  userNotes?: string;
}

export interface CalendarDay {
  date: string;
  events: CalendarEvent[];
  hasEvents: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface WeekView {
  startDate: string;
  endDate: string;
  days: CalendarDay[];
}

export interface MonthView {
  year: number;
  month: number;
  weeks: CalendarDay[][];
}
