// import { WingTraverseRequest, WingTraverseResponse } from '../types';

// export class Bridge {
//   private static instance: Bridge;
//   private pendingRequests = new Map<string, {
//     resolve: (value: any) => void;
//     reject: (error: Error) => void;
//     timeout: NodeJS.Timeout;
//   }>();

//   private constructor() {
//     this.setupMessageListener();
//   }

//   public static getInstance(): Bridge {
//     if (!Bridge.instance) {
//       Bridge.instance = new Bridge();
//     }
//     return Bridge.instance;
//   }

// private eventListeners = new Map<string, (data: any) => void>();

// /**
//  * Listen for native-to-webview event.
//  */
// public on(event: string, callback: (data: any) => void): void {
//   this.eventListeners.set(event, callback);
// }

// /**
//  * Unregister listener.
//  */
// public off(event: string): void {
//   this.eventListeners.delete(event);
// }

// /**
//  * Trigger callback manually (e.g., simulate from native or dev).
//  */
// private triggerCallback(event: string, data: any): void {
//   const callback = this.eventListeners.get(event);
//   if (callback) {
//     callback(data);
//   }
// }

//   private setupMessageListener(): void {
//     // Listen for responses from native
//     if (typeof window !== 'undefined') {
//       window.addEventListener('message', this.handleNativeResponse.bind(this));

//       // For Android WebView
//       if ((window as any).Android) {
//         (window as any).ArconNativeResponse = this.handleNativeResponse.bind(this);
//       }
//     }
//   }

//   private handleNativeResponse(event: MessageEvent | any): void {
//     let response: WingTraverseResponse;

//     try {
//       // Handle different response formats
//       if (event.data && typeof event.data === 'string') {
//         response = JSON.parse(event.data);
//       } else if (event.data && typeof event.data === 'object') {
//         response = event.data;
//       } else if (typeof event === 'string') {
//         // Direct string response (Android)
//         response = JSON.parse(event);
//       } else {
//         return;
//       }

//       const pendingRequest = this.pendingRequests.get(response.requestId);
//       if (!pendingRequest) return;

//       clearTimeout(pendingRequest.timeout);
//       this.pendingRequests.delete(response.requestId);

//       if (response.success) {
//         pendingRequest.resolve(response.data);
//       } else {
//         pendingRequest.reject(new Error(response.error || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Error handling native response:', error);
//     }
//   }

//   public sendRequest<T = any>(method: string, params?: any, timeout = 10000): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const requestId = this.generateRequestId();
//       const request: WingTraverseRequest = {
//         method,
//         params,
//         requestId
//       };

//       // Set up timeout
//       const timeoutHandle = setTimeout(() => {
//         this.pendingRequests.delete(requestId);
//         reject(new Error(`Request timeout: ${method}`));
//       }, timeout);

//       // Store pending request
//       this.pendingRequests.set(requestId, {
//         resolve,
//         reject,
//         timeout: timeoutHandle
//       });

//       // Send request to native
//       this.postToNative(request);
//     });
//   }

//   private postToNative(request: WingTraverseRequest): void {
//     const message = JSON.stringify(request);

//     try {
//       // iOS WebKit
//       if ((window as any).webkit?.messageHandlers?.Arcon) {
//         (window as any).webkit.messageHandlers.Arcon.postMessage(request);
//         return;
//       }

//       // Android WebView
//       if ((window as any).Android?.processWingTraverseRequest) {
//         (window as any).Android.processWingTraverseRequest(message);
//         return;
//       }

//       // React Native
//       if ((window as any).ReactNativeWebView) {
//         (window as any).ReactNativeWebView.postMessage(message);
//         return;
//       }

//       // Fallback - development mode
//       if (process.env.NODE_ENV === 'development') {
//         console.warn('Arcon: Native bridge not found, simulating response');
//         this.simulateNativeResponse(request);
//         return;
//       }

//       throw new Error('Native bridge not available');
//     } catch (error) {
//       console.error('Error posting to native:', error);
//       const pendingRequest = this.pendingRequests.get(request.requestId);
//       if (pendingRequest) {
//         clearTimeout(pendingRequest.timeout);
//         this.pendingRequests.delete(request.requestId);
//         pendingRequest.reject(new Error('Failed to communicate with native layer'));
//       }
//     }
//   }

