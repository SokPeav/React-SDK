import {
  Bell,
  Check,
  Info,
  LocateIcon,
  Smartphone,
  User,
  Wifi,
  WifiOff,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Traverse } from "./core/Traverse";
import { DeviceInfo, ProfileData } from "./types";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{ id: number; title: string; message: string }>
  >([]);

  const closeCallbackRef = useRef<((response?: any) => void) | null>(null);

  useEffect(() => {
    setIsConnected(Traverse.available());

    const handlerId = Traverse.bridge(
      "closeApp",
      (data: { reason: string }, callback) => {
        console.log("✅ Native wants to close app:", data);
        setCloseReason(data?.reason || "Unknown reason");
        setShowCloseDialog(true);
        closeCallbackRef.current = callback || null;
      }
    );

    return () => {
      if (Traverse.available()) {
        Traverse.unregister(handlerId as string);
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
  const handleGetLocationInfo = async () => {
    setLoading(true);
    try {
      const locationData = await Traverse.bridge("getLocationInfo");
      setLocationInfo(locationData as any);
      setMessage("Location info loaded successfully!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseApp = async () => {
    Traverse.bridge("closeApp", { reason: "Mock triggered from UI" });
  };
  const handleCloseResponse = (confirmed: boolean) => {
    console.log(closeCallbackRef);
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
                className=" bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Confirm Close</span>
              </button>
              <button
                onClick={() => handleCloseResponse(false)}
                className=" bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card with JSON */}
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={handleGetProfile}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Get Profile</h3>
                  <p className="text-sm text-gray-500">
                    Fetch user profile data
                  </p>
                </div>
              </button>
            </div>

            {/* JSON Block aligned with button card */}
            {profile && (
              <div className="bg-gray-900 text-white rounded-xl border border-gray-700 p-4 text-sm">
                <h4 className="font-semibold mb-2"> JSON Data</h4>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={handleGetDeviceInfo}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Device Info</h3>
                    <p className="text-sm text-gray-500">
                      Get device information
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* JSON Block aligned with button card */}
            {deviceInfo && (
              <div className="bg-gray-900 text-white rounded-xl border border-gray-700 p-4 text-sm">
                <h4 className="font-semibold mb-2"> JSON Data</h4>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(deviceInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={handleGetLocationInfo}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <LocateIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      Get Location
                    </h3>
                    <p className="text-sm text-gray-500">
                      Get Location information
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* JSON Block aligned with button card */}
            {locationInfo && (
              <div className="bg-gray-900 text-white rounded-xl border border-gray-700 p-4 text-sm">
                <h4 className="font-semibold mb-2"> JSON Data</h4>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(locationInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={() => {
                  handleCloseApp();
                }}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <X className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Close App</h3>
                    <p className="text-sm text-gray-500">Close WebView Web</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
