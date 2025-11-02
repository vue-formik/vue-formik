/**
 * Creates a debounced version of a function.
 *
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 *
 * @example
 * ```typescript
 * const debouncedFn = debounce(() => console.log('Hello'), 300);
 * debouncedFn(); // Won't execute immediately
 * debouncedFn(); // This will execute after 300ms of no calls
 * ```
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  }) as T;
}

export default debounce;
