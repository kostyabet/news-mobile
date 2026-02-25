export const getNetworkStatusText = (type: string | null, isReachable: boolean | null): string => {
    if (!type) return 'Checking...';
    if (type === 'none' || type === 'unknown') return 'No connection';
    if (isReachable === false) return 'Connected but no internet';
    return `Connected via ${type}`;
};