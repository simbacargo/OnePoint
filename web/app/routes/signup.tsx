import { useEffect, useState } from "react";
import type { Route } from "./+types/signup";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Msaidizi | Create Account" },
    { name: "description", content: "Join Msaidizi to manage your inventory and sales." },
  ];
}

export default function SignUp() {
    const {isAuthenticated} = useAuth(); // Replace with real authentication logic
const navigate = useNavigate();

useEffect(() => {
  if (isAuthenticated) {
    navigate("/", { replace: true });
  }
}, [isAuthenticated, navigate]);
  const [step, setStep] = useState(1);

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 text-gray-800 text-sm";
  const labelClass = "block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1";
  const socialBtnClass = "flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xl";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Progress Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
                {[1, 2].map((i) => (
                    <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${step >= i ? 'bg-blue-600' : 'bg-gray-100'}`}></div>
                ))}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase">Step {step} of 2</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 font-medium">Start managing your shop with Msaidizi.</p>
        </div>

        <div className="p-8 pt-2">
          <form className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" placeholder="e.g. Juma Hamisi" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" placeholder="name@company.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Create Password</label>
                  <input type="password" placeholder="Min. 8 characters" className={inputClass} />
                </div>
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg mt-2 flex items-center justify-center gap-2"
                >
                  Continue <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className={labelClass}>Shop / Business Name</label>
                  <input type="text" placeholder="e.g. Juma Spare Parts" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Business Type</label>
                  <select className={inputClass}>
                    <option>Retail Shop</option>
                    <option>Wholesale</option>
                    <option>Service Center</option>
                  </select>
                </div>
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        Back
                    </button>
                    <button 
                        type="submit"
                        className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                        Complete Sign Up
                    </button>
                </div>
              </div>
            )}
          </form>

          {/* Social Sign Up */}
          {step === 1 && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                  <span className="bg-white px-4 tracking-widest">Register with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button className={`${socialBtnClass} text-[#DB4437]`} title="Sign up with Google">
                  <i className="bi bi-google"></i>
                </button>
                <button className={`${socialBtnClass} text-[#1877F2]`} title="Sign up with Facebook">
                  <i className="bi bi-facebook"></i>
                </button>
                <button className={`${socialBtnClass} text-black`} title="Sign up with Apple">
                  <i className="bi bi-apple"></i>
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-8 font-medium">
            Already using Msaidizi? <a href="/login" className="text-blue-600 font-bold hover:underline">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}
