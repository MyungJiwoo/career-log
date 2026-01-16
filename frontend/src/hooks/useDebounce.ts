import { useEffect, useState } from 'react';

/**
 * 값을 debounce 처리하는 커스텀 훅
 * @param value - debounce 처리할 값
 * @param delay - 지연 시간 (ms)
 * @returns debounce 처리된 값
 */
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
