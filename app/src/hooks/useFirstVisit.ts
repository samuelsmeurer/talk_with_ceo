import { useState, useEffect } from 'react';

const STORAGE_KEY = 'habla-con-guille-visited';

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    try {
      return !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isFirstVisit) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // ignore
      }
    }
  }, [isFirstVisit]);

  const markVisited = () => setIsFirstVisit(false);

  return { isFirstVisit, markVisited };
}
