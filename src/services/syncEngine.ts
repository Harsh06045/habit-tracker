import { isOnline, addNetworkListener } from './network';
import { syncQueue } from './syncQueue';
import { api } from './api';
import type { SyncBatchResult } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type SyncListener = (status: SyncStatus, pendingCount: number, message?: string) => void;
type IdMappingHandler = (mappings: Record<string, number>) => void;

let currentStatus: SyncStatus = 'idle';
const listeners: Set<SyncListener> = new Set();
const idMappingHandlers: Set<IdMappingHandler> = new Set();
let onSyncCompleteCallback: (() => Promise<void>) | null = null;

function setStatus(status: SyncStatus, pendingCount: number, message?: string) {
  currentStatus = status;
  listeners.forEach((l) => {
    try {
      l(status, pendingCount, message);
    } catch (e) {
      console.warn('[SyncEngine] Listener error:', e);
    }
  });
}

export const syncEngine = {
  getStatus(): SyncStatus {
    return currentStatus;
  },

  addListener(listener: SyncListener): () => void {
    listeners.add(listener);
    // Initial emission
    syncQueue.count().then((count) => listener(currentStatus, count));
    return () => {
      listeners.delete(listener);
    };
  },

  onIdMappings(handler: IdMappingHandler): () => void {
    idMappingHandlers.add(handler);
    return () => {
      idMappingHandlers.delete(handler);
    };
  },

  registerRefreshHandler(callback: () => Promise<void>): void {
    onSyncCompleteCallback = callback;
  },

  /**
   * Process all queued operations and synchronize with the Spring Boot backend
   */
  async syncNow(): Promise<SyncBatchResult | null> {
    if (!isOnline()) {
      const count = await syncQueue.count();
      setStatus('idle', count, 'Offline — changes stored locally');
      return null;
    }

    const operations = await syncQueue.getAll();
    if (operations.length === 0) {
      setStatus('idle', 0);
      return null;
    }

    if (currentStatus === 'syncing') {
      return null; // Already running
    }

    try {
      setStatus('syncing', operations.length, `Syncing ${operations.length} pending changes...`);
      console.log(`[SyncEngine] Sending batch sync of ${operations.length} operations to backend`);

      const result = await api.sync.batchSync(operations);

      // Notify ID mapping handlers so state can remap temporary client IDs to server IDs
      if (result.idMappings && Object.keys(result.idMappings).length > 0) {
        idMappingHandlers.forEach((handler) => {
          try {
            handler(result.idMappings);
          } catch (e) {
            console.warn('[SyncEngine] ID mapping handler error:', e);
          }
        });
      }

      // Remove synced operations from the queue
      const opIds = operations.map((op) => op.id);
      await syncQueue.remove(opIds);

      const remaining = await syncQueue.count();
      setStatus('synced', remaining, `Synced ${result.replayedCount} changes!`);

      // Refresh habits from backend to ensure state parity
      if (onSyncCompleteCallback) {
        await onSyncCompleteCallback();
      }

      // Return status to idle after a short delay
      setTimeout(async () => {
        const c = await syncQueue.count();
        setStatus('idle', c);
      }, 3000);

      return result;
    } catch (err: any) {
      console.warn('[SyncEngine] Batch sync failed:', err);
      const count = await syncQueue.count();
      setStatus('error', count, 'Sync failed, will retry when connection is restored');
      return null;
    }
  },
};

// Automatically trigger synchronization whenever network transitions to online
addNetworkListener((online) => {
  if (online) {
    console.log('[SyncEngine] Network restored! Triggering sync...');
    syncEngine.syncNow();
  }
});
