import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SyncOperation, SyncOpType, BackendHabitRequest } from '../types';

const SYNC_QUEUE_KEY = '@habit_tracker/sync_queue';

let inMemoryQueue: SyncOperation[] | null = null;

async function loadQueue(): Promise<SyncOperation[]> {
  if (inMemoryQueue !== null) return inMemoryQueue;
  try {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    inMemoryQueue = data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('[SyncQueue] Failed to load queue from storage:', err);
    inMemoryQueue = [];
  }
  return inMemoryQueue!;
}

async function persistQueue(queue: SyncOperation[]): Promise<void> {
  inMemoryQueue = queue;
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[SyncQueue] Failed to persist queue:', err);
  }
}

export const syncQueue = {
  /**
   * Get all operations currently in the queue
   */
  async getAll(): Promise<SyncOperation[]> {
    return loadQueue();
  },

  /**
   * Get number of operations awaiting synchronization
   */
  async count(): Promise<number> {
    const queue = await loadQueue();
    return queue.length;
  },

  /**
   * Enqueue a new mutation operation
   */
  async enqueue(op: {
    type: SyncOpType;
    tempId?: string;
    habitId?: number;
    date?: string;
    habitData?: BackendHabitRequest;
  }): Promise<SyncOperation> {
    const queue = await loadQueue();
    const newOp: SyncOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      ...op,
    };
    queue.push(newOp);
    await persistQueue(queue);
    console.log(`[SyncQueue] Enqueued operation: ${newOp.type} (Queue size: ${queue.length})`);
    return newOp;
  },

  /**
   * Remove specific operations from the queue by ID
   */
  async remove(operationIds: string[]): Promise<void> {
    const queue = await loadQueue();
    const idSet = new Set(operationIds);
    const updated = queue.filter((op) => !idSet.has(op.id));
    await persistQueue(updated);
  },

  /**
   * Clear the entire queue
   */
  async clear(): Promise<void> {
    await persistQueue([]);
  },
};
