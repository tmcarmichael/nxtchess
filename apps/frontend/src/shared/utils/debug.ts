export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export const debugLog = (...args: unknown[]) => {
  if (DEBUG) {
    // eslint-disable-next-line no-console -- intentional debug logging
    console.log(...args);
  }
};
