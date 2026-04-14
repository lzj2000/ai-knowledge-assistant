'use client';

import { useSyncExternalStore } from 'react';

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
  return false; // SSR 时默认返回 false
}

function subscribe(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

export function useMediaQuery(query: string): boolean {
  // 使用 useSyncExternalStore 避免在 effect 中同步调用 setState
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    getServerSnapshot
  );
}