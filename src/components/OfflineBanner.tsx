import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { isOnline, setSimulatedOffline, isSimulatedOffline, addNetworkListener } from '../services/network';
import { syncEngine, type SyncStatus } from '../services/syncEngine';
import { syncQueue } from '../services/syncQueue';
import { theme } from '../theme';

export function OfflineBanner() {
  const [online, setOnline] = useState(isOnline());
  const [simulated, setSimulated] = useState(isSimulatedOffline());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncEngine.getStatus());
  const [pendingCount, setPendingCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  useEffect(() => {
    // 1. Listen to network connectivity
    const unbindNetwork = addNetworkListener((isNowOnline) => {
      setOnline(isNowOnline);
      setSimulated(isSimulatedOffline());
    });

    // 2. Listen to sync engine events
    const unbindSync = syncEngine.addListener((status, count, msg) => {
      setSyncStatus(status);
      setPendingCount(count);
      if (msg) setStatusMessage(msg);
    });

    // Initial count
    syncQueue.count().then(setPendingCount);

    return () => {
      unbindNetwork();
      unbindSync();
    };
  }, []);

  const handleToggleOfflineSimulation = () => {
    const nextState = !simulated;
    setSimulatedOffline(nextState);
    setSimulated(nextState);
    setOnline(!nextState);
  };

  const handleManualSync = async () => {
    await syncEngine.syncNow();
  };

  // If online, no pending changes, and not in syncing/synced state, don't show full banner
  if (online && pendingCount === 0 && syncStatus !== 'syncing' && syncStatus !== 'synced') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bannerCard,
          !online ? styles.bannerOffline : syncStatus === 'synced' ? styles.bannerSynced : styles.bannerSyncing,
        ]}
      >
        <View style={styles.leftRow}>
          <View
            style={[
              styles.pulseDot,
              !online ? styles.pulseDotOffline : syncStatus === 'synced' ? styles.pulseDotSynced : styles.pulseDotSyncing,
            ]}
          />
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              {!online
                ? '⚡ Offline Mode'
                : syncStatus === 'syncing'
                ? '🔄 Syncing with Cloud...'
                : syncStatus === 'synced'
                ? '✅ Cloud Synchronized'
                : '📶 Network Online'}
            </Text>
            <Text style={styles.subText}>
              {!online
                ? pendingCount > 0
                  ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} queued locally`
                  : 'Actions will queue and sync on reconnect'
                : statusMessage || `${pendingCount} changes remaining`}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {online && pendingCount > 0 && syncStatus !== 'syncing' && (
            <TouchableOpacity style={styles.syncBtn} onPress={handleManualSync}>
              <Text style={styles.syncBtnText}>Sync Now</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.simBtn, simulated && styles.simBtnActive]}
            onPress={handleToggleOfflineSimulation}
          >
            <Text style={styles.simBtnText}>{simulated ? 'Go Online' : 'Simulate Offline'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  bannerCard: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    ...theme.shadows.card,
  },
  bannerOffline: {
    backgroundColor: '#1E1B18',
    borderColor: '#FF9500',
  },
  bannerSyncing: {
    backgroundColor: '#161E2E',
    borderColor: '#3B82F6',
  },
  bannerSynced: {
    backgroundColor: '#12241A',
    borderColor: '#25B76B',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pulseDotOffline: {
    backgroundColor: '#FF9500',
  },
  pulseDotSyncing: {
    backgroundColor: '#3B82F6',
  },
  pulseDotSynced: {
    backgroundColor: '#25B76B',
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: '#B8B2AC',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  syncBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
  },
  syncBtnText: {
    ...theme.typography.caption,
    color: '#FFF',
    fontWeight: '700',
    fontSize: 11,
  },
  simBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  simBtnActive: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderColor: '#FF9500',
  },
  simBtnText: {
    ...theme.typography.caption,
    color: '#EFECE7',
    fontWeight: '600',
    fontSize: 11,
  },
});

