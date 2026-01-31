import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

export default function UpgradeSubscription() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | null>(
    null
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 10000,
      icon: "bi-shield-check",
      color: "blue",
      features: [
        "Up to 200 Products",
        "1 Admin Account",
        "2 Admin Account",
        "Basic Reports",
      ],
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: 19000,
      icon: "bi-gem",
      color: "purple",
      features: [
        "Unlimited Products",
        "Daily Email Summaries",
        "5 Admin Account",
        "Advanced Analytics",
        "Multiple Staff Accounts",
        "Priority Support",
        "Automated Backups",
      ],
    },
  ];

  const handlePushRequest = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!selectedPlan) return;

  setIsProcessing(true);

  const API_URL = "https://jrc.nsaro.com/api/offerings/";

  // Match React Native behavior
  const amount =
    selectedPlan === "premium" ? 17000 : 10000;

  const order_id = `OFFERING-${Date.now()}`;
  const buyer_name = "Web User";
  const buyer_email = "user@example.com";

  try {
    const formData = new FormData();
    formData.append("phone_number", `+255${phoneNumber}`); // no forced +255
    formData.append("amount", amount.toFixed(2));
    formData.append("order_id", order_id);
    formData.append("buyer_name", buyer_name);
    formData.append("buyer_email", buyer_email);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData, 
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail =
        data.detail || data.error || "Unknown error occurred";
      alert(`Payment Failed: ${errorDetail}`);
      return;
    }

    alert(
      `Payment initiated successfully. Please check your phone to confirm.`
    );
    setPhoneNumber("");
  } catch (error) {
    console.error("API Error:", error);
    alert(
      "Network error. Could not connect to the payment server."
    );
  } finally {
    setIsProcessing(false);
  }
};


  const activePlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
          Upgrade Your Experience
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          Unlock the full power of Msaidizi Inventory.
        </p>
      </header>

      {/* 1. Prettier Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id as any)}
            className={`relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? `border-blue-600 bg-blue-50/20 ring-4 ring-blue-100`
                : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between mb-8">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                  selectedPlan === plan.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <i className={`bi ${plan.icon}`}></i>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-black text-gray-900">
                  {plan.name}
                </h3>
                <p className="text-2xl font-black text-blue-600">
                  {plan.price.toLocaleString()}{" "}
                  <span className="text-xs font-medium text-gray-400">
                    TZS/mo
                  </span>
                </p>
              </div>
            </div>
            <ul className="space-y-4">
              {plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-sm font-medium text-gray-600"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${selectedPlan === plan.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    <i className="bi bi-check-lg"></i>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 2. Enhanced Payment Section */}
      {selectedPlan && (
        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Section Header */}
          <div className="p-8 bg-gray-50/80 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/M-Pesa_Logo.svg/512px-M-Pesa_Logo.svg.png"
                alt="M-Pesa"
                className="h-10"
              />
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  M-Pesa Secure Payment
                </h3>
                <p className="text-sm text-gray-500">
                  Choose your preferred way to pay.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Payable:
              </span>
              <span className="text-xl font-black text-blue-600">
                {activePlanData?.price.toLocaleString()} TZS
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* OPTION A: DIRECT PUSH (The Prettier Interactive Part) */}
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-lg tracking-widest">
                  Recommended
                </span>
                <h4 className="text-2xl font-black text-gray-900">
                  Direct STK Push
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Enter your number and we'll send a payment prompt directly to
                  your phone. Just enter your PIN to confirm.
                </p>
              </div>

              <form onSubmit={handlePushRequest} className="space-y-4">
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xl">
                    +255
                  </span>
                  <input
                    required
                    type="tel"
                    placeholder="754 728 137"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-20 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-3xl outline-none text-2xl font-black transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                >
                  {isProcessing ? (
                    <span className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <i className="bi bi-phone-vibrate-fill"></i> Send Push
                      Prompt
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* OPTION B: MANUAL INSTRUCTIONS (The Red Confirmation Part) */}
            <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100 space-y-8">
              <div className="space-y-2 text-center lg:text-left">
                <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">
                  Manual Payment
                </h4>
                <p className="text-sm text-red-700 font-medium italic">
                  Use these steps if the push prompt fails:
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg shadow-red-200">
                    1
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Send amount to: <br />
                    <span className="text-xl font-black text-gray-900 tracking-wider">
                      0749 418 888
                    </span>
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg shadow-red-200">
                    2
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Receiver Name: <br />
                    <span className="text-sm font-black text-gray-900 uppercase">
                      MSAIDIZI TECH
                    </span>
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-red-100">
                <button
                  onClick={() =>
                    alert(
                      "Verification request sent! Please allow up to 15 mins."
                    )
                  }
                  className="w-full bg-white text-red-600 border-2 border-red-200 py-4 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-3"
                >
                  <i className="bi bi-chat-left-text"></i> I have paid manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
