import {
  NetworkContext,
  NetworkContextType,
} from "@/entities/network/NetworkContext";
import { useContext } from "react";

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};
