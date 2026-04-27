import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOffline } from '@shared/hooks/useOffline';
import { OfflineService } from '@shared/services/OfflineService';
import { colors, spacing, typography, borderRadius, shadows } from '@app/theme';
import { ACCESSIBILITY_LABELS } from '@shared/utils/accessibility';
import { AccessibleButton } from '@shared/components/AccessibleButton';
import { checkNetworkConnectivity } from '@shared/utils/network';

interface OfflineModeScreenNavigationProps {
  goBack: () => void;
}

export function OfflineModeScreen(): JSX.Element {
  const navigation = useNavigation<OfflineModeScreenNavigationProps>();
  const { isOnline, queue, lastSyncTime, isSyncing } = useOffline();
  const [networkType, setNetworkType] = React.useState<string>('...');

  React.useEffect(() => {
    checkNetworkConnectivity().then((state) => {
      setNetworkType(state.type);
    });
  }, [isOnline]);

  const handleSync = async () => {
    try {
      await OfflineService.syncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleClearQueue = () => {
    OfflineService.clearQueue();
  };

  const formatSyncTime = (timestamp: number | null) => {
    if (!timestamp) return 'Nigdy';
    return new Date(timestamp).toLocaleString('pl-PL');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status połączenia</Text>
        <View
          style={[
            styles.statusCard,
            isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
        >
          <Text style={styles.statusIcon}>{isOnline ? '🟢' : '🔴'}</Text>
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>
              {isOnline ? 'Połączono z internetem' : 'Brak połączenia'}
            </Text>
            <Text style={styles.statusSubtext}>Typ: {networkType}</Text>
          </View>
        </View>
      </View>

      {/* Sync Queue */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kolejka synchronizacji</Text>
        <View style={styles.infoCard}>
          <View style={styles.queueRow}>
            <Text style={styles.queueLabel}>Oczekujące akcje:</Text>
            <Text style={styles.queueValue}>{queue.length}</Text>
          </View>
          <View style={styles.queueRow}>
            <Text style={styles.queueLabel}>Ostatnia synchronizacja:</Text>
            <Text style={styles.queueValue}>{formatSyncTime(lastSyncTime)}</Text>
          </View>
          <View style={styles.queueRow}>
            <Text style={styles.queueLabel}>Status:</Text>
            <Text style={styles.queueValue}>
              {isSyncing ? 'Synchronizacja...' : 'Gotowy'}
            </Text>
          </View>
          {isSyncing && (
            <View style={styles.syncingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.syncingText}>Trwa synchronizacja...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Queue Items */}
      {queue.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elementy w kolejce</Text>
          <View style={styles.queueList}>
            {queue.map((item, index) => (
              <View key={item.id} style={styles.queueItem}>
                <View style={styles.queueItemIcon}>
                  <Text style={styles.queueItemIconText}>📝</Text>
                </View>
                <View style={styles.queueItemInfo}>
                  <Text style={styles.queueItemType}>{item.type}</Text>
                  <Text style={styles.queueItemTime}>
                    {new Date(item.timestamp).toLocaleString('pl-PL')}
                  </Text>
                </View>
                {item.retryCount > 0 && (
                  <View style={styles.retryBadge}>
                    <Text style={styles.retryBadgeText}>
                      {item.retryCount}x
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Offline Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dostępne offline</Text>
        <View style={styles.featuresCard}>
          <FeatureItem
            icon="📅"
            label="Kalendarz"
            description="Podgląd wydarzeń"
          />
          <View style={styles.featureSeparator} />
          <FeatureItem
            icon="📚"
            label="Materiały"
            description="Pobrane pliki"
          />
          <View style={styles.featureSeparator} />
          <FeatureItem
            icon="💬"
            label="Wiadomości"
            description="Historia konwersacji"
          />
          <View style={styles.featureSeparator} />
          <FeatureItem
            icon="📊"
            label="Statystyki"
            description="Ostatnie dane"
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isOnline && queue.length > 0 && (
          <AccessibleButton
            onPress={handleSync}
            label="Spróbuj synchronizować"
            variant="primary"
            style={styles.actionButton}
            disabled={isSyncing}
          />
        )}
        {queue.length > 0 && (
          <AccessibleButton
            onPress={handleClearQueue}
            label="Wyczyść kolejkę"
            variant="outline"
            style={styles.actionButton}
            disabled={isSyncing}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            W trybie offline możesz przeglądać wcześniej załadowane dane. Akcje
            wymagające połączenia są kolejkowane i synchronizowane automatycznie
            po przywróceniu łączności.
          </Text>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

interface FeatureItemProps {
  icon: string;
  label: string;
  description: string;
}

function FeatureItem({ icon, label, description }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureInfo}>
        <Text style={styles.featureLabel}>{label}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
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
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statusOnline: {
    backgroundColor: colors.successLight + '30',
  },
  statusOffline: {
    backgroundColor: colors.errorLight + '30',
  },
  statusIcon: {
    fontSize: typography.fontSize.xxl,
    marginRight: spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  statusSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  queueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  queueLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  queueValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  syncingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  syncingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  queueList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  queueItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  queueItemIconText: {
    fontSize: typography.fontSize.lg,
  },
  queueItemInfo: {
    flex: 1,
  },
  queueItemType: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  queueItemTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  retryBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  retryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    padding: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  featureSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  infoIcon: {
    fontSize: typography.fontSize.xl,
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    height: spacing.xxl,
  },
});

export default OfflineModeScreen;
