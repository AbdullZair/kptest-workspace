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
import { useGetProjectQuery, useDeleteProjectMutation } from '../api/projectApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';

interface ProjectDetailRouteParams {
  projectId: string;
}

interface ProjectDetailNavigationProps {
  navigate: (screen: string, params?: { projectId: string; patientId?: string }) => void;
  goBack: () => void;
}

export function ProjectDetailScreen(): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation<ProjectDetailNavigationProps>();
  const { projectId } = route.params as ProjectDetailRouteParams;
  const { data: project, isLoading, isError } = useGetProjectQuery(projectId);
  const [deleteProject] = useDeleteProjectMutation();

  const handleEditPress = () => {
    navigation.navigate('ProjectForm', { projectId });
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Usuń projekt',
      `Czy na pewno chcesz usunąć projekt ${project?.name}?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await deleteProject(projectId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleViewPatientsPress = () => {
    navigation.navigate('ProjectPatients', { projectId });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie danych projektu...</Text>
      </View>
    );
  }

  if (isError || !project) {
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
          <Text style={styles.projectName}>{project.name}</Text>
          <View
            style={[
              styles.statusBadge,
              project.status === 'active' && styles.statusActive,
              project.status === 'completed' && styles.statusCompleted,
              project.status === 'archived' && styles.statusArchived,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                project.status === 'active' && styles.statusActiveText,
                project.status === 'completed' && styles.statusCompletedText,
                project.status === 'archived' && styles.statusArchivedText,
              ]}
            >
              {project.status === 'active' && 'Aktywny'}
              {project.status === 'completed' && 'Zakończony'}
              {project.status === 'archived' && 'Zarchiwizowany'}
            </Text>
          </View>
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

      {/* Opis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opis projektu</Text>
        <View style={styles.infoCard}>
          <Text style={styles.description}>{project.description}</Text>
        </View>
      </View>

      {/* Daty */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Harmonogram</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data rozpoczęcia:</Text>
            <Text style={styles.infoValue}>{project.startDate}</Text>
          </View>
          {project.endDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data zakończenia:</Text>
              <Text style={styles.infoValue}>{project.endDate}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Cele terapii */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cele terapii</Text>
        {project.goals.length > 0 ? (
          <View style={styles.infoCard}>
            {project.goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={styles.goalBullet} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Brak zdefiniowanych celów</Text>
          </View>
        )}
      </View>

      {/* Pacjenci */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pacjenci</Text>
          <TouchableOpacity onPress={handleViewPatientsPress}>
            <Text style={styles.seeAllText}>Zobacz wszystkich</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.patientsCard}
          onPress={handleViewPatientsPress}
          activeOpacity={0.7}
        >
          <View style={styles.patientsContent}>
            <View style={styles.patientsIcon}>
              <Text style={styles.patientsIconText}>{project.patientCount}</Text>
            </View>
            <View style={styles.patientsInfo}>
              <Text style={styles.patientsLabel}>Pacjentów w projekcie</Text>
              <Text style={styles.patientsSubtext}>Dotknij, aby zobaczyć listę</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Zespół opieki */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zespół opieki</Text>
        {project.careTeam.length > 0 ? (
          <View style={styles.infoCard}>
            {project.careTeam.map((member) => (
              <View key={member.id} style={styles.teamMember}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.firstName[0]}{member.lastName[0]}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {member.firstName} {member.lastName}
                  </Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
                <View style={styles.memberContact}>
                  {member.phone && (
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                  )}
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Brak członków zespołu</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  projectName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
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
  statusActiveText: {
    color: colors.success,
  },
  statusCompletedText: {
    color: colors.info,
  },
  statusArchivedText: {
    color: colors.textSecondary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 22,
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
    width: 140,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  goalBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  goalText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  patientsCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  patientsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  patientsIconText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  patientsInfo: {
    flex: 1,
  },
  patientsLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  patientsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  memberAvatarText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  memberRole: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  memberContact: {
    alignItems: 'flex-end',
  },
  memberPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  memberEmail: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyText: {
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

export default ProjectDetailScreen;
