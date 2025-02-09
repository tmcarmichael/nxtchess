export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};
