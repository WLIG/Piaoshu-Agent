// Global type definitions
declare global {
  interface Window {
    location: Location;
  }
  
  interface Navigator {
    share?: (data: ShareData) => Promise<void>;
    clipboard?: {
      writeText: (text: string) => Promise<void>;
    };
  }
  
  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
  }
  
  const Date: DateConstructor;
  const JSON: JSON;
  const Math: Math;
  const Error: ErrorConstructor;
  const encodeURIComponent: (str: string) => string;
  const alert: (message?: any) => void;
  const window: Window & typeof globalThis;
}

export {};