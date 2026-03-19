import { createContext } from "react";
import { NetInfoState } from "@react-native-community/netinfo";

export interface NetworkContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  connectionDetails: NetInfoState | null;
  checkConnection: () => Promise<boolean | null>;
  lastChecked: Date | null;
}

export const NetworkContext = createContext<NetworkContextType | undefined>(
  undefined,
);
