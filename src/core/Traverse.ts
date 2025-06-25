import {
  TraverseRequest,
  TraverseResponse,
  HandlerCallback,
  PendingRequest,
  NativeMessageEvent,
} from "../types";

// class TraverseSDK {
//   private static instance: TraverseSDK;
//   private pendingRequests = new Map<
//     string,
//     {
//       resolve: (value: any) => void;
//       reject: (error: Error) => void;
//       timeout: NodeJS.Timeout;
//     }
//   >();
//   private registeredHandlers = new Map<string, HandlerCallback>();
//   private handlerIdCounter = 0;

//   private constructor() {
//     this.setupMessageListener();
//   }

//   public static getInstance(): TraverseSDK {
//     if (!TraverseSDK.instance) {
//       TraverseSDK.instance = new TraverseSDK();
//     }
//     return TraverseSDK.instance;
//   }
// private setupMessageListener(): void {
//   if (typeof window !== "undefined") {
//     // Browser & web fallback
//     window.addEventListener("message", this.handleNativeMessage.bind(this));

//     // Android WebView bridge
//     if ((window as any).Android) {
//       (window as any).TraverseNativeMessage = this.handleNativeMessage.bind(this);
//     }

//     // React Native WebView (Android & iOS)
//     if ((window as any).ReactNativeWebView) {
//       document.addEventListener("message", this.handleNativeMessage.bind(this));
//     }
//   }
// }

//     private handleNativeMessage(event: MessageEvent<any> | string | object): void {
//     let message: any;

//     try {
//       console.log("📨 Raw native message type:", typeof event);

//       if (typeof event === "string") {
//         // Direct string from Android
//         message = JSON.parse(event);
//       } else if (event instanceof MessageEvent) {
//         // Event from postMessage
//         if (typeof event.data === "string") {
//           message = JSON.parse(event.data);
//         } else {
//           message = event.data;
//         }
//       } else if (typeof event === "object" && event !== null) {
//         // Direct object passed
//         message = event;
//       } else {
//         console.warn("⚠️ Unknown event format. Ignored:", event);
//         return;
//       }

//       console.log("📥 Native message received:", JSON.stringify(message, null, 2));

//       const res: TraverseResponse = message;
//       this.handleResponse(res);

//     } catch (error) {
//       console.error("❌ Error handling native message:", error);
//     }
//   }

//   private handleResponse(response: TraverseResponse): void {
//     const pendingRequest = this.pendingRequests.get(response.requestId);
//     if (!pendingRequest) return;

//     clearTimeout(pendingRequest.timeout);
//     this.pendingRequests.delete(response.requestId);

//     if (response.success) {
//       pendingRequest.resolve(response.data);
//     } else {
//       pendingRequest.reject(new Error(response.error || "Unknown error"));
//     }
//   }

//   /**
//    * Universal bridge function - handles both calling and registering handlers
//    *
//    * Usage:
//    * // Call a handler
//    * const result = await Traverse.bridge('getProfile', { userId: 123 });
//    *
//    * // Register a handler
//    * const handlerId = Traverse.bridge('closeApp', (data, callback) => {
//    *   console.log('Native wants to close app:', data);
//    *   callback({ confirmed: true });
//    * });
//    *
//    * // Unregister a handler
//    * Traverse.unregister(handlerId);
//    *
//    * // Check availability
//    * const isAvailable = Traverse.available();
//    */
//   bridge<T = any>(
//     handler: string,
//     paramsOrCallback?: any | HandlerCallback<T>,
//     timeout = 10000
//   ): Promise<T> | string {
//     // If second parameter is a function, register handler
//     if (typeof paramsOrCallback === "function") {
//       return this.registerHandler(handler, paramsOrCallback);
//     }

//     // Otherwise, call handler
//     return this.callHandler<T>(handler, paramsOrCallback, timeout);
//   }

//   private callHandler<T = any>(
//     handler: string,
//     params?: any,
//     timeout = 10000
//   ): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const requestId = this.generateRequestId();
//       const request: TraverseRequest = {
//         handler,
//         params,
//         requestId,
//       };

//       const timeoutHandle = setTimeout(() => {
//         this.pendingRequests.delete(requestId);
//         reject(new Error(`Handler timeout: ${handler}`));
//       }, timeout);

//       this.pendingRequests.set(requestId, {
//         resolve,
//         reject,
//         timeout: timeoutHandle,
//       });

