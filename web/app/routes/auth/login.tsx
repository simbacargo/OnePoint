import { useState, useEffect } from "react";
import type { Route } from "./+types/login";
import { Link, redirect, useSubmit, useActionData, useNavigate, useNavigation } from "react-router"; // Added useActionData
import { QRCodeCanvas } from "qrcode.react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "~/Context/AppContext";
import { Form } from "react-router";

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm";
const socialBtnClass = "flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xl";

function FacebookSignInButton({ socialBtnClass, }: { socialBtnClass: string }) {
  const submit = useSubmit();
  const handleFacebookLogin = () => {
    // Check if FB SDK is loaded
    if (!(window as any).FB) return;

    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        const formData = new FormData();
        formData.append("intent", "facebook");
        formData.append("credential", response.authResponse.accessToken);
        submit(formData, { method: "post" });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <button 
      type="button"
      onClick={handleFacebookLogin}
      className={`${socialBtnClass} text-[#1877F2]`} 
      title="Facebook"
    >
      <i className="bi bi-facebook"></i>
    </button>
  );
}


export async function action({ request }: Route.ActionArgs) {
  console.clear();
  console.log("Login action triggered");
  // const {login} = useAuth(); // Replace with real authentication logic
  let formData = await request.formData();
  const intent = formData.get("intent");
  const username = formData.get("username");
  const password = formData.get("password");

  let payload = {};
  let endpoint = "https://msaidizi.nsaro.com/login_api/";

  if (intent === "google") {
    endpoint = "https://msaidizi.com/google_login_api/";
    payload = { token: formData.get("credential") };
  } else if (intent === "facebook") {
    endpoint = "https://msaidizi.com/facebook_login_api/";
    payload = { token: formData.get("credential") };
} else if (intent === "apple") {
    endpoint = "https://msaidizi.com/apple_login_api/"; // Your Apple endpoint
    payload = { 
      token: formData.get("credential"),
      user: formData.get("user") // Apple only sends user info (name/email) on the FIRST login
    }
  } else {
    payload = { username, password };
  }
console.clear();
try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.clear();
  console.log(data);
  if (response.ok) {
      // Return the data to the component
      return { 
        success: true, 
        user: username ? { username } : data.user, 
        accessToken: data.access, 
        refreshToken: data.refresh 
      };
    } else {
      return { error: data.message || "Invalid credentials" };
    }
  } catch (err) {
    return { error: "Server connection failed" };
  }

}

function AppleSignInButton({ socialBtnClass }: { socialBtnClass: string }) {
  const submit = useSubmit();
  const [isSdkReady, setIsSdkReady] = useState(false);

  // Check periodically if Apple is ready (in case script load event was missed)
  useEffect(() => {
    const checkApple = setInterval(() => {
      if ((window as any).AppleID) {
        setIsSdkReady(true);
        clearInterval(checkApple);
      }
    }, 500);
    return () => clearInterval(checkApple);
  }, []);

  const handleAppleLogin = async () => {
    // 1. Safety check to prevent the "undefined" error
    if (!(window as any).AppleID || !(window as any).AppleID.auth) {
      console.error("Apple SDK not loaded yet.");
      alert("Apple Sign-In is still initializing. Please wait a moment.");
      return;
    }

    try {
      const data = await (window as any).AppleID.auth.signIn();
      const formData = new FormData();
      formData.append("intent", "apple");
      formData.append("credential", data.authorization.id_token);
      
      if (data.user) {
        formData.append("user", JSON.stringify(data.user));
      }
      
      submit(formData, { method: "post" });
    } catch (error) {
      // User closing the popup counts as an error, so we handle it gracefully
      console.log("Apple Sign-In Error:", error);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleAppleLogin}
      className={`${socialBtnClass} text-black ${!isSdkReady ? 'opacity-50 cursor-not-allowed' : ''}`} 
      title="Apple"
      disabled={!isSdkReady}
    >
      {isSdkReady ? <i className="bi bi-apple"></i> : <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>}
    </button>
  );
}

