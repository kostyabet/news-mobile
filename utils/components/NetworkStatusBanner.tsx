import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNetwork } from "@/entities/network/useNetwork";
import { useTranslation } from "react-i18next";

interface NetworkStatusBannerProps {
  showDetails?: boolean;
  position?: "top" | "bottom";
  zIndex?: number;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  showDetails = false,
  position = "top",
  zIndex = 1000,
}) => {
  const { isConnected, isInternetReachable, connectionType, lastChecked } =
    useNetwork();
  const { t } = useTranslation();

  const getPositionStyle = () => {
    return position === "top" ? styles.topPosition : styles.bottomPosition;
  };

  const getNetworkStatusText = (
    type: string | null,
    isReachable: boolean | null,
  ): string => {
    if (!type) return t("network.checking");
    if (type === "none" || type === "unknown")
      return t("network.no-connection");
    if (isReachable === false) return t("network.unreachable");
    return `✓ ${t("network.type")} ${type}`;
  };

  if (isConnected === null) {
    return (
      <View
        style={[
          styles.banner,
          styles.checking,
          styles.absolute,
          getPositionStyle(),
          { zIndex },
        ]}
      >
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.checkingText}>{t("network.check")}</Text>
      </View>
    );
  }

  if (isConnected && isInternetReachable !== false) {
    if (!showDetails) return null;

    return (
      <View
        style={[
          styles.banner,
          styles.online,
          styles.absolute,
          getPositionStyle(),
          { zIndex },
        ]}
      >
        <Text style={styles.onlineText}>
          ✓ {t("network.type")} {connectionType}
        </Text>
        {lastChecked && (
          <Text style={styles.lastChecked}>
            {t("network.last")}: {lastChecked.toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.banner,
        isConnected ? styles.unstable : styles.offline,
        styles.absolute,
        getPositionStyle(),
        { zIndex },
      ]}
    >
      <Text style={styles.offlineText}>
        {getNetworkStatusText(connectionType, isInternetReachable)}
      </Text>
      {isConnected && isInternetReachable === false && (
        <Text style={styles.wifiText}>{t("network.without-access")}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  absolute: {
    position: "absolute",
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
    backgroundColor: "#f0f0f0",
  },
  online: {
    backgroundColor: "#4caf50",
  },
  offline: {
    backgroundColor: "#f44336",
  },
  unstable: {
    backgroundColor: "#ff9800",
  },
  onlineText: {
    color: "white",
    fontWeight: "bold",
  },
  offlineText: {
    color: "white",
    fontWeight: "bold",
  },
  checkingText: {
    color: "#666",
    marginLeft: 8,
  },
  wifiText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  lastChecked: {
    color: "white",
    fontSize: 10,
    marginTop: 2,
  },
});

export default NetworkStatusBanner;
