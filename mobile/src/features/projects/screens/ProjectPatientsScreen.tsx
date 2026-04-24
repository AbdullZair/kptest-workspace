import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  useGetProjectPatientsQuery,
  useRemovePatientFromProjectMutation,
} from '../api/projectApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { ProjectPatient } from '../api/types';

interface ProjectPatientsRouteParams {
  projectId: string;
}

interface ProjectPatientsNavigationProps {
  navigate: (screen: string, params?: { patientId: string }) => void;
  goBack: () => void;
}

export function ProjectPatientsScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<ProjectPatientsNavigationProps>();
  const { projectId } = route.params as ProjectPatientsRouteParams;
  const { data, isLoading, isError, refetch } = useGetProjectPatientsQuery(projectId);
  const [removePatient] = useRemovePatientFromProjectMutation();

  const handlePatientPress = (patientId: string) => {
    navigation.navigate('PatientDetail', { patientId });
  };

  const handleRemovePatient = (patientId: string, patientName: string) => {
    Alert.alert(
      'Usuń pacjenta z projektu',
      `Czy na pewno chcesz usunąć pacjenta ${patientName} z tego projektu?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await removePatient({ projectId, patientId });
            refetch();
          },
        },
      ]
    );
  };

  const renderPatient = ({ item }: { item: ProjectPatient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => handlePatientPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.patientPesel}>PESEL: {item.pesel}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <View
            style={[
              styles.statusBadge,
              item.status === 'active' && styles.statusActive,
              item.status === 'completed' && styles.statusCompleted,
              item.status === 'discharged' && styles.statusDischarged,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'active' && styles.statusActiveText,
                item.status === 'completed' && styles.statusCompletedText,
                item.status === 'discharged' && styles.statusDischargedText,
              ]}
            >
              {item.status === 'active' && 'Aktywny'}
              {item.status === 'completed' && 'Zakończony'}
              {item.status === 'discharged' && 'Wypisany'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              handleRemovePatient(item.id, `${item.firstName} ${item.lastName}`)
            }
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.enrolledDate}>
        Dołączony: {item.enrolledAt}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie pacjentów...</Text>
      </View>
    );
  }

  if (isError) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pacjenci w projekcie</Text>
        <Text style={styles.headerSubtitle}>
          {data?.total || 0} pacjentów
        </Text>
      </View>

      <FlatList
        data={data?.patients || []}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak pacjentów w tym projekcie</Text>
          </View>
        }
      />
    </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  patientCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  patientPesel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  statusDischarged: {
    backgroundColor: colors.backgroundSecondary,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  statusActiveText: {
    color: colors.success,
  },
  statusCompletedText: {
    color: colors.info,
  },
  statusDischargedText: {
    color: colors.textSecondary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    lineHeight: 24,
  },
  enrolledDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default ProjectPatientsScreen;
