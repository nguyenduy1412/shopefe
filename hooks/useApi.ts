
import { useState, useCallback } from 'react';

interface ApiState<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
}

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export function useApi<T = any, Args extends any[] = any[]>(
    apiFunction: (...args: Args) => Promise<T>,
    options: UseApiOptions<T> = {}
) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        error: null,
        loading: false,
    });

    const execute = useCallback(async (...args: Args) => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const data = await apiFunction(...args);
            setState({ data, error: null, loading: false });
            if (options.onSuccess) {
                options.onSuccess(data);
            }
            return data;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('An unknown error occurred');
            setState({ data: null, error: err, loading: false });
            if (options.onError) {
                options.onError(err);
            }
            throw err;
        }
    }, [apiFunction, options]);

    return { ...state, execute, reset: () => setState({ data: null, error: null, loading: false }) };
}
