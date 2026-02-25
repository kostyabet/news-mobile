
import React, { useEffect, useState, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkContext } from './NetworkContext'

interface NetworkProviderProps {
    children: ReactNode;
    checkInterval?: number;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
                                                                    children,
                                                                    checkInterval = 30000 // по умолчанию проверяем каждые 30 секунд
                                                                }) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
    const [connectionType, setConnectionType] = useState<string | null>(null);
    const [connectionDetails, setConnectionDetails] = useState<NetInfoState | null>(null);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const checkConnection = async (): Promise<null | boolean> => {
        try {
            const state = await NetInfo.fetch();

            setIsConnected(state.isConnected);
            setIsInternetReachable(state.isInternetReachable);
            setConnectionType(state.type);
            setConnectionDetails(state);
            setLastChecked(new Date());

            return state.isConnected && state.isInternetReachable === true;
        } catch (error) {
            console.error('Error checking network connection:', error);
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;
        let intervalId: number;

        const unsubscribe = NetInfo.addEventListener(state => {
            if (mounted) {
                setIsConnected(state.isConnected);
                setIsInternetReachable(state.isInternetReachable);
                setConnectionType(state.type);
                setConnectionDetails(state);
                setLastChecked(new Date());
            }
        });

        checkConnection();

        if (checkInterval > 0) {
            intervalId = setInterval(() => {
                checkConnection();
            }, checkInterval);
        }

        return () => {
            mounted = false;
            unsubscribe();
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [checkInterval]);

    return (
        <NetworkContext.Provider value={{
            isConnected,
            isInternetReachable,
            connectionType,
            connectionDetails,
            checkConnection,
            lastChecked
        }}>
            {children}
        </NetworkContext.Provider>
    );
};