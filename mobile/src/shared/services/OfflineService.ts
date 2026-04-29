import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineState {
  isOnline: boolean;
  queue: QueuedAction[];
  lastSyncTime: number | null;
  isSyncing: boolean;
}

const OFFLINE_QUEUE_KEY = '@kptest:offline_queue';
const OFFLINE_STATE_KEY = '@kptest:offline_state';
const MAX_RETRY_COUNT = 3;
const SYNC_INTERVAL = 30000; // 30 seconds

class OfflineServiceClass {
  private listeners: ((state: OfflineState) => void)[] = [];
  private state: OfflineState = {
    isOnline: true,
    queue: [],
    lastSyncTime: null,
    isSyncing: false,
  };
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    // Load persisted state
    try {
      const [queueStr, stateStr] = await AsyncStorage.multiGet([
        OFFLINE_QUEUE_KEY,
        OFFLINE_STATE_KEY,
      ]);

      if (queueStr[1]) {
        this.state.queue = JSON.parse(queueStr[1]);
      }
      if (stateStr[1]) {
        const persistedState = JSON.parse(stateStr[1]);
        this.state.lastSyncTime = persistedState.lastSyncTime;
      }
    } catch (error) {
      console.error('Failed to load offline state:', error);
    }

    // Listen to network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      this.handleNetworkChange(state.isConnected ?? false);
    });

    // Check initial network status
    const netState = await NetInfo.fetch();
    this.state.isOnline = netState.isConnected ?? true;

    // Start sync loop if online
    if (this.state.isOnline && this.state.queue.length > 0) {
      this.startSyncLoop();
    }

    // Store unsubscribe so callers can cancel the listener if needed.
    this.unsubscribeNet = () => unsubscribe();
  }

  private unsubscribeNet?: () => void;

  private handleNetworkChange(isConnected: boolean): void {
    const wasOnline = this.state.isOnline;
    this.state.isOnline = isConnected;

    if (!wasOnline && isConnected && this.state.queue.length > 0) {
      // Just came online, sync queue
      this.syncQueue();
    }

    this.persistState();
    this.notifyListeners();
  }

  async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${action.type}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.state.queue.push(queuedAction);
    await this.persistQueue();
    this.notifyListeners();

    // If online, try to sync immediately
    if (this.state.isOnline) {
      this.syncQueue();
    }
  }

  async syncQueue(): Promise<void> {
    if (this.state.isSyncing || !this.state.isOnline || this.state.queue.length === 0) {
      return;
    }

    this.state.isSyncing = true;
    this.notifyListeners();

    const failedActions: QueuedAction[] = [];

    for (const action of this.state.queue) {
      if (action.retryCount >= MAX_RETRY_COUNT) {
        // Max retries exceeded, keep in queue for manual retry
        failedActions.push(action);
        continue;
      }

      try {
        await this.executeAction(action);
        // Success - remove from queue
      } catch (error) {
        console.error('Failed to sync action:', action.type, error);
        action.retryCount += 1;
        failedActions.push(action);
      }
    }

    this.state.queue = failedActions;
    this.state.lastSyncTime = Date.now();
    this.state.isSyncing = false;

    await this.persistQueue();
    await this.persistState();
    this.notifyListeners();
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    // This should be called by RTK Query middleware
    // For now, we just simulate the execution
    return Promise.resolve();
  }

  async clearQueue(): Promise<void> {
    this.state.queue = [];
    await this.persistQueue();
    this.notifyListeners();
  }

  async retryFailedActions(): Promise<void> {
    for (const action of this.state.queue) {
      action.retryCount = 0;
    }
    await this.persistQueue();

    if (this.state.isOnline) {
      this.syncQueue();
    }
  }

  private startSyncLoop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && this.state.queue.length > 0) {
        this.syncQueue();
      }
    }, SYNC_INTERVAL);
  }

  stopSyncLoop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.state.queue));
    } catch (error) {
      console.error('Failed to persist queue:', error);
    }
  }

  private async persistState(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        OFFLINE_STATE_KEY,
        JSON.stringify({
          lastSyncTime: this.state.lastSyncTime,
        })
      );
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  getState(): OfflineState {
    return { ...this.state };
  }

  isOnline(): boolean {
    return this.state.isOnline;
  }

  getQueueLength(): number {
    return this.state.queue.length;
  }
}

export const OfflineService = new OfflineServiceClass();
export default OfflineService;
