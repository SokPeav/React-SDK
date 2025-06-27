declare const GLOBAL_BRIDGE_NAME: "TraverseBridge";
export const GLOBAL_BRIDGE_CALLBACK_NAME = `${GLOBAL_BRIDGE_NAME}NativeMessage`; // "MINI_APPNativeMessage"

declare global {
  interface Window {
    // iOS WebKit - Using unified name "TraverseBridge"
    webkit?: {
      messageHandlers?: {
        [GLOBAL_BRIDGE_NAME]?: {
          postMessage: (id: number, event: string, data: unknown ) => void;
        };
      };
    };

    // Android WebView - Using unified name "TraverseBridge"
    [GLOBAL_BRIDGE_NAME]?: {
      postMessage: (id: number, event: string, data: unknown) => void;
    };

    // React Native - Using unified name "TraverseBridge"
    ReactNativeWebView?: {
  postMessage: (message: string) => void; // serialized JSON string
    };

    // Global callback function for native responses
    [GLOBAL_BRIDGE_CALLBACK_NAME]?: (
      id: number | string,
      event: string,
      data: string,
      action?: string
    ) => void;
  }
}

export {};
