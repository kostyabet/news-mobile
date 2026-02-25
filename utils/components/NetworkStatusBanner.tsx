import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {useNetwork} from "@/entities/network/useNetwork";
import {getNetworkStatusText} from "@/utils/network/utils";

interface NetworkStatusBannerProps {
    showDetails?: boolean;
    position?: 'top' | 'bottom';
    zIndex?: number;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
                                                                     showDetails = false,
                                                                     position = 'top',
                                                                     zIndex = 1000
                                                                 }) => {
    const { isConnected, isInternetReachable, connectionType, lastChecked } = useNetwork();

    const getPositionStyle = () => {
        return position === 'top' ? styles.topPosition : styles.bottomPosition;
    };

    if (isConnected === null) {
        return (
            <View style={[styles.banner, styles.checking, styles.absolute, getPositionStyle(), { zIndex }]}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.checkingText}>Checking connection...</Text>
            </View>
        );
    }

    if (isConnected && isInternetReachable !== false) {
        if (!showDetails) return null;

        return (
            <View style={[styles.banner, styles.online, styles.absolute, getPositionStyle(), { zIndex }]}>
                <Text style={styles.onlineText}>✓ Online via {connectionType}</Text>
                {lastChecked && (
                    <Text style={styles.lastChecked}>
                        Last checked: {lastChecked.toLocaleTimeString()}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.banner, isConnected ? styles.unstable : styles.offline, styles.absolute, getPositionStyle(), { zIndex }]}>
            <Text style={styles.offlineText}>
                {getNetworkStatusText(connectionType, isInternetReachable)}
            </Text>
            {isConnected && isInternetReachable === false && (
                <Text style={styles.wifiText}>Connected to WiFi but no internet access</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    absolute: {
        position: 'absolute',
        paddingTop: 55,
        left: 0,
        right: 0,
    },
    topPosition: {
        top: 0,
    },
    bottomPosition: {
        bottom: 0,
    },
    checking: {
        backgroundColor: '#f0f0f0',
    },
    online: {
        backgroundColor: '#4caf50',
    },
    offline: {
        backgroundColor: '#f44336',
    },
    unstable: {
        backgroundColor: '#ff9800',
    },
    onlineText: {
        color: 'white',
        fontWeight: 'bold',
    },
    offlineText: {
        color: 'white',
        fontWeight: 'bold',
    },
    checkingText: {
        color: '#666',
        marginLeft: 8,
    },
    wifiText: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
    },
    lastChecked: {
        color: 'white',
        fontSize: 10,
        marginTop: 2,
    },
});

export default NetworkStatusBanner;