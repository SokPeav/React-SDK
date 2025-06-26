export interface TraverseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: string;
  type?: string; // <-- Add this line
  
}

export interface TraverseRequest {
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

export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

// Updated to support both simple callbacks and callback-with-response patterns
export type HandlerCallback<T = unknown> = (
  data: T,
  callback?: (response?: unknown) => void
) => void;

export type NativeMessageEvent =
  | MessageEvent<string | TraverseResponse>
  | string
  | object;
// export interface TraverseResponse<T = any> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   requestId: string;
//   type?: string; // <-- Add this line
  
// }

// export interface TraverseRequest {
//   handler: string;
//   params?: any;
//   requestId: string;
// }

// export interface ProfileData {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   preferences?: Record<string, any>;
// }

// export interface DeviceInfo {
//   platform: "ios" | "android" | "web";
//   version: string;
//   model?: string;
//   osVersion?: string;
// }

// export interface PendingRequest {
//   resolve: (value: unknown) => void;
//   reject: (error: Error) => void;
// }

// // Updated to support both simple callbacks and callback-with-response patterns
// export type HandlerCallback<T = unknown> = (
//   data: T,
//   callback?: (response?: unknown) => void
// ) => void;

// export type NativeMessageEvent =
//   | MessageEvent<string | TraverseResponse>
//   | string
//   | object;
