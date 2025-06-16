import React, { useState, useEffect, useRef } from "react";
import { Traverse } from "./core/Traverse";
import { ProfileData, DeviceInfo } from "./types";
import {
  Smartphone,
  User,
  Info,
  Wifi,
  WifiOff,
  MessageSquare,
  Bell,
  Save,
  Download,
  X,
  Check,
} from "lucide-react";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{ id: number; title: string; message: string }>
  >([]);

  const closeCallbackRef = useRef<((response?: any) => void) | null>(null);

  useEffect(() => {
    // Check connection status
    setIsConnected(Traverse.available());

    // Register handler for close app requests from native
    const closeHandlerId = Traverse.bridge(
      "closeApp",
      (data: any, callback?: (response?: any) => void) => {
        console.log("Native wants to close app:", data);
        setCloseReason(data?.reason || "Unknown reason");
        setShowCloseDialog(true);
        closeCallbackRef.current = callback || null;
      }
    );

    // Register handler for notifications from native
    const notificationHandlerId = Traverse.bridge(
      "onNotification",
      (data: any) => {
        const newNotification = {
          id: Date.now(),
          title: data.title || "Notification",
          message: data.message || "No message",
        };
        setNotifications((prev) => [...prev, newNotification]);

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== newNotification.id)
          );
        }, 5000);
      }
    );

    return () => {
      // Cleanup handlers
      if (Traverse.available()) {
        Traverse.unregister(closeHandlerId as string);
        Traverse.unregister(notificationHandlerId as string);
      }
    };
  }, []);

  const handleGetProfile = async () => {
    setLoading(true);
    try {
      const profileData = (await Traverse.bridge("getProfile")) as ProfileData;
      setProfile(profileData);
      setMessage("Profile loaded successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetDeviceInfo = async () => {
    setLoading(true);
    try {
      const deviceData = (await Traverse.bridge("getDeviceInfo")) as DeviceInfo;
      setDeviceInfo(deviceData);
      setMessage("Device info loaded successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShowToast = async () => {
    setLoading(true);
    try {
      await Traverse.bridge("showToast", { message: "Hello from WebView!" });
      setMessage("Toast shown successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveData = async () => {
    setLoading(true);
    try {
      await Traverse.bridge("saveToStorage", {
        key: "user_preference",
        value: { theme: "dark", notifications: true },
      });
      setMessage("Data saved successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadData = async () => {
    setLoading(true);
    try {
      const data = await Traverse.bridge("getFromStorage", {
        key: "user_preference",
      });
      setMessage(`Loaded data: ${JSON.stringify(data)}`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNotification = async () => {
    setLoading(true);
    try {
      await Traverse.bridge("simulateNotification", {
        title: "Test Notification",
        message: "This is a test notification from the bridge!",
      });
      setMessage("Notification simulation triggered!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResponse = (confirmed: boolean) => {
    if (closeCallbackRef.current) {
      closeCallbackRef.current({
        confirmed,
        timestamp: Date.now(),
        reason: confirmed ? "user_confirmed" : "user_cancelled",
      });
      closeCallbackRef.current = null;
    }
    setShowCloseDialog(false);
    setMessage(confirmed ? "App close confirmed" : "App close cancelled");
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Traverse Bridge
                </h1>
                <p className="text-sm text-gray-500">
                  WebView ↔ Native Communication
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Native Bridge Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    Mock Mode (Development)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Close Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Close App Request
                </h3>
                <p className="text-sm text-gray-500">
                  Native app wants to close
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Reason: <span className="font-medium">{closeReason}</span>
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => handleCloseResponse(true)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Close</span>
              </button>
              <button
                onClick={() => handleCloseResponse(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Message */}
        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800">{message}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleGetProfile}
            disabled={loading}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Get Profile</h3>
                <p className="text-sm text-gray-500">Fetch user profile data</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleGetDeviceInfo}
            disabled={loading}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Device Info</h3>
                <p className="text-sm text-gray-500">Get device information</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleShowToast}
            disabled={loading}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Show Toast</h3>
                <p className="text-sm text-gray-500">Display native toast</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleSaveData}
            disabled={loading}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Save className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Save Data</h3>
                <p className="text-sm text-gray-500">Store data in native</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleLoadData}
            disabled={loading}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Load Data</h3>
                <p className="text-sm text-gray-500">Retrieve stored data</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleSimulateNotification}
            disabled={loading}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 disabled:opacity-50 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">
                  Test Notification
                </h3>
                <p className="text-sm text-gray-500">
                  Simulate notification callback
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Data */}
          {profile && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Profile
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {profile.avatar && (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    ID: <span className="font-mono">{profile.id}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Device Info */}
          {deviceInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Device Information
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Platform</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {deviceInfo.platform}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium text-gray-900">
                      {deviceInfo.version}
                    </p>
                  </div>
                </div>
                {deviceInfo.model && (
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p className="font-medium text-gray-900">
                      {deviceInfo.model}
                    </p>
                  </div>
                )}
                {deviceInfo.osVersion && (
                  <div>
                    <p className="text-sm text-gray-500">OS Version</p>
                    <p className="font-medium text-gray-900 text-xs break-all">
                      {deviceInfo.osVersion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Examples
          </h3>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2">Call a handler:</p>
              <code className="text-blue-600">
                const result = await Traverse.bridge('getProfile');
              </code>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2">Register a handler:</p>
              <code className="text-blue-600">
                const id = Traverse.bridge('closeApp', (data, callback) =`&gt;`{" "}
                {"{}"});
              </code>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 mb-2">Unregister a handler:</p>
              <code className="text-blue-600">Traverse.unregister(id);</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
