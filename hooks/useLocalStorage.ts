import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load from localStorage ONLY ONCE on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log("Error reading from localStorage", error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  // 2. Save to localStorage WHENEVER storedValue changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(storedValue));
        }
      } catch (error) {
        console.log("Error writing to localStorage", error);
      }
    }
  }, [storedValue, key, isInitialized]);

  // Wrapper for state update
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue, isInitialized] as const;
}