//       this.postToNative(request);
//     });
//   }

//   private registerHandler<T = any>(
//     handler: string,
//     callback: HandlerCallback<T>
//   ): string {
//     const handlerId = `${handler}_${++this.handlerIdCounter}`;
//     this.registeredHandlers.set(handler, callback);
//     return handlerId;
//   }

//   unregister(handlerId: string): void {
//     const handler = handlerId.replace(/_\d+$/, "");
//     this.registeredHandlers.delete(handler);
//   }

//   available(): boolean {
//     return !!(
//       (window as any).webkit?.messageHandlers?.Traverse ||
//       (window as any).Android?.processTraverseRequest ||
//       (window as any).ReactNativeWebView
//     );
//   }

//   private postToNative(request: TraverseRequest): void {
//     const message = JSON.stringify(request);

//     try {
//       // iOS WebKit
//       if ((window as any).webkit?.messageHandlers?.Traverse) {
//         (window as any).webkit.messageHandlers.Traverse.postMessage(request);
//         return;
//       }

//       // Android WebView
//       if ((window as any).Android?.processTraverseRequest) {
//         (window as any).Android.processTraverseRequest(message);
//         return;
//       }

//       // React Native
//       if ((window as any).ReactNativeWebView) {
//         (window as any).ReactNativeWebView.postMessage(message);
//         return;
//       }

//       // Development mode with mock responses
//       if (!this.available()) {
//         console.warn("Traverse: Native bridge not found, using mock responses");
//         this.simulateNativeResponse(request);
//         return;
//       }

//       throw new Error("Native bridge not available");
//     } catch (error) {
//       console.error("Error posting to native:", error);
//       const pendingRequest = this.pendingRequests.get(request.requestId);
//       if (pendingRequest) {
//         clearTimeout(pendingRequest.timeout);
//         this.pendingRequests.delete(request.requestId);
//         pendingRequest.reject(
//           new Error("Failed to communicate with native layer")
//         );
//       }
//     }
//   }

//   private simulateNativeResponse(request: TraverseRequest): void {
//     setTimeout(() => {
//       let mockData: any = {};

//       switch (request.handler) {
//         case "getProfile":
//           mockData = {
//             id: "mock-user-123",
//             name: "John Doe",
//             email: "john@example.com",
//             avatar:
//               "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150&h=150&fit=crop&crop=face",
//           };
//           break;
//         case "getLocationInfo":
//           mockData = {
//             lat: "111",
//             lng: "2222",
//           };
//           break;
//         case "getDeviceInfo":
//           mockData = {
//             platform: "web",
//             version: "1.0.0",
//             model: "Development Browser",
//             osVersion: navigator.userAgent,
//           };
//           break;
//         case "getFromStorage":
//           mockData = localStorage.getItem(request.params?.key);
//           try {
//             mockData = JSON.parse(mockData);
//           } catch {
//             // Keep as string if not JSON
//           }
//           break;
//         case "saveToStorage":
//           if (request.params?.key && request.params?.value !== undefined) {
//             localStorage.setItem(
//               request.params.key,
//               JSON.stringify(request.params.value)
//             );
//           }
//           mockData = { success: true };
//           break;
//         case "simulateNotification":
//           setTimeout(() => {
//             const callback = this.registeredHandlers.get("onNotification");
//             if (callback) {
//               callback({
//                 title: request.params?.title || "Mock Notification",
//                 message:
//                   request.params?.message || "This is a mock notification",
//               });
//             }
//           }, 1000);
//           mockData = { success: true };
//           break;
//         default:
//           mockData = { success: true };
//       }

//       this.handleResponse({
//         success: true,
//         data: mockData,
//         requestId: request.requestId,
//       });
//     }, 300);
//   }

//   private generateRequestId(): string {
//     return `traverse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   getVersion(): string {
//     return "2.0.0";
//   }
// }

///////// V2
// class TraverseSDK {
//   private static instance: TraverseSDK;
//   private pendingRequests = new Map<
//     string,
//     {
//       resolve: (value: any) => void;
//       reject: (error: Error) => void;
//       timeout: NodeJS.Timeout;
//     }
//   >();
//   private registeredHandlers = new Map<string, HandlerCallback>();
//   private handlerIdCounter = 0;
//   private bridgeName = "MINI_APP_BRIDGE";
//   private constructor() {
//     this.setupMessageListener();
//   }

