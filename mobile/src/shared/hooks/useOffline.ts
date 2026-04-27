import { useState, useEffect } from 'react';
import { OfflineService, type OfflineState } from '../services/OfflineService';

export function useOffline(): OfflineState {
  const [state, setState] = useState<OfflineState>(OfflineService.getState());

  useEffect(() => {
    const unsubscribe = OfflineService.subscribe((newState) => {
      setState({ ...newState });
    });

    return unsubscribe;
  }, []);

  return state;
}

export default useOffline;
