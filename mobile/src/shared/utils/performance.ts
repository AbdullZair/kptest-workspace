/**
 * Performance utilities (placeholder).
 *
 * The original file in this slot contained build-time code generation hooks
 * that referenced non-existent modules. Replaced with no-op exports so it
 * type-checks while keeping the import path stable for callers.
 */

export function measure<T>(label: string, fn: () => T): T {
  if (__DEV__) {
    const start = Date.now();
    try {
      return fn();
    } finally {
      // eslint-disable-next-line no-console
      console.log(`[perf] ${label}: ${Date.now() - start}ms`);
    }
  }
  return fn();
}

export default { measure };