//   private simulateNativeResponse(request: WingTraverseRequest): void {
//     // Simulate native responses for development
//     setTimeout(() => {
//       let mockData: any = {};

//       switch (request.method) {
//         case 'getProfile':
//           mockData = {
//             id: 'mock-user-123',
//             name: 'John Doe',
//             email: 'john@example.com',
//             avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150&h=150&fit=crop&crop=face'
//           };
//           break;
//         case 'getDeviceInfo':
//           mockData = {
//             platform: 'web',
//             version: '1.0.0',
//             model: 'Development Browser',
//             osVersion: navigator.userAgent
//           };
//           break;
//         case 'getFromStorage':
//           mockData = localStorage.getItem(request.params?.key);
//           try {
//             mockData = JSON.parse(mockData);
//           } catch {
//             // Keep as string if not JSON
//           }
//           break;
//         default:
//           mockData = { success: true };
//       }

//       this.handleNativeResponse({
//         data: {
//           success: true,
//           data: mockData,
//           requestId: request.requestId
//         }
//       });
//     }, 300); // Simulate network delay
//   }

//   private generateRequestId(): string {
//     return `arcon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   public isNativeAvailable(): boolean {
//     return !!(
//       (window as any).webkit?.messageHandlers?.Arcon ||
//       (window as any).Android?.processWingTraverseRequest ||
//       (window as any).ReactNativeWebView
//     );
//   }
// }

//V2
// export interface WingTraverseRequest {
//   method: string;
//   params?: any;
//   requestId: string;
// }

// export interface WingTraverseResponse {
//   method?: string;
//   requestId: string;
//   success: boolean;
//   data?: any;
//   error?: string;
// }

// export class Bridge {
//   private static instance: Bridge;

//   private pendingRequests = new Map<
//     string,
//     {
//       resolve: (value: any) => void;
//       reject: (error: Error) => void;
//       timeout: NodeJS.Timeout;
//     }
//   >();

//   private eventListeners = new Map<string, (data: any) => void>();

//   private constructor() {
//     this.setupMessageListener();
//   }

//   public static getInstance(): Bridge {
//     if (!Bridge.instance) {
//       Bridge.instance = new Bridge();
//     }
//     return Bridge.instance;
//   }

//   private setupMessageListener(): void {
//     if (typeof window !== 'undefined') {
//       window.addEventListener('message', this.handleNativeResponse.bind(this));

//       // Android WebView bridge
//       if ((window as any).Android) {
//         (window as any).ArconNativeResponse = this.handleNativeResponse.bind(this);
//       }
//     }
//   }

//   private handleNativeResponse(event: MessageEvent | any): void {
//     let response: WingTraverseResponse;

//     try {
//       if (event.data && typeof event.data === 'string') {
//         response = JSON.parse(event.data);
//       } else if (event.data && typeof event.data === 'object') {
//         response = event.data;
//       } else if (typeof event === 'string') {
//         response = JSON.parse(event);
//       } else {
//         return;
//       }

//       // ✅ Trigger event-based callback if registered
//       if (response.method && this.eventListeners.has(response.method)) {
//         this.triggerCallback(response.method, response.data);
//         return;
//       }

//       // ✅ Resolve promise-based requests
//       const pendingRequest = this.pendingRequests.get(response.requestId);
//       if (!pendingRequest) return;

//       clearTimeout(pendingRequest.timeout);
//       this.pendingRequests.delete(response.requestId);

//       if (response.success) {
//         pendingRequest.resolve(response.data);
//       } else {
//         pendingRequest.reject(new Error(response.error || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Error handling native response:', error);
//     }
//   }

//   public sendRequest<T = any>(method: string, params?: any, timeout = 10000): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const requestId = this.generateRequestId();
//       const request: WingTraverseRequest = { method, params, requestId };

//       const timeoutHandle = setTimeout(() => {
//         this.pendingRequests.delete(requestId);
//         reject(new Error(`Request timeout: ${method}`));
//       }, timeout);

