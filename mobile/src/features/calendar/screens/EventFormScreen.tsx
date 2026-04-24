import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import {
  useGetCalendarEventQuery,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
} from '../api/calendarApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ReminderPicker } from '../components/ReminderPicker';
import type { EventType, EventReminder } from '../api/types';

interface EventFormRouteParams {
  eventId?: string;
}

interface EventFormNavigationProps {
  goBack: () => void;
}

interface FormData {
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location: string;
  notes: string;
  projectId: string;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'appointment', label: 'Wizyta kontrolna' },
  { value: 'therapy_session', label: 'Sesja terapeutyczna' },
  { value: 'medication_reminder', label: 'Przypomnienie o leku' },
  { value: 'exercise', label: 'Ćwiczenie' },
  { value: 'measurement', label: 'Pomiar parametrów' },
  { value: 'other', label: 'Inne' },
];

export function EventFormScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<EventFormNavigationProps>();
  const { eventId } = (route.params as EventFormRouteParams) || {};
  const isEditMode = !!eventId;

  const { data: existingEvent, isLoading: isLoadingEvent } = useGetCalendarEventQuery(
    eventId!,
    { skip: !eventId }
  );
  const [createEvent] = useCreateCalendarEventMutation();
  const [updateEvent] = useUpdateCalendarEventMutation();

  const [reminders, setReminders] = useState<EventReminder[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'appointment',
      startDate: '',
      endDate: '',
      allDay: false,
      location: '',
      notes: '',
      projectId: '',
    },
  });

  useEffect(() => {
    if (existingEvent) {
      reset({
        title: existingEvent.title,
        description: existingEvent.description || '',
        type: existingEvent.type,
        startDate: existingEvent.startDate,
        endDate: existingEvent.endDate,
        allDay: existingEvent.allDay,
        location: existingEvent.location || '',
        notes: existingEvent.notes || '',
        projectId: existingEvent.projectId || '',
      });
      setReminders(existingEvent.reminders || []);
    }
  }, [existingEvent, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const eventData = {
        title: data.title,
        description: data.description || undefined,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay,
        location: data.location || undefined,
        notes: data.notes || undefined,
        projectId: data.projectId || undefined,
        reminders: reminders.map((r) => ({
          time: r.time,
          type: r.type,
        })),
      };

      if (isEditMode && eventId) {
        await updateEvent({ id: eventId, data: eventData }).unwrap();
      } else {
        await createEvent(eventData).unwrap();
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleAddReminder = () => {
    const newReminder: EventReminder = {
      id: Date.now().toString(),
      time: new Date(Date.now() + 3600000).toISOString(),
      type: 'push',
      isTriggered: false,
    };
    setReminders([...reminders, newReminder]);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleUpdateReminder = (id: string, updates: Partial<EventReminder>) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  if (isLoadingEvent) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie wydarzenia...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Podstawowe informacje</Text>

        <View style={styles.formField}>
          <Text style={styles.label}>Tytuł *</Text>
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Tytuł jest wymagany' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="Wprowadź tytuł"
                placeholderTextColor={colors.textLight}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Typ wydarzenia *</Text>
          <Controller
            control={control}
            name="type"
            rules={{ required: 'Typ jest wymagany' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeContainer}>
                {EVENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      value === type.value && styles.typeButtonActive,
                    ]}
                    onPress={() => onChange(type.value)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        value === type.value && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Opis</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={value}
                onChangeText={onChange}
                placeholder="Wprowadź opis"
                placeholderTextColor={colors.textLight}
                multiline
                textAlignVertical="top"
              />
            )}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data i czas</Text>

        <View style={styles.formField}>
          <Controller
            control={control}
            name="allDay"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <Text style={styles.label}>Całodniowe</Text>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={value ? colors.primary : colors.textLight}
                />
              </View>
            )}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.label}>Data rozpoczęcia</Text>
            <Controller
              control={control}
              name="startDate"
              rules={{ required: 'Data rozpoczęcia jest wymagana' }}
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity style={styles.dateInput} onPress={() => {}}>
                  <Text style={styles.dateInputText}>
                    {value || 'Wybierz datę'}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {!existingEvent?.allDay && (
            <View style={styles.formField}>
              <Text style={styles.label}>Godzina rozpoczęcia</Text>
              <Controller
                control={control}
                name="startDate"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity style={styles.dateInput} onPress={() => {}}>
                    <Text style={styles.dateInputText}>
                      {value ? value.split('T')[1]?.substring(0, 5) : 'Wybierz'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.label}>Data zakończenia</Text>
            <Controller
              control={control}
              name="endDate"
              rules={{ required: 'Data zakończenia jest wymagana' }}
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity style={styles.dateInput} onPress={() => {}}>
                  <Text style={styles.dateInputText}>
                    {value || 'Wybierz datę'}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {!existingEvent?.allDay && (
            <View style={styles.formField}>
              <Text style={styles.label}>Godzina zakończenia</Text>
              <Controller
                control={control}
                name="endDate"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity style={styles.dateInput} onPress={() => {}}>
                    <Text style={styles.dateInputText}>
                      {value ? value.split('T')[1]?.substring(0, 5) : 'Wybierz'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dodatkowe informacje</Text>

        <View style={styles.formField}>
          <Text style={styles.label}>Lokalizacja</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder="Wprowadź lokalizację"
                placeholderTextColor={colors.textLight}
              />
            )}
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.label}>Notatki</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={value}
                onChangeText={onChange}
                placeholder="Dodatkowe notatki"
                placeholderTextColor={colors.textLight}
                multiline
                textAlignVertical="top"
              />
            )}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Przypomnienia</Text>
          <TouchableOpacity onPress={handleAddReminder}>
            <Text style={styles.addReminderText}>+ Dodaj</Text>
          </TouchableOpacity>
        </View>

        {reminders.map((reminder) => (
          <ReminderPicker
            key={reminder.id}
            reminder={reminder}
            onUpdate={(updates) => handleUpdateReminder(reminder.id, updates)}
            onRemove={() => handleRemoveReminder(reminder.id)}
          />
        ))}

        {reminders.length === 0 && (
          <View style={styles.noRemindersContainer}>
            <Text style={styles.noRemindersText}>Brak przypomnień</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Zapisz zmiany' : 'Dodaj wydarzenie'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  addReminderText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  formField: {
    marginBottom: spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  typeButtonTextActive: {
    color: colors.textInverse,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  dateInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateInputText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  noRemindersContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  noRemindersText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  footer: {
    height: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default EventFormScreen;
