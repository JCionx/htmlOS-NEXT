declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Record<string, string>;
  }
}

export const runtime: Record<string, any> = (() => {
  if (typeof window !== "undefined" && (window as any).__RUNTIME_CONFIG__) {
    return (window as any).__RUNTIME_CONFIG__;
  }
  // fall back to compile-time env for local dev
  return import.meta.env as Record<string, any>;
})();

export default runtime;
