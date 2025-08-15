/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Window extensions for widget
declare global {
  interface Window {
    AIChat?: {
      init: (config: any) => void;
      open: () => void;
      close: () => void;
      sendMessage: (message: string) => void;
      on: (event: string, callback: (data: any) => void) => void;
      updateConfig: (config: any) => void;
      destroy: () => void;
    };
  }
}

export {};