//   public static getInstance(): TraverseSDK {
//     if (!TraverseSDK.instance) {
//       TraverseSDK.instance = new TraverseSDK();
//     }
//     return TraverseSDK.instance;
//   }

//   public receiveFromNative = (
//     event: MessageEvent<any> | string | object
//   ): void => {
//     let message: any;

//     try {
//       if (typeof event === "string") {
//         // Direct string from Android
//         message = JSON.parse(event);
//       } else if (event instanceof MessageEvent) {
//         // Event from postMessage
//         if (typeof event.data === "string") {
//           message = JSON.parse(event.data);
//         } else {
//           message = event.data;
//         }
//       } else if (typeof event === "object" && event !== null) {
//         // Direct object passed
//         message = event;
//       } else {
//         console.warn("⚠️ Unknown event format. Ignored:", event);
//         return;
//       }

//       console.log("📥 Native message received:", message);

//       this.handleResponse(message);
//     } catch (error) {
//       console.error("❌ Failed to handle native message:", error);
//     }
//   };

//   private setupMessageListener(): void {
//     if (typeof window !== "undefined") {
//       // Browser / React Native
//       window.addEventListener("message", (e) => this.receiveFromNative(e));
//       document.addEventListener("message", (e) => this.receiveFromNative(e));

//       // Expose global function for native
//       (window as any).TraverseNativeMessage = this.receiveFromNative;
//     }
//   }

//   private handleResponse(response: TraverseResponse): void {
//     const pendingRequest = this.pendingRequests.get(response.requestId);
//     if (!pendingRequest) return;

//     clearTimeout(pendingRequest.timeout);
//     this.pendingRequests.delete(response.requestId);

//     if (response.success) {
//       pendingRequest.resolve(response.data);
//     } else {
//       pendingRequest.reject(new Error(response.error || "Unknown error"));
//     }
//   }

//   bridge<T = any>(
//     handler: string,
//     paramsOrCallback?: any | HandlerCallback<T>,
//     timeout = 10000
//   ): Promise<T> | string {
//     if (typeof paramsOrCallback === "function") {
//       return this.registerHandler(handler, paramsOrCallback);
//     }
//     return this.callHandler<T>(handler, paramsOrCallback, timeout);
//   }

//   private callHandler<T = any>(
//     handler: string,
//     params?: any,
//     timeout = 10000
//   ): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const requestId = this.generateRequestId();
//       const request: TraverseRequest = { handler, params, requestId };

//       const timeoutHandle = setTimeout(() => {
//         this.pendingRequests.delete(requestId);
//         reject(new Error(`Handler timeout: ${handler}`));
//       }, timeout);

//       this.pendingRequests.set(requestId, {
//         resolve,
//         reject,
//         timeout: timeoutHandle,
//       });
//       this.postToNative(request);
//     });
//   }

//   private registerHandler<T = any>(
//     handler: string,
//     callback: HandlerCallback<T>
//   ): string {
//     const handlerId = `${handler}_${++this.handlerIdCounter}`;
//     this.registeredHandlers.set(handler, callback);
//     return handlerId;
//   }

//   unregister(handlerId: string): void {
//     const handler = handlerId.replace(/_\d+$/, "");
//     this.registeredHandlers.delete(handler);
//   }

//   available(): boolean {
//     return !!(
//       (window as any).webkit?.messageHandlers?.Traverse ||
//       (window as any).Android?.processTraverseRequest ||
//       (window as any).ReactNativeWebView
//     );
//   }

//   private postToNative(request: TraverseRequest): void {
//     const message = JSON.stringify(request);

//     try {
//       if ((window as any).webkit?.messageHandlers?.Traverse) {
//         (window as any).webkit.messageHandlers.Traverse.postMessage(request);
//         return;
//       }

//       if ((window as any).Android?.processTraverseRequest) {
//         (window as any).Android.processTraverseRequest(message);
//         return;
//       }

//       if ((window as any).ReactNativeWebView?.postMessage) {
//         (window as any).ReactNativeWebView.postMessage(message);
//         return;
//       }

//       if (!this.available()) {
//         console.warn("Traverse: Native bridge not found, using mock responses");
//         this.simulateNativeResponse(request);
//         return;
//       }

