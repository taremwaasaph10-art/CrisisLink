import { useCallback, useEffect, useRef, useState } from 'react';
import type { DependencyList } from 'react';
import { toApiError } from '@/services/api';
import type { ApiError } from '@/services/api';

type QueryOptions = {
    /** Refetch in the background every N milliseconds while the tab is visible. */
    pollInterval?: number;
};

type QueryState<T> = {
    data: T | null;
    error: ApiError | null;
    isLoading: boolean;
};

/**
 * Load data from the API, refetching when `deps` change and optionally polling
 * so status changes made by others appear without a manual refresh.
 */
export function useApiQuery<T>(
    fetcher: () => Promise<T>,
    deps: DependencyList,
    { pollInterval }: QueryOptions = {},
) {
    const [state, setState] = useState<QueryState<T>>({
        data: null,
        error: null,
        isLoading: true,
    });
    const [reloadKey, setReloadKey] = useState(0);
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    useEffect(() => {
        let cancelled = false;

        const load = async (inBackground: boolean) => {
            if (inBackground && document.hidden) {
                return;
            }

            if (!inBackground) {
                setState((current) => ({ ...current, isLoading: true }));
            }

            try {
                const data = await fetcherRef.current();

                if (!cancelled) {
                    setState({ data, error: null, isLoading: false });
                }
            } catch (error) {
                if (!cancelled) {
                    // A failed background refresh keeps the data already on screen.
                    setState((current) => ({
                        data: current.data,
                        error:
                            inBackground && current.data !== null
                                ? current.error
                                : toApiError(error),
                        isLoading: false,
                    }));
                }
            }
        };

        void load(false);

        const timer = pollInterval
            ? window.setInterval(() => void load(true), pollInterval)
            : undefined;

        // Catch up straight away when the user returns to the tab or app.
        const refreshWhenVisible = () => {
            if (pollInterval && !document.hidden) {
                void load(true);
            }
        };

        document.addEventListener('visibilitychange', refreshWhenVisible);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
            document.removeEventListener(
                'visibilitychange',
                refreshWhenVisible,
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, reloadKey, pollInterval]);

    const reload = useCallback(() => setReloadKey((key) => key + 1), []);

    const setData = useCallback(
        (data: T) => setState((current) => ({ ...current, data })),
        [],
    );

    return { ...state, reload, setData };
}