function PrettyGoogleButton() {
  const submit = useSubmit();
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      const formData = new FormData();
      formData.append("intent", "google");
      formData.append("credential", tokenResponse.access_token);
      // Store the temporary google response if needed
      localStorage.setItem("google_auth_debug", JSON.stringify(tokenResponse));
      submit(formData, { method: "post" });
    },
    onError: () => console.error("Google Login Failed"),
  });

  return (
    <button onClick={() => login()} className={`${socialBtnClass} text-[#DB4437]`} title="Google">
      <i className="bi bi-google"></i>
    </button>
  );
}
export default function Login() {
  const actionData = useActionData<typeof action>();
  const { login, isAuthenticated } = useAuth(); // Context hook works here!
  const navigate = useNavigate();
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";// Inside your Login component, replace the two conflicting useEffects with this:
useEffect(() => {
  if (actionData && 'success' in actionData) {
    // 1. Prepare the user object
    console.clear();
    const userToSave = actionData.user.username;
    console.log('====================================');
    console.log(userToSave);
    console.log('====================================');
    // 2. Persistent Storage (CRITICAL: Must be stringified)
    localStorage.setItem("msaidizi_user", JSON.stringify(userToSave));
    localStorage.setItem("access_token", actionData.accessToken);
    login(userToSave); 
    
    // navigate("/"); 
    window.location.href = "/"; 

  }
}, [actionData, login, navigate]);

useEffect(() => {
  if (isAuthenticated) {
    navigate("/", { replace: true });
  }
}, [isAuthenticated, navigate]);
useEffect(() => {
  (window as any).fbAsyncInit = function() {
    FB.init({
      appId      : '1085920000270748',
      cookie     : true,
      xfbml      : true,
      version    : 'v18.0'
    });
  };

function checkLoginState(FB: any) {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}
  // Load the SDK script
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s) as HTMLScriptElement; js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode?.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}, []);
useEffect(() => {
  // Check if script already exists to avoid duplicate injections
  if (document.getElementById('apple-sdk')) return;

  const script = document.createElement("script");
  script.id = "apple-sdk";
  // Updated to the valid v2 URL
  script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/auth/v2/appleid.auth.js";
  script.async = true;
  script.type = "text/javascript";
  document.body.appendChild(script);

  script.onload = () => {
    // Wait a tiny bit for the library to mount to window
    if ((window as any).AppleID) {
      (window as any).AppleID.auth.init({
        clientId: 'com.msaidizi.client', 
        scope: 'name email',
        redirectURI: 'https://msaidizi.com/login',
        usePopup: true,
      });
      console.log("Apple SDK Initialized");
    }
  };

  script.onerror = () => {
    console.error("Failed to load Apple SDK. Check if the URL is accessible.");
  };
}, []);
  
  const [method, setMethod] = useState<"credentials" | "qr">("credentials");
  const [qrSessionId, setQrSessionId] = useState("");

  useEffect(() => {
    setQrSessionId(Math.random().toString(36).substring(2, 15));
  }, []);

  const qrValue = `https://msaidizi.com/qr_login/?session=${qrSessionId}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-blue-200">
            <i className="bi bi-box-seam"></i>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Msaidizi</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Inventory & Sales Management</p>
        </div>

        {/* Method Toggle */}
        <div className="flex px-8 gap-2">
          <button 
            onClick={() => setMethod("credentials")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'credentials' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            CREDENTIALS
          </button>
          <button 
            onClick={() => setMethod("qr")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === 'qr' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            QR CODE
          </button>
        </div>

        <div className="p-8 pt-6">
          {actionData && 'error' in actionData && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 animate-pulse">
              {actionData.error}
            </div>
          )}

          {method === "credentials" ? (
            <Form className="space-y-4" method="post">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Username / Email</label>
                <input type="text" placeholder="Enter your username" className={inputClass} name="username" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">Password</label>
                <input type="password" placeholder="••••••••" className={inputClass} name="password" required />
              </div>
              <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg mt-2" type="submit">
                {isSubmitting ? "Logging in..." : "Login to System"}
              </button>
            </Form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-56 h-56 bg-white border-2 border-gray-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner p-4">
                <QRCodeCanvas value={qrValue} size={180} level={"H"} />
              </div>
              <p className="text-xs text-gray-500 px-8">Scan to login instantly.</p>
            </div>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
              <span className="bg-white px-4 tracking-widest">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <PrettyGoogleButton />
            <FacebookSignInButton socialBtnClass={socialBtnClass} />
            <AppleSignInButton socialBtnClass={socialBtnClass} />
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
