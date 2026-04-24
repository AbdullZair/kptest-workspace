import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGetPatientQuery, useDeletePatientMutation } from '../api/patientApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';

interface PatientDetailRouteParams {
  patientId: string;
}

interface PatientDetailNavigationProps {
  navigate: (screen: string, params?: { patientId: string }) => void;
  goBack: () => void;
}

export function PatientDetailScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<PatientDetailNavigationProps>();
  const { patientId } = route.params as PatientDetailRouteParams;
  const { data: patient, isLoading, isError } = useGetPatientQuery(patientId);
  const [deletePatient] = useDeletePatientMutation();

  const handleEditPress = () => {
    navigation.navigate('PatientForm', { patientId });
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Usuń pacjenta',
      `Czy na pewno chcesz usunąć pacjenta ${patient?.firstName} ${patient?.lastName}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deletePatient(patientId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie danych pacjenta...</Text>
      </View>
    );
  }

  if (isError || !patient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Wystąpił błąd podczas ładowania</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Wróć</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.patientName}>
            {patient.firstName} {patient.lastName}
          </Text>
          <Text style={styles.patientPesel}>PESEL: {patient.pesel}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
            <Text style={styles.actionButtonText}>Edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeletePress}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Usuń
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dane kontaktowe */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dane kontaktowe</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{patient.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telefon:</Text>
            <Text style={styles.infoValue}>{patient.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data urodzenia:</Text>
            <Text style={styles.infoValue}>{patient.dateOfBirth}</Text>
          </View>
        </View>
      </View>

      {/* Adres */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Adres</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ulica:</Text>
            <Text style={styles.infoValue}>{patient.address.street}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kod pocztowy:</Text>
            <Text style={styles.infoValue}>{patient.address.postalCode}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miasto:</Text>
            <Text style={styles.infoValue}>{patient.address.city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kraj:</Text>
            <Text style={styles.infoValue}>{patient.address.country}</Text>
          </View>
        </View>
      </View>

      {/* Kontakt awaryjny */}
      {patient.emergencyContact && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontakt awaryjny</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Imię i nazwisko:</Text>
              <Text style={styles.infoValue}>{patient.emergencyContact.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefon:</Text>
              <Text style={styles.infoValue}>{patient.emergencyContact.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relacja:</Text>
              <Text style={styles.infoValue}>
                {patient.emergencyContact.relationship}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Projekty terapeutyczne */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projekty terapeutyczne</Text>
        {patient.activeProjects.length > 0 ? (
          patient.activeProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() =>
                navigation.navigate('ProjectDetail', { projectId: project.id })
              }
              activeOpacity={0.7}
            >
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{project.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    project.status === 'active' && styles.statusActive,
                    project.status === 'completed' && styles.statusCompleted,
                    project.status === 'archived' && styles.statusArchived,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {project.status === 'active' && 'Aktywny'}
                    {project.status === 'completed' && 'Zakończony'}
                    {project.status === 'archived' && 'Zarchiwizowany'}
                  </Text>
                </View>
              </View>
              <Text style={styles.projectDate}>
                Rozpoczęcie: {project.startDate}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyProjects}>
            <Text style={styles.emptyProjectsText}>
              Brak aktywnych projektów
            </Text>
          </View>
        )}
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
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameContainer: {
    marginBottom: spacing.md,
  },
  patientName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  patientPesel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  deleteButtonText: {
    color: colors.textInverse,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    width: 120,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  projectCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  projectName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusActive: {
    backgroundColor: colors.successLight,
  },
  statusCompleted: {
    backgroundColor: colors.infoLight,
  },
  statusArchived: {
    backgroundColor: colors.backgroundSecondary,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  projectDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyProjects: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  emptyProjectsText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
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
    fontSize: typography.fontSize.md,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default PatientDetailScreen;
