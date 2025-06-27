import { EventEmitter2 } from "eventemitter2";
import { HandlerCallback, PendingRequest } from "../types";

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
  private readonly resolvers = new Map<number, PendingRequest>();
  private readonly handlerCallbacks = new Map<string, HandlerCallback>();
  private readonly bridgeName = "TraverseBridge";
  private readonly bridgeCallBackName = `${this.bridgeName}NativeMessage`;
  private readonly emitter = new EventEmitter2();
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
      window[this.bridgeCallBackName] = this.onCallback;
    }
  }

  bridge<T = unknown>(
    handler: string,
    paramsOrCallback?: Record<string, unknown> | HandlerCallback<T>
  ): Promise<T> | string {
    if (typeof paramsOrCallback === "function") {
      return this.registerHandler(handler, paramsOrCallback);
    }
    return this.callHandler(handler, paramsOrCallback);
  }

  async callHandler<T = unknown>(
    event: string,
    data: Record<string, any> = {}
  ): Promise<T> {
    const id = this.generateRequestId();
    if (!this.available()) {
      this.simulateNativeResponse(event, id);
      // return Promise.reject(new Error("Not inside a mini app!"));
    }

    return new Promise((resolve, reject) => {
      this.resolvers.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.postToNative(id, event, JSON.stringify(data));
    });
  }
  public registerHandler<T = unknown>(
    event: string,
    callback: HandlerCallback<T>
  ): string {
    this.emitter.on(event, callback);
    this.handlerCallbacks.set(event, callback as HandlerCallback);

    return event;
  }
  public unregister(handlerId: string): void {
    const callback = this.handlerCallbacks.get(handlerId);
    if (callback) {
      this.emitter.off(handlerId, callback);
      this.handlerCallbacks.delete(handlerId);
    }
  }

  public onCallback = (
    id: number | string,
    event: string,
    data: string,
    action?: string
  ): void => {
    const isEvent = id === -1 || typeof id !== "number";
    if (isEvent) {
      const eventName = typeof id === "string" ? id : event;

      this.handleNativeEvent(eventName, data, action);
    } else {
      this.handleNativeResponse(id, data);
    }
  };

  private handleNativeEvent(
    event: string,
    data: string,
    action?: string
  ): void {
    try {
      const parsedData = data !== "" ? JSON.parse(data) : data;
      const callback = action
        ? (payload: any) => this.callHandler(action, payload)
        : undefined;
      this.emitter.emit(event, parsedData, callback);
    } catch (err) {
      console.error("❌ Failed to emit event:", err);
    }
  }

  private handleNativeResponse(id: number, data: string): void {
    const pending = this.resolvers.get(id);
    if (!pending) return;

    this.resolvers.delete(id);
    if (typeof data === "string") {
      try {
        pending.resolve(JSON.parse(data));
      } catch (err) {
        pending.reject(err instanceof Error ? err : new Error(String(err)));
      }
    } else {
      pending.resolve(data);
    }
  }

  private generateRequestId(): number {
    return Number(
      `${Date.now()}${Math.floor(100000 + Math.random() * 900000)}`
    );
  }
  available(): boolean {
    return !!(
      window.webkit?.messageHandlers?.[this.bridgeName] ||
      window[this.bridgeName] ||
      window.ReactNativeWebView
    );
  }

  private postToNative(id: number, event: string, data: unknown): void {
    const payload = { id, event, data };

    try {
      const ios = window.webkit?.messageHandlers?.[this.bridgeName]; //ios
      const android = window[this.bridgeName]; // Android
      const rn = window.ReactNativeWebView; // React Native

      if (ios) return ios.postMessage(id, event, JSON.stringify(data));
      if (android) return android.postMessage(id, event, JSON.stringify(data));
      if (rn) return rn.postMessage(JSON.stringify(payload));
    } catch (e) {
      console.error("❌ postToNative failed:", e);
    }
  }

  private simulateNativeResponse(event: string, id: number): void {
    setTimeout(() => {
      let mockData: unknown;

      switch (event) {
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
          mockData = {
            title: "testing",
            color: "#FF6B6B",
            bgColor: "#0984E3",
          };
          break;
        case "closeApp":
          mockData = {
            reason: "test leng",
          };
          break;

        default:
          mockData = { ok: true };
      }

      // Simulate native calling back into JS
      window.TraverseBridgeNativeMessage?.(id, event, JSON.stringify(mockData));
    }, 300);
  }
}
export const Traverse = TraverseSDK.getInstance();
export default Traverse;
