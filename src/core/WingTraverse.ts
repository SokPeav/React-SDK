import { Bridge } from './Bridge';
import { WingTraverseMethods, HandlerCallback } from '../types';

class WingTraverseSDK implements WingTraverseMethods {
  private readonly bridge: Bridge;

  constructor() {
    this.bridge = Bridge.getInstance();
  }

  /**
   * Call a native handler with optional parameters
   * @param handler - The handler name to call
   * @param params - Optional parameters to pass to the handler
   * @returns Promise with the handler response
   */
  async callHandler<T = any>(handler: string, params?: any): Promise<T> {
    return this.bridge.callHandler<T>(handler, params);
  }

  /**
   * Check if native bridge is available
   * @returns boolean indicating if native bridge is available
   */
  available(): boolean {
    return this.bridge.isNativeAvailable();
  }

  /**
   * Register a handler to receive callbacks from native
   * @param handler - The handler name to register
   * @param callback - The callback function to execute when handler is called
   */
  registerHandler<T = any>(handler: string, callback: HandlerCallback<T>): void {
    this.bridge.registerHandler(handler, callback);
  }

  /**
   * Unregister a previously registered handler
   * @param handler - The handler name to unregister
   */
  unregisterHandler(handler: string): void {
    this.bridge.unregisterHandler(handler);
  }

  /**
   * Get SDK version
   */
  getVersion(): string {
    return '2.0.0';
  }
}

// Export singleton instance
export const WingTraverse = new WingTraverseSDK();
export default WingTraverse;