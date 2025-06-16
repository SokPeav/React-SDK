import { TraverseRequest, TraverseResponse, HandlerCallback } from "../types";

class TraverseSDK {
  private static instance: TraverseSDK;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private registeredHandlers = new Map<string, HandlerCallback>();
  private handlerIdCounter = 0;

  private constructor() {
    this.setupMessageListener();
  }

  public static getInstance(): TraverseSDK {
    if (!TraverseSDK.instance) {
      TraverseSDK.instance = new TraverseSDK();
    }
    return TraverseSDK.instance;
  }

  private setupMessageListener(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleNativeMessage.bind(this));

      // For Android WebView
      if ((window as any).Android) {
        (window as any).TraverseNativeMessage =
          this.handleNativeMessage.bind(this);
      }
    }
  }

  private handleNativeMessage(event: MessageEvent | any): void {
    let message: any;

    if (event.data && typeof event.data === "string") {
      message = JSON.parse(event);
    } else if (event.data && typeof event.data === "object") {
      message = event.data;
    } else if (typeof event === "string") {
      // Direct string response (Android)
      message = JSON.parse(event);
    } else {
      return;
    }
    console.log("📥 Native message received:", JSON.stringify(message));
    this.handleResponse(message);
  }

  private handleResponse(response: TraverseResponse): void {
    const pendingRequest = this.pendingRequests.get(response.requestId);
    if (!pendingRequest) return;

    clearTimeout(pendingRequest.timeout);
    this.pendingRequests.delete(response.requestId);

    if (response.success) {
      pendingRequest.resolve(response.data);
    } else {
      pendingRequest.reject(new Error(response.error || "Unknown error"));
    }
  }

  /**
   * Universal bridge function - handles both calling and registering handlers
   *
   * Usage:
   * // Call a handler
   * const result = await Traverse.bridge('getProfile', { userId: 123 });
   *
   * // Register a handler
   * const handlerId = Traverse.bridge('closeApp', (data, callback) => {
   *   console.log('Native wants to close app:', data);
   *   callback({ confirmed: true });
   * });
   *
   * // Unregister a handler
   * Traverse.unregister(handlerId);
   *
   * // Check availability
   * const isAvailable = Traverse.available();
   */
  bridge<T = any>(
    handler: string,
    paramsOrCallback?: any | HandlerCallback<T>,
    timeout = 10000
  ): Promise<T> | string {
    // If second parameter is a function, register handler
    if (typeof paramsOrCallback === "function") {
      return this.registerHandler(handler, paramsOrCallback);
    }

    // Otherwise, call handler
    return this.callHandler<T>(handler, paramsOrCallback, timeout);
  }

  private callHandler<T = any>(
    handler: string,
    params?: any,
    timeout = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const request: TraverseRequest = {
        handler,
        params,
        requestId,
      };

      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Handler timeout: ${handler}`));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      this.postToNative(request);
    });
  }

  private registerHandler<T = any>(
    handler: string,
    callback: HandlerCallback<T>
  ): string {
    const handlerId = `${handler}_${++this.handlerIdCounter}`;
    this.registeredHandlers.set(handler, callback);
    return handlerId;
  }

  unregister(handlerId: string): void {
    const handler = handlerId.replace(/_\d+$/, "");
    this.registeredHandlers.delete(handler);
  }

  available(): boolean {
    return !!(
      (window as any).webkit?.messageHandlers?.Traverse ||
      (window as any).Android?.processTraverseRequest ||
      (window as any).ReactNativeWebView
    );
  }

  private postToNative(request: TraverseRequest): void {
    const message = JSON.stringify(request);

    try {
      // iOS WebKit
      if ((window as any).webkit?.messageHandlers?.Traverse) {
        (window as any).webkit.messageHandlers.Traverse.postMessage(request);
        return;
      }

      // Android WebView
      if ((window as any).Android?.processTraverseRequest) {
        (window as any).Android.processTraverseRequest(message);
        return;
      }

      // React Native
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(message);
        return;
      }

      // Development mode with mock responses
      if (!this.available()) {
        console.warn("Traverse: Native bridge not found, using mock responses");
        this.simulateNativeResponse(request);
        return;
      }

      throw new Error("Native bridge not available");
    } catch (error) {
      console.error("Error posting to native:", error);
      const pendingRequest = this.pendingRequests.get(request.requestId);
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(request.requestId);
        pendingRequest.reject(
          new Error("Failed to communicate with native layer")
        );
      }
    }
  }

  private simulateNativeResponse(request: TraverseRequest): void {
    setTimeout(() => {
      let mockData: any = {};

      switch (request.handler) {
        case "getProfile":
          mockData = {
            id: "mock-user-123",
            name: "John Doe",
            email: "john@example.com",
            avatar:
              "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150&h=150&fit=crop&crop=face",
          };
          break;
        case "getDeviceInfo":
          mockData = {
            platform: "web",
            version: "1.0.0",
            model: "Development Browser",
            osVersion: navigator.userAgent,
          };
          break;
        case "getFromStorage":
          mockData = localStorage.getItem(request.params?.key);
          try {
            mockData = JSON.parse(mockData);
          } catch {
            // Keep as string if not JSON
          }
          break;
        case "saveToStorage":
          if (request.params?.key && request.params?.value !== undefined) {
            localStorage.setItem(
              request.params.key,
              JSON.stringify(request.params.value)
            );
          }
          mockData = { success: true };
          break;
        case "simulateNotification":
          setTimeout(() => {
            const callback = this.registeredHandlers.get("onNotification");
            if (callback) {
              callback({
                title: request.params?.title || "Mock Notification",
                message:
                  request.params?.message || "This is a mock notification",
              });
            }
          }, 1000);
          mockData = { success: true };
          break;
        default:
          mockData = { success: true };
      }

      this.handleResponse({
        success: true,
        data: mockData,
        requestId: request.requestId,
      });
    }, 300);
  }

  private generateRequestId(): string {
    return `traverse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getVersion(): string {
    return "2.0.0";
  }
}

// Export singleton instance
export const Traverse = TraverseSDK.getInstance();
export default Traverse;
