import { useEffect, useRef } from 'react';

/**
 * Debounce for search field
 * @param callback - function will be calling after delay
 * @param delay - how much time in ms function should wait until they called
 */
export function useDebounce<T extends unknown[]>(
    callback: (...args: T) => void,
    delay: number
): (...args: T) => void {
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const debouncedCallback = (...args: T) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };

    return debouncedCallback;
}