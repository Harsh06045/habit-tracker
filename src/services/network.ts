import { Platform } from 'react-native';

type NetworkListener = (isOnline: boolean) => void;

let simulatedOffline = false;
const listeners: Set<NetworkListener> = new Set();

/**
 * Check if the app currently has network access (factoring in manual simulation toggle)
 */
export function isOnline(): boolean {
  if (simulatedOffline) return false;
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Toggle simulated offline mode (useful for testing & demoing offline functionality)
 */
export function setSimulatedOffline(offline: boolean): void {
  simulatedOffline = offline;
  notifyListeners();
}

export function isSimulatedOffline(): boolean {
  return simulatedOffline;
}

function notifyListeners(): void {
  const currentOnline = isOnline();
  listeners.forEach((listener) => {
    try {
      listener(currentOnline);
    } catch (e) {
      console.warn('[Network] Listener error:', e);
    }
  });
}

/**
 * Subscribe to online/offline network changes
 */
export function addNetworkListener(listener: NetworkListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Attach browser event listeners when running on web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Network] Browser is online');
    notifyListeners();
  });

  window.addEventListener('offline', () => {
    console.log('[Network] Browser is offline');
    notifyListeners();
  });
}