//       this.pendingRequests.set(requestId, {
//         resolve,
//         reject,
//         timeout: timeoutHandle,
//       });

//       this.postToNative(request);
//     });
//   }

//   private postToNative(request: WingTraverseRequest): void {
//     const message = JSON.stringify(request);

//     try {
//       if ((window as any).webkit?.messageHandlers?.Arcon) {
//         (window as any).webkit.messageHandlers.Arcon.postMessage(request);
//         return;
//       }

//       if ((window as any).Android?.processWingTraverseRequest) {
//         (window as any).Android.processWingTraverseRequest(message);
//         return;
//       }

//       if ((window as any).ReactNativeWebView) {
//         (window as any).ReactNativeWebView.postMessage(message);
//         return;
//       }

//       if (process.env.NODE_ENV === 'development') {
//         console.warn('Arcon: Native bridge not found, simulating response');
//         this.simulateNativeResponse(request);
//         return;
//       }

//       throw new Error('Native bridge not available');
//     } catch (error) {
//       console.error('Error posting to native:', error);
//       const pendingRequest = this.pendingRequests.get(request.requestId);
//       if (pendingRequest) {
//         clearTimeout(pendingRequest.timeout);
//         this.pendingRequests.delete(request.requestId);
//         pendingRequest.reject(new Error('Failed to communicate with native layer'));
//       }
//     }
//   }

//   private simulateNativeResponse(request: WingTraverseRequest): void {
//     setTimeout(() => {
//       let mockData: any = {};

//       switch (request.method) {
//         case 'getProfile':
//           mockData = {
//             id: 'mock-user-123',
//             name: 'John Doe',
//             email: 'john@example.com',
//             avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150&h=150&fit=crop&crop=face',
//           };
//           break;
//         case 'getAuthToken':
//           mockData = {
//            token : "123abc"
//           };
//           break;
//         case 'getDeviceInfo':
//           mockData = {
//             platform: 'web',
//             version: '1.0.0',
//             model: 'Development Browser',
//             osVersion: navigator.userAgent,
//           };
//           break;
//         case 'getFromStorage':
//           mockData = localStorage.getItem(request.params?.key);
//           try {
//             mockData = JSON.parse(mockData);
//           } catch {
//             // Keep as string if not JSON
//           }
//           break;
//         case 'onUserLoggedOut':
//           this.triggerCallback('onUserLoggedOut', { reason: 'token_expired' });
//           return;
//         default:
//           mockData = { success: true };
//       }

//       this.handleNativeResponse({
//         data: {
//           success: true,
//           data: mockData,
//           requestId: request.requestId,
//         },
//       });
//     }, 300);
//   }

//   private generateRequestId(): string {
//     return `arcon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   public isNativeAvailable(): boolean {
//     return !!(
//       (window as any).webkit?.messageHandlers?.Arcon ||
//       (window as any).Android?.processWingTraverseRequest ||
//       (window as any).ReactNativeWebView
//     );
//   }

//   // 🔥 EVENT HANDLING 🔥

//   /**
//    * Register event-based callback from native (e.g. user logout).
//    */
//   public on(event: string, callback: (data: any) => void): void {
//     this.eventListeners.set(event, callback);
//   }

//   /**
//    * Remove previously registered callback.
//    */
//   public off(event: string): void {
//     this.eventListeners.delete(event);
//   }

//   /**
//    * Manually trigger a callback (for dev/simulation).
//    */
//   private triggerCallback(event: string, data: any): void {
//     const callback = this.eventListeners.get(event);
//     if (callback) {
//       callback(data);
//     }
//   }
// }

import {
  WingTraverseRequest,
  WingTraverseResponse,
  HandlerCallback,
} from "../types";

export class Bridge {
  private static instance: Bridge;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  private registeredHandlers = new Map<string, HandlerCallback>();
  private constructor() {
    this.setupMessageListener();
  }
  
  public static getInstance(): Bridge {
    if (!Bridge.instance) {
      Bridge.instance = new Bridge();
    }
    return Bridge.instance;
  }

