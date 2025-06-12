export interface WingTraverseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: string;
}

export interface WingTraverseRequest {
  handler: string;
  params?: any;
  requestId: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

export interface DeviceInfo {
  platform: "ios" | "android" | "web";
  version: string;
  model?: string;
  osVersion?: string;
}

// Updated to support both simple callbacks and callback-with-response patterns
export type HandlerCallback<T = any> = (data: T, callback?: (response?: any) => void) => void;


export interface WingTraverseMethods {
  callHandler<T = any>(handler: string, params?: any): Promise<T>;
  available(): boolean;
  registerHandler<T = any>(handler: string, callback: HandlerCallback<T>): void;
  unregisterHandler(handler: string): void;
}
