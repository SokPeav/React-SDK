import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle,
  ExternalLink,
  Folder,
  Info,
  MessageSquare,
  Save,
  Share2,
  Shield,
  Smartphone,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { WingTraverse } from "./index";
import { DeviceInfo, ProfileData } from "./types";

function App() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isNativeAvailable, setIsNativeAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [storageValue, setStorageValue] = useState("");
  const [retrievedValue, setRetrievedValue] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [isListeningToNotifications, setIsListeningToNotifications] =
    useState(false);

  useEffect(() => {
    setIsNativeAvailable(WingTraverse.available());

    // Register notification handler
    WingTraverse.registerHandler(
      "onNotification",
      (data: { title: string; message: string }) => {
        setNotificationCount((prev) => prev + 1);
        setMessage(`Notification received: ${data.title} - ${data.message}`);
      }
    );

    // Register app state handler
    WingTraverse.registerHandler(
      "onAppStateChange",
      (data: { state: string }) => {
        setMessage(`App state changed to: ${data.state}`);
      }
    );

    return () => {
      // Cleanup handlers on unmount
      WingTraverse.unregisterHandler("onNotification");
      WingTraverse.unregisterHandler("onAppStateChange");
    };
  }, []);

  const handleGetProfile = async () => {
    setLoading(true);
    try {
      const profileData = await WingTraverse.callHandler<ProfileData>(
        "getProfile"
      );

      console.log("data response", profile);
      setProfile(profileData);
      setMessage("Profile loaded successfully!");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetDeviceInfo = async () => {
    setLoading(true);
    try {
      const info = await WingTraverse.callHandler<DeviceInfo>("getDeviceInfo");
      console.log(info);
      setDeviceInfo(info);
      setMessage("Device info loaded successfully!");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowToast = async (type: "success" | "error" | "info") => {
    try {
      await WingTraverse.callHandler("showToast", {
        message: `This is a ${type} toast!`,
        type,
      });
      setMessage(`${type} toast sent!`);
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleOpenUrl = async () => {
    try {
      await WingTraverse.callHandler("openUrl", { url: "https://github.com" });
      setMessage("URL opened in native browser!");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleShare = async () => {
    try {
      await WingTraverse.callHandler("shareContent", {
        content: "Check out this awesome WingTraverse bridge!",
        title: "WingTraverse Demo",
      });
      setMessage("Content shared!");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleSaveStorage = async () => {
    if (!storageKey.trim()) return;
    try {
      const value = storageValue.trim() || "Sample data";
      await WingTraverse.callHandler("saveToStorage", {
        key: storageKey,
        value,
      });
      setMessage(`Saved "${value}" to key "${storageKey}"`);
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleGetStorage = async () => {
    if (!storageKey.trim()) return;
    try {
      const value = await WingTraverse.callHandler("getFromStorage", {
        key: storageKey,
      });
      setRetrievedValue(value || "No data found");
      setMessage(`Retrieved data for key "${storageKey}"`);
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await WingTraverse.callHandler<boolean>(
        "requestPermission",
        { permission: "camera" }
      );
      setMessage(`Camera permission ${granted ? "granted" : "denied"}`);
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const toggleNotificationListener = () => {
    if (isListeningToNotifications) {
      WingTraverse.unregisterHandler("onNotification");
      setIsListeningToNotifications(false);
      setMessage("Stopped listening to notifications");
    } else {
      WingTraverse.registerHandler(
        "onNotification",
        (data: { title: string; message: string }) => {
          setNotificationCount((prev) => prev + 1);
          setMessage(`Notification received: ${data.title} - ${data.message}`);
        }
      );
      setIsListeningToNotifications(true);
      setMessage("Started listening to notifications");
    }
  };

  const simulateNotification = async () => {
    try {
      await WingTraverse.callHandler("simulateNotification", {
        title: "Test Notification",
        message: "This is a simulated notification from the demo",
      });
      setMessage("Notification simulation requested");
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WingTraverse Handler Bridge
          </h1>
          <p className="text-gray-600 mb-4">
            Generic Handler-Based WebView ↔ Native Communication
          </p>

          {/* Connection Status */}
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isNativeAvailable
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isNativeAvailable ? (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Native Bridge Connected
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Development Mode (Mock Responses)
              </>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-gray-700">{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">User Profile Handler</h2>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <code className="text-sm text-gray-700">
                await WingTraverse.callHandler&lt;ProfileData&gt;("getProfile")
              </code>
            </div>

            <button
              onClick={handleGetProfile}
              disabled={loading}
              className="w-full mb-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Call getProfile Handler"
              )}
            </button>

            {profile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {profile.avatar && (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {profile.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{profile.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">ID: {profile.id}</p>
              </div>
            )}
          </div>

          {/* Device Info Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Smartphone className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">Device Info Handler</h2>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <code className="text-sm text-gray-700">
                await
                WingTraverse.callHandler&lt;DeviceInfo&gt;("getDeviceInfo")
              </code>
            </div>

            <button
              onClick={handleGetDeviceInfo}
              disabled={loading}
              className="w-full mb-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Call getDeviceInfo Handler
            </button>

            {deviceInfo && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium capitalize">
                    {deviceInfo.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{deviceInfo.version}</span>
                </div>
                {deviceInfo.model && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{deviceInfo.model}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold">Action Handlers</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleShowToast("success")}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Success
                </button>
                <button
                  onClick={() => handleShowToast("error")}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Error
                </button>
                <button
                  onClick={() => handleShowToast("info")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
                >
                  <Info className="w-4 h-4 mr-1" />
                  Info
                </button>
              </div>

              <button
                onClick={handleOpenUrl}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open GitHub
              </button>

              <button
                onClick={handleShare}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Content
              </button>

              <button
                onClick={handleRequestPermission}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <Shield className="w-4 h-4 mr-2" />
                Request Camera Permission
              </button>
            </div>
          </div>

          {/* Storage Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Folder className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold">Storage Handlers</h2>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Storage key"
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Value to store"
                value={storageValue}
                onChange={(e) => setStorageValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveStorage}
                  disabled={!storageKey.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleGetStorage}
                  disabled={!storageKey.trim()}
                  className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Folder className="w-4 h-4 mr-1" />
                  Get
                </button>
              </div>

              {retrievedValue && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-1">Retrieved Value:</p>
                  <p className="font-medium">{retrievedValue}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Handler Registration Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 text-pink-600 mr-2" />
            <h2 className="text-xl font-semibold">Handler Registration Demo</h2>
            {notificationCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notificationCount}
              </span>
            )}
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <code className="text-sm text-gray-700">
              WingTraverse.registerHandler("onNotification", callback)
            </code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={toggleNotificationListener}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                isListeningToNotifications
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isListeningToNotifications ? (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Start Listening
                </>
              )}
            </button>

            <button
              onClick={simulateNotification}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Simulate Notification
            </button>

            <button
              onClick={() => setNotificationCount(0)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Count
            </button>
          </div>
        </div>

        {/* SDK Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            WingTraverse SDK v{WingTraverse.getVersion()} - Handler-Based Bridge
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Available: {WingTraverse.available() ? "Yes" : "No"} | Methods:
            callHandler, available, registerHandler, unregisterHandler
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
