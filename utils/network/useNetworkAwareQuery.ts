import { useEffect, useRef, useState } from 'react';
import {useNetwork} from "@/entities/network/useNetwork";

interface UseNetworkAwareQueryOptions {
    retryOnReconnect?: boolean;
    maxRetries?: number;
}

export const useNetworkAwareQuery = <T>(
    queryFn: () => Promise<T>,
    deps: any[] = [],
    options: UseNetworkAwareQueryOptions = {}
) => {
    const { isConnected, isInternetReachable } = useNetwork();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const retryCount = useRef(0);
    const { retryOnReconnect = true, maxRetries = 3 } = options;

    const executeQuery = async () => {
        if (!isConnected || isInternetReachable === false) {
            setError(new Error('No internet connection'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await queryFn();
            setData(result);
            retryCount.current = 0;
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (retryOnReconnect &&
            isConnected &&
            isInternetReachable &&
            error &&
            retryCount.current < maxRetries) {
            retryCount.current += 1;
            executeQuery();
        }
    }, [isConnected, isInternetReachable]);

    useEffect(() => {
        executeQuery();
    }, deps);

    return { data, loading, error, refetch: executeQuery };
};