//       throw new Error("Native bridge not available");
//     } catch (error) {
//       console.error("Error posting to native:", error);
//       const pendingRequest = this.pendingRequests.get(request.requestId);
//       if (pendingRequest) {
//         clearTimeout(pendingRequest.timeout);
//         this.pendingRequests.delete(request.requestId);
//         pendingRequest.reject(
//           new Error("Failed to communicate with native layer")
//         );
//       }
//     }
//   }

//   private simulateNativeResponse(request: TraverseRequest): void {
//     setTimeout(() => {
//       let mockData: any = {};

//       switch (request.handler) {
//         case "getProfile":
//           mockData = {
//             id: "mock-user-123",
//             name: "John Doe",
//             email: "john@example.com",
//             avatar: "https://i.pravatar.cc/150?img=12",
//           };
//           break;
//         case "getLocationInfo":
//           mockData = { lat: "111", lng: "2222" };
//           break;
//         case "getDeviceInfo":
//           mockData = {
//             platform: "web",
//             version: "1.0.0",
//             model: "Browser",
//             osVersion: navigator.userAgent,
//           };
//           break;
//         case "getFromStorage":
//           mockData = localStorage.getItem(request.params?.key);
//           try {
//             mockData = JSON.parse(mockData);
//           } catch {}
//           break;
//         case "saveToStorage":
//           if (request.params?.key && request.params?.value !== undefined) {
//             localStorage.setItem(
//               request.params.key,
//               JSON.stringify(request.params.value)
//             );
//           }
//           mockData = { success: true };
//           break;
//         case "simulateNotification":
//           setTimeout(() => {
//             const callback = this.registeredHandlers.get("onNotification");
//             if (callback) {
//               callback({
//                 title: request.params?.title || "Mock Notification",
//                 message:
//                   request.params?.message || "This is a mock notification",
//               });
//             }
//           }, 1000);
//           mockData = { success: true };
//           break;
//         default:
//           mockData = { success: true };
//       }

//       this.handleResponse({
//         success: true,
//         data: mockData,
//         requestId: request.requestId,
//       });
//     }, 300);
//   }

//   private generateRequestId(): string {
//     return `traverse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   getVersion(): string {
//     return "2.0.0";
//   }
// }

class TraverseSDK {
  private static instance: TraverseSDK;
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private readonly registeredHandlers = new Map<string, HandlerCallback>();
  private handlerIdCounter = 0;
  private baseNameToHandlerId = new Map<string, string>();
  private readonly bridgeName = "TraverseBridge";
  private readonly bridgeCallBackName = `${this.bridgeName}NativeMessage`;

  private constructor() {
    this.setupMessageListener();
  }

  public static getInstance(): TraverseSDK {
    if (!TraverseSDK.instance) {
      TraverseSDK.instance = new TraverseSDK();
    }
    return TraverseSDK.instance;
  }

  public receiveFromNative = (event: NativeMessageEvent): void => {
    let message: TraverseResponse;

    try {
      if (typeof event === "string") {
        message = JSON.parse(event);
      } else if (event instanceof MessageEvent) {
        if (typeof event.data === "string") {
          message = JSON.parse(event.data);
        } else {
          message = event.data;
        }
      } else if (typeof event === "object" && event !== null) {
        message = event as TraverseResponse;
      } else {
        console.warn("⚠️ Unknown event format. Ignored:", event);
        return;
      }
      this.handleResponse(message);
    } catch (error) {
      console.error("❌ Failed to handle native message:", error);
    }
  };

