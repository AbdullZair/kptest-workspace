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
import { useGetMaterialsQuery } from '../api/materialApi';
import { MaterialCard } from '../components/MaterialCard';
import { colors, spacing, typography, borderRadius } from '@app/theme';
import type { Material } from '../api/types';

interface MaterialsScreenNavigationProps {
  navigate: (screen: string, params?: { materialId: string }) => void;
}

type FilterType = 'all' | 'article' | 'pdf' | 'image' | 'video' | 'audio' | 'link';
type StatusFilter = 'all' | 'read' | 'unread';

export function MaterialsScreen(): JSX.Element {
  const navigation = useNavigation<MaterialsScreenNavigationProps>();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useGetMaterialsQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMaterialPress = (materialId: string) => {
    navigation.navigate('MaterialDetail', { materialId });
  };

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'article', label: 'Artykuły' },
    { value: 'pdf', label: 'PDF' },
    { value: 'image', label: 'Obrazy' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'link', label: 'Linki' },
  ];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie materiałów...</Text>
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
          placeholder="Szukaj materiałów..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = typeFilter === item.value;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setTypeFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <View style={styles.statusFilterContainer}>
        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            statusFilter === 'all' && styles.statusFilterButtonActive,
          ]}
          onPress={() => setStatusFilter('all')}
        >
          <Text
            style={[
              styles.statusFilterText,
              statusFilter === 'all' && styles.statusFilterTextActive,
            ]}
          >
            Wszystkie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            statusFilter === 'unread' && styles.statusFilterButtonActive,
          ]}
          onPress={() => setStatusFilter('unread')}
        >
          <Text
            style={[
              styles.statusFilterText,
              statusFilter === 'unread' && styles.statusFilterTextActive,
            ]}
          >
            Nieprzeczytane
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusFilterButton,
            statusFilter === 'read' && styles.statusFilterButtonActive,
          ]}
          onPress={() => setStatusFilter('read')}
        >
          <Text
            style={[
              styles.statusFilterText,
              statusFilter === 'read' && styles.statusFilterTextActive,
            ]}
          >
            Przeczytane
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.materials || []}
        renderItem={({ item }) => (
          <MaterialCard material={item} onPress={() => handleMaterialPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak materiałów</Text>
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
    backgroundColor: colors.surface,
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
  filterRow: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  filterList: {
    paddingHorizontal: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
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
  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  statusFilterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  statusFilterButtonActive: {
    backgroundColor: colors.primaryLight + '20',
  },
  statusFilterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  statusFilterTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  listContent: {
    paddingVertical: spacing.md,
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

export default MaterialsScreen;
