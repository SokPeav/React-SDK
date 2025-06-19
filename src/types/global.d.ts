declare const GLOBAL_BRIDGE_NAME: "TraverseBridge";
export const GLOBAL_BRIDGE_CALLBACK_NAME = `${GLOBAL_BRIDGE_NAME}NativeMessage`; // "MINI_APPNativeMessage"

declare global {
  interface Window {
    // iOS WebKit - Using unified name "TraverseBridge"
    webkit?: {
      messageHandlers?: {
        [GLOBAL_BRIDGE_NAME]?: {
          postMessage: (message: TraverseRequest) => void;
        };
      };
    };

    // Android WebView - Using unified name "TraverseBridge"
    [GLOBAL_BRIDGE_NAME]?: {
      processRequest: (message: TraverseRequest) => void;
    };

    // React Native - Using unified name "TraverseBridge"
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };

    // Global callback function for native responses
    [GLOBAL_BRIDGE_CALLBACK_NAME]?: (event: string | TraverseResponse) => void;
  }
}

export {};