  private setupMessageListener(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.receiveFromNative);
      document.addEventListener("message", this.receiveFromNative);
      window[this.bridgeCallBackName] = this.receiveFromNative;
    }
  }

  private handleResponse(response: TraverseResponse): void {
    const pendingRequest = this.pendingRequests.get(response.requestId);
    if (!pendingRequest) return;
    if (response.success) {
      pendingRequest.resolve(response.data);
    } else {
      pendingRequest.reject(new Error(response.error ?? "Unknown error"));
    }
  }

  /**
   * Universal bridge function - handles both calling and registering handlers
   *
   * @param handler - Handler name
   * @param paramsOrCallback - Parameters for calling or callback function for registering
   * @param timeout - Timeout in milliseconds (only for calling handlers)
   * @returns Promise<T> for calling handlers, string (handler ID) for registering handlers
   */
  bridge<T = unknown>(
    handler: string,
    paramsOrCallback?: Record<string, unknown> | HandlerCallback<T>
  ): Promise<T> | string {
    if (typeof paramsOrCallback === "function") {
      return this.registerHandler(handler, paramsOrCallback);
    }
    return this.callHandler<T>(handler, paramsOrCallback);
  }

  private callHandler<T = unknown>(
    handler: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const requestId = this.generateRequestId();
      const request: TraverseRequest = { handler, params, requestId };

      this.pendingRequests.set(requestId, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      this.postToNative(request);
    });
  }
  private registerHandler<T = unknown>(
    handlerBaseName: string,
    callback: HandlerCallback<T>
  ): string {
    // If already registered, unregister old one first
    const existingHandlerId = this.baseNameToHandlerId.get(handlerBaseName);
    if (existingHandlerId) {
      this.unregister(existingHandlerId);
    }

    const handlerId = `${handlerBaseName}_${++this.handlerIdCounter}`;
    this.registeredHandlers.set(handlerId, callback as HandlerCallback);
    this.baseNameToHandlerId.set(handlerBaseName, handlerId);
    return handlerId;
  }

  private generateRequestId(): string {
    return `traverse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  unregister(handlerId: string): void {
    if (!handlerId) return;
    this.registeredHandlers.delete(handlerId);
  }
  available(): boolean {
    return !!(
      window.webkit?.messageHandlers?.[this.bridgeName] ||
      window[this.bridgeName] ||
      window.ReactNativeWebView
    );
  }

  private postToNative(request: TraverseRequest): void {
    const message = JSON.stringify(request);

    try {
      const ios = window.webkit?.messageHandlers?.[this.bridgeName]; //ios
      const android = window[this.bridgeName]; // Android
      const rn = window.ReactNativeWebView; // React Native

      if (ios) return ios.postMessage(request);
      if (android) return android.processRequest(message);
      if (rn) return rn.postMessage(message);
      if (!this.available()) {
        console.warn(
          "⚠️ TraverseBridge: Native bridge not found, using mock responses"
        );
        this.simulateNativeResponse(request);
        return;
      }
    } catch (e) {
      console.error("❌ postToNative failed:", e);
    }
  }

  private simulateNativeResponse(request: TraverseRequest): void {
    setTimeout(() => {
      let mockData: unknown = {};

      switch (request.handler) {
        case "getProfile":
          mockData = {
            id: "mock-user-123",
            name: "John Doe",
            email: "john@example.com",
            avatar: "https://i.pravatar.cc/150?img=12",
          };
          break;

        case "getLocationInfo":
          mockData = {
            lat: "111",
            lng: "2222",
          };
          break;

        case "getDeviceInfo":
          mockData = {
            platform: "web" as const,
            version: "1.0.0",
            model: "Browser",
            osVersion: navigator.userAgent,
          };
          break;
        case "setBarTitle":
          const { title, color, bgColor } = request.params || {};
          console.log("🖼️ Mock set bar title:", title, color, bgColor);
          mockData = { success: true };
          break;
        case "closeApp": {
          const handlerId = this.baseNameToHandlerId.get("closeApp"); // ✅ get full key like "closeApp_1"
          console.log(handlerId)
          const callback = this.registeredHandlers.get(handlerId || "");
          console.log(callback)
          if (callback) {
            callback(request.params || {}, (response) => {
              console.log(response)
              this.handleResponse({
                success: true,
                data: {
                  ok:true
                },
                requestId: request.requestId,
              });
            });
          } else {
            this.handleResponse({
              success: false,
              error: "No closeApp handler registered",
              requestId: request.requestId,
            });
          }
          break;
        }

        case "navigateTo": {
          const callback = this.registeredHandlers.get("navigateTo");
          if (callback) {
            callback(request.params, (response) => {
              this.handleResponse({
                success: true,
                data: response || { confirmed: true },
                requestId: request.requestId,
              });
            });
          } else {
            this.handleResponse({
              success: false,
              error: "No navigateTo handler registered",
              requestId: request.requestId,
            });
          }
          break;
        }

        case "doPayment":
          // Simulate payment processing
          const paymentParams = request.params as {
            amount: string;
            currency: string;
            account: number;
          };

          // Simulate random success/failure for demo
          mockData = {
            status: "success",
            transactionId: `txn_${Date.now()}`,
            account: paymentParams.account,
            amount: paymentParams.amount,
            currency: paymentParams.currency,
          };
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
}
export const Traverse = TraverseSDK.getInstance();
export default Traverse;
