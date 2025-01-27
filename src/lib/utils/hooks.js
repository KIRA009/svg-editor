import { useEffect, useRef, useCallback } from 'react';

export const useDebouncedCallback = (callback, delay) => {
    const timerRef = useRef(null);

    const debouncedCallback = useCallback(
        (...args) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return debouncedCallback;
};
