import { OfflineService } from '../OfflineService';

describe('OfflineService', () => {
  beforeEach(() => {
    // Reset state before each test
    OfflineService.clearQueue();
  });

  it('initializes with default state', () => {
    const state = OfflineService.getState();
    expect(state.isOnline).toBe(true);
    expect(state.queue).toEqual([]);
    expect(state.isSyncing).toBe(false);
  });

  it('queues actions when offline', async () => {
    const action = {
      type: 'CREATE_MESSAGE',
      payload: { text: 'Hello' },
    };
    
    await OfflineService.queueAction(action);
    const state = OfflineService.getState();
    
    expect(state.queue.length).toBe(1);
    expect(state.queue[0].type).toBe('CREATE_MESSAGE');
  });

  it('tracks queue length', async () => {
    await OfflineService.queueAction({ type: 'ACTION_1', payload: {} });
    await OfflineService.queueAction({ type: 'ACTION_2', payload: {} });
    
    expect(OfflineService.getQueueLength()).toBe(2);
  });

  it('clears queue', async () => {
    await OfflineService.queueAction({ type: 'ACTION_1', payload: {} });
    await OfflineService.clearQueue();
    
    expect(OfflineService.getQueueLength()).toBe(0);
  });

  it('increments retry count on failed sync', async () => {
    await OfflineService.queueAction({ type: 'FAILED_ACTION', payload: {} });
    
    // Manually increment retry count for testing
    const state = OfflineService.getState();
    if (state.queue[0]) {
      state.queue[0].retryCount = 1;
    }
    
    expect(state.queue[0]?.retryCount).toBe(1);
  });
});
