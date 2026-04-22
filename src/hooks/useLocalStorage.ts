import { useState, useEffect } from "react";

function useLocalStorage<T>(
  key: string,
  fallback: T,
  validator?: (value: unknown) => value is T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);

      if (raw === null) return fallback;

      const parsed: unknown = JSON.parse(raw);

      if (validator && !validator(parsed)) {
        console.warn(
          `[useLocalStorage] Dữ liệu "${key}" không hợp lệ, đặt lại về mặc định.`,
          parsed,
        );
        localStorage.removeItem(key);
        return fallback;
      }

      return parsed as T;
    } catch (error) {
      console.warn(
        `[useLocalStorage] Parse "${key}" thất bại, đặt lại về mặc định.`,
        error,
      );
      localStorage.removeItem(key);
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`[useLocalStorage] Ghi "${key}" thất bại.`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
