import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetProjectsQuery } from '../api/projectApi';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import type { Project } from '../api/types';

interface ProjectsScreenNavigationProps {
  navigate: (screen: string, params?: { projectId: string }) => void;
}

export function ProjectsScreen(): JSX.Element {
  const navigation = useNavigation<ProjectsScreenNavigationProps>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const { data, isLoading, isError, refetch, isFetching } = useGetProjectsQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleProjectPress = (projectId: string) => {
    navigation.navigate('ProjectDetail', { projectId });
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => handleProjectPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectNameContainer}>
          <Text style={styles.projectName}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === 'active' && styles.statusActive,
              item.status === 'completed' && styles.statusCompleted,
              item.status === 'archived' && styles.statusArchived,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'active' && styles.statusActiveText,
                item.status === 'completed' && styles.statusCompletedText,
                item.status === 'archived' && styles.statusArchivedText,
              ]}
            >
              {item.status === 'active' && 'Aktywny'}
              {item.status === 'completed' && 'Zakończony'}
              {item.status === 'archived' && 'Zarchiwizowany'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.projectInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rozpoczęcie:</Text>
          <Text style={styles.infoValue}>{item.startDate}</Text>
        </View>
        {item.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Zakończenie:</Text>
            <Text style={styles.infoValue}>{item.endDate}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pacjenci:</Text>
          <Text style={styles.infoValue}>{item.patientCount}</Text>
        </View>
      </View>

      {item.goals.length > 0 && (
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsLabel}>Cele terapii:</Text>
          {item.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
          {item.goals.length > 2 && (
            <Text style={styles.moreGoalsText}>+{item.goals.length - 2} więcej</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie projektów...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Wystąpił błąd podczas ładowania</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj projektów..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            Wszystkie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'active' && styles.filterChipActive]}
          onPress={() => setStatusFilter('active')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'active' && styles.filterChipTextActive,
            ]}
          >
            Aktywne
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'completed' && styles.filterChipActive]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'completed' && styles.filterChipTextActive,
            ]}
          >
            Zakończone
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'archived' && styles.filterChipActive]}
          onPress={() => setStatusFilter('archived')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'archived' && styles.filterChipTextActive,
            ]}
          >
            Zarchiwizowane
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.projects || []}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak projektów</Text>
          </View>
        }
        onEndReached={() => {
          if (data && page < data.totalPages) {
            setPage(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
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
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  projectCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  projectNameContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
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
  projectDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  projectInfo: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    width: 90,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  goalsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  goalsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  goalItem: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  goalText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
  },
  moreGoalsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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

export default ProjectsScreen;
