import { renderHook, act } from '@testing-library/react-native';
import { useOffline } from '../useOffline';
import { OfflineService } from '../services/OfflineService';

// Mock OfflineService
jest.mock('../services/OfflineService', () => ({
  OfflineService: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

describe('useOffline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns current offline state', () => {
    const mockState = {
      isOnline: true,
      queue: [],
      lastSyncTime: null,
      isSyncing: false,
    };
    
    (OfflineService.getState as jest.Mock).mockReturnValue(mockState);
    (OfflineService.subscribe as jest.Mock).mockImplementation(() => () => {});

    const { result } = renderHook(() => useOffline());
    
    expect(result.current).toEqual(mockState);
  });

  it('subscribes to state changes', () => {
    const mockState = {
      isOnline: true,
      queue: [],
      lastSyncTime: null,
      isSyncing: false,
    };
    
    let listener: ((state: any) => void) | null = null;
    (OfflineService.getState as jest.Mock).mockReturnValue(mockState);
    (OfflineService.subscribe as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return () => {};
    });

    const { result } = renderHook(() => useOffline());
    
    expect(OfflineService.subscribe).toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const mockState = {
      isOnline: true,
      queue: [],
      lastSyncTime: null,
      isSyncing: false,
    };
    
    const unsubscribeMock = jest.fn();
    (OfflineService.getState as jest.Mock).mockReturnValue(mockState);
    (OfflineService.subscribe as jest.Mock).mockImplementation(() => unsubscribeMock);

    const { unmount } = renderHook(() => useOffline());
    unmount();
    
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
