import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetworkStateType;
}

export type NetworkStateType =
  | 'cellular'
  | 'wifi'
  | 'bluetooth'
  | 'ethernet'
  | 'wimax'
  | 'none'
  | 'unknown'
  | 'other';

export async function checkNetworkConnectivity(): Promise<NetworkState> {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
  };
}

export function getNetworkTypeLabel(type: NetworkStateType): string {
  const labels: Record<NetworkStateType, string> = {
    cellular: 'Sieć komórkowa',
    wifi: 'WiFi',
    bluetooth: 'Bluetooth',
    ethernet: 'Ethernet',
    wimax: 'WiMAX',
    none: 'Brak połączenia',
    unknown: 'Nieznane',
    other: 'Inne',
  };
  return labels[type] || type;
}

export async function waitForNetwork(timeout: number = 30000): Promise<boolean> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        unsubscribe();
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        unsubscribe();
        resolve(false);
      }
    });

    // Check immediately
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        unsubscribe();
        resolve(true);
      }
    });
  });
}

export default checkNetworkConnectivity;
