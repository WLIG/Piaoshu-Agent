// Global type declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
  
  var fetch: typeof globalThis.fetch;
  var setTimeout: typeof globalThis.setTimeout;
  var clearTimeout: typeof globalThis.clearTimeout;
  var setInterval: typeof globalThis.setInterval;
  var clearInterval: typeof globalThis.clearInterval;
}

// DOM types
declare var HTMLElement: {
  prototype: HTMLElement;
  new(): HTMLElement;
};

declare var HTMLInputElement: {
  prototype: HTMLInputElement;
  new(): HTMLInputElement;
};

declare var HTMLDivElement: {
  prototype: HTMLDivElement;
  new(): HTMLDivElement;
};

declare var File: {
  prototype: File;
  new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
};

export {};