  private setupMessageListener(): void {
    // Listen for responses from native
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleNativeMessage.bind(this));

      // For Android WebView
      if ((window as any).Android) {
        (window as any).WingTraverseNativeMessage =
          this.handleNativeMessage.bind(this);
      }
    }
  }

  private handleNativeMessage(event: MessageEvent | any): void {
    let message: any;

    try {
      // Handle different message formats
      if (event.data && typeof event.data === "string") {
        message = JSON.parse(event.data);
      } else if (event.data && typeof event.data === "object") {
        message = event.data;
      } else if (typeof event === "string") {
        // Direct string response (Android)
        message = JSON.parse(event);
      } else {
        return;
      }

      // Check if it's a response to a pending request
      // if (message.requestId && this.pendingRequests.has(message.requestId)) {
        this.handleResponse(message);
      // }
      // Check if it's a handler callback
      // else if (
      //   message.handler &&
      //   this.registeredHandlers.has(message.handler)
      // ) {
      //   const callback = this.registeredHandlers.get(message.handler);
      //   if (callback) {
      //     callback(message.data);
      //   }
      // }
    } catch (error) {
      console.error("Error handling native message:", error);
    }
  }

  private handleResponse(response: WingTraverseResponse): void {
    console.log(response)
    const pendingRequest = this.pendingRequests.get(response.requestId);
    console.log(pendingRequest)
    if (!pendingRequest) return;

    clearTimeout(pendingRequest.timeout);
    this.pendingRequests.delete(response.requestId);

    console.log(response.data)
    if (response.success) {
      pendingRequest.resolve(response.data);
    } else {
      pendingRequest.reject(new Error(response.error || "Unknown error"));
    }
  }

  public callHandler<T = any>(
    handler: string,
    params?: any,
    timeout = 10000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = this.generateRequestId();
      const request: WingTraverseRequest = {
        handler,
        params,
        requestId,
      };

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Handler timeout: ${handler}`));
      }, timeout);

      // Store pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      // Send request to native
      this.postToNative(request);
    });
  }

  public registerHandler<T = any>(
    handler: string,
    callback: HandlerCallback<T>
  ): void {
    this.registeredHandlers.set(handler, callback);
  }

  public unregisterHandler(handler: string): void {
    this.registeredHandlers.delete(handler);
  }

  private postToNative(request: WingTraverseRequest): void {
    const message = JSON.stringify(request); 
    console.log(message)
    try {
      // iOS WebKit
      if ((window as any).webkit?.messageHandlers?.WingTraverse) {
        (window as any).webkit.messageHandlers.WingTraverse.postMessage(
          request
        );
        return;
      }
      
      // Android WebView
      if ((window as any).Android?.processWingTraverseRequest) {
        (window as any).Android.processWingTraverseRequest(message);
        console.log(message)
        return;
      }
      
      // React Native
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(message);
        console.log(message)
        return;
      }

      // Fallback - development mode
      if (process.env.NODE_ENV === "development") {
        console.warn("Wing: Native bridge not found, simulating response");
        this.simulateNativeResponse(request);
        return;
      }

      // Fallback - development mode with mock responses
      if (!this.isNativeAvailable()) {
        console.warn("Wing: Native bridge not found, using mock responses");
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

  private simulateNativeResponse(request: WingTraverseRequest): void {
    // Simulate native responses for development
    setTimeout(() => {
      let mockData: any = {};

      switch (request.handler) {
        case "getProfile":
          mockData = {
            id: "mock-user-123",
            name: "John Doe Doe",
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
        case "closeApp":
          mockData = {
           message :"closing"
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
        default:
          mockData = { success: true };
      }

      this.handleResponse({
        success: true,
        data: mockData,
        requestId: request.requestId,
      });
    }, 300); // Simulate network delay
  }

  private generateRequestId(): string {
    return `wing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public isNativeAvailable(): boolean {
    return !!(
      (window as any).webkit?.messageHandlers?.WingTraverse ||
      (window as any).Android?.processWingTraverseRequest ||
      (window as any).ReactNativeWebView
    );
  }
}
