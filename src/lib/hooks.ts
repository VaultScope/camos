import { useEffect, useState, useCallback, useRef } from 'react';
import { api, onApiMutation } from './api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const IS_TEST = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test';
const CACHE_TTL_MS = 15_000;
const MAX_CACHE_ENTRIES = 60;

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

if (!IS_TEST && typeof onApiMutation === 'function') {
  onApiMutation(() => {
    responseCache.clear();
  });
}

export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }
}

function getFreshCache<T>(path: string): T | null {
  if (IS_TEST) return null;
  const entry = responseCache.get(path);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(path);
    return null;
  }
  return entry.data as T;
}

function setCache(path: string, data: unknown) {
  if (IS_TEST) return;
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(path, { data, timestamp: Date.now() });
}

function fetchDeduped<T>(path: string, force = false): Promise<T> {
  if (!IS_TEST && !force) {
    const existing = inFlightRequests.get(path);
    if (existing) return existing as Promise<T>;
  }
  const req = api.get<T>(path).then(
    (res) => {
      setCache(path, res);
      inFlightRequests.delete(path);
      return res;
    },
    (err) => {
      inFlightRequests.delete(path);
      throw err;
    }
  );
  if (!IS_TEST) {
    inFlightRequests.set(path, req);
  }
  return req;
}

export function useApi<T>(path: string | null): UseApiState<T> {
  const initialCached = path ? getFreshCache<T>(path) : null;
  const [data, setData] = useState<T | null>(initialCached);
  const [loading, setLoading] = useState<boolean>(Boolean(path && initialCached === null));
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const runFetch = useCallback((force = false) => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const reqId = ++requestIdRef.current;
    const cached = force ? null : getFreshCache<T>(path);

    if (cached !== null) {
      setData(cached);
      setLoading(false);
      setError(null);
      // Stale-while-revalidate quietly in background
      fetchDeduped<T>(path, false)
        .then((fresh) => {
          if (requestIdRef.current === reqId) setData(fresh);
        })
        .catch(() => {});
      return;
    }

    setLoading(true);
    setError(null);
    fetchDeduped<T>(path, force)
      .then((res) => {
        if (requestIdRef.current === reqId) {
          setData(res);
          setError(null);
        }
      })
      .catch((e) => {
        if (requestIdRef.current === reqId) {
          setError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (requestIdRef.current === reqId) {
          setLoading(false);
        }
      });
  }, [path]);

  useEffect(() => {
    runFetch(false);
    return () => {
      requestIdRef.current += 1;
    };
  }, [runFetch]);

  const refetch = useCallback(() => {
    runFetch(true);
  }, [runFetch]);

  return { data, loading, error, refetch };
}
