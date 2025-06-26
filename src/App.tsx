import {
  Banknote,
  Bell,
  CreditCard,
  Dices,
  Info,
  LocateIcon,
  Smartphone,
  User,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Traverse } from "./core/Traverse";
// import { Traverse } from "traverse-sdk";
import { DeviceInfo, ProfileData } from "./types";

function generateBeautifulColor() {
  // Predefined beautiful color palettes
  const beautifulColors = [
    // Sunset/Warm colors
    "#FF6B6B",
    "#FF8E53",
    "#FF6B9D",
    "#C44569",
    "#F8B500",
    "#FF7675",
    "#FDCB6E",
    "#E17055",

    // Ocean/Cool colors
    "#74B9FF",
    "#0984E3",
    "#00B894",
    "#00CEC9",
    "#6C5CE7",
    "#A29BFE",
    "#81ECEC",
    "#55A3FF",

    // Nature colors
    "#00B894",
    "#55A3FF",
    "#FDCB6E",
    "#E17055",
    "#A29BFE",
    "#FD79A8",
    "#FDCB6E",
    "#6C5CE7",

    // Pastel colors
    "#FFB7B2",
    "#FFDAC1",
    "#E2F0CB",
    "#B5EAD7",
    "#C7CEEA",
    "#FF9AA2",
    "#FFB3BA",
    "#FFDFBA",

    // Vibrant colors
    "#FF3838",
    "#FF9500",
    "#FFDD00",
    "#48CAE4",
    "#7209B7",
    "#F72585",
    "#4361EE",
    "#4CC9F0",
  ];

  return beautifulColors[Math.floor(Math.random() * beautifulColors.length)];
}

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
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const closeCallbackRef = useRef<((response?: any) => void) | null>(null);

  useEffect(() => {
    setIsConnected(Traverse.available());
     const handlerId =  Traverse.bridge("closeApp", (data: any, callback) => {
        console.log("✅ Native wants to close app:", data);
        setCloseReason(data?.reason || "Unknown reason");
        closeCallbackRef.current = callback || null;
      });

    return () => {
      Traverse.unregister(handlerId as string);
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

  const randomizeColor = useCallback(() => {
    const bgColor = generateBeautifulColor();

    Traverse.bridge("setBarTitle", {
      title: "Hello world",
      color: generateBeautifulColor(),
      bgColor,
    });
  }, []);
  const handleNavigationTo = useCallback(() => {
    Traverse.bridge("navigateTo", { route: "/profile" });
  }, []);

  const handleCloseApp = async () => {
    setShowCloseDialog(true);
  };
  const handleCloseResponse = (confirmed: boolean) => {
    if (confirmed) {
      if (closeCallbackRef.current) {
        closeCallbackRef.current({ confirmed });
      }
      // setShowCloseDialog(false);
      // Traverse.bridge("closeApp", { reason: "User clicked X" });
    }

    setShowCloseDialog(false);
  };


  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handlePaymentConfirm = async (): Promise<void> => {
    setPaymentLoading(true);
    try {
      // Call doPayment handler
      const payment: any = await Traverse.bridge("doPayment", {
        amount: "10",
        currency: "USD",
        account: "00001",
      });
      console.log(payment);
      if (payment.status === "success") {
        setShowPaymentSuccess(true);
      }
      setMessage("Payment successful! Your booking has been confirmed.");
      setShowPaymentConfirm(false);

      // Auto close after 3 seconds on success
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentCancel = (): void => {
    setShowPaymentConfirm(false);
  };
  const handleShowPaymentDialog = (): void => {
    setShowPaymentConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <button
        onClick={() => {
          window.dispatchEvent(
            new MessageEvent("closeApp", {
              data: JSON.stringify({
                handler: "closeApp",
                params: { reason: "User clicked closeApp" },
                requestId: "mock-close-req-1",
              }),
            })
          );
        }}
      >
        Simulate CloseApp From Native
      </button>

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 ">
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
      </header>

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
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={randomizeColor}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                    <Dices className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      Random Color
                    </h3>
                    <p className="text-sm text-gray-500">Random Bg for Web</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={handleNavigationTo}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                    <Dices className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      Nagivation To
                    </h3>
                    <p className="text-sm text-gray-500">Random Bg for Web</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {/* Button Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <button
                onClick={handleShowPaymentDialog}
                disabled={loading}
                className="w-full flex items-center space-x-4 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Banknote className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Do Payment</h3>
                    <p className="text-sm text-gray-500">Payment Action</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {showPaymentConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  {/* // Payment Confirmation */}
                  <>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Confirm Payment
                        </h3>
                        <p className="text-sm text-gray-500">
                          Review your payment details
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between py-3 border-t border-gray-200">
                        <span className="font-medium text-gray-900">
                          Total Amount:
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          10 $
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handlePaymentCancel}
                        disabled={paymentLoading}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePaymentConfirm}
                        disabled={paymentLoading}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Confirm Payment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                </div>
              </div>
            </div>
          )}

          {showPaymentSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="relative bg-white rounded-2xl shadow-lg max-w-md w-full p-6 text-center">
                {/* Close button */}
                <button
                  onClick={() => {
                    setShowPaymentSuccess(false);
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Success icon */}
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Payment Successful
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase 🎉
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
