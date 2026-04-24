import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreateThreadMutation } from '../api/messageApi';
import { useGetPatientsQuery } from '../../patients/api/patientApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';

interface NewMessageNavigationProps {
  goBack: () => void;
  navigate: (screen: string, params?: { threadId: string }) => void;
}

interface PatientItem {
  id: string;
  firstName: string;
  lastName: string;
  selected: boolean;
}

export function NewMessageScreen(): JSX.Element {
  const navigation = useNavigation<NewMessageNavigationProps>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [createThread] = useCreateThreadMutation();
  const { data: patientsData, isLoading } = useGetPatientsQuery({ limit: 100 });

  const handlePatientToggle = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSend = async () => {
    if (selectedPatients.length === 0 || !message.trim()) return;

    try {
      const result = await createThread({
        participantIds: selectedPatients,
        subject: subject.trim() || undefined,
      }).unwrap();
      navigation.navigate('Conversation', { threadId: result.id });
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const renderPatient = ({ item }: { item: PatientItem }) => {
    const isSelected = selectedPatients.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.patientItem, isSelected && styles.patientItemSelected]}
        onPress={() => handlePatientToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>
            {item.firstName[0]}
            {item.lastName[0]}
          </Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const patients =
    patientsData?.patients.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      selected: false,
    })) || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Odbiorcy</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={patients}
            renderItem={renderPatient}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.patientsList}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Temat (opcjonalne)</Text>
        <TextInput
          style={styles.input}
          placeholder="Wprowadź temat"
          placeholderTextColor={colors.textLight}
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Wiadomość</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Napisz wiadomość..."
          placeholderTextColor={colors.textLight}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Anuluj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            (selectedPatients.length === 0 || !message.trim()) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={selectedPatients.length === 0 || !message.trim()}
        >
          <Text style={styles.submitButtonText}>Wyślij</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  patientsList: {
    paddingRight: spacing.md,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patientItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  patientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  patientAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  patientInfo: {
    marginRight: spacing.sm,
  },
  patientName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: typography.fontSize.xs,
    color: colors.textInverse,
    fontWeight: typography.fontWeight.bold,
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
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
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
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
});

export default NewMessageScreen;
