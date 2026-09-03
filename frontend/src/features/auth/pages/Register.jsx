import React, { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../hook/useAuth";

const Register = () => {
  const { handleRegisterUser, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    contact: "",
    email: "",
    password: "",
    isSeller: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field-specific error upon editing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullname.trim()) {
      errors.fullname = "Full name is required";
    }

    if (!formData.contact.trim()) {
      errors.contact = "Contact number is required";
    } else if (!/^[+0-9\s\-()]{7,15}$/.test(formData.contact.trim())) {
      errors.contact = "Enter a valid phone number";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) return;

    const result = await handleRegisterUser({
      fullname: formData.fullname.trim(),
      contact: formData.contact.trim(),
      email: formData.email.trim(),
      password: formData.password,
      isSeller: formData.isSeller,
    });

    if (result?.success) {
      setSuccessMessage(
        formData.isSeller
          ? "Account created successfully! Welcome to Snitch Seller Hub."
          : "Account created successfully! Welcome to Snitch."
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0b0e] text-[#f4efe6] px-4 py-16 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Ambient background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-yellow-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-600/[0.03] blur-[180px] pointer-events-none" />

      {/* Main Form Card */}
      <div className="relative z-10 w-full max-w-xl mx-auto">
        <div className="bg-[#121318]/90 backdrop-blur-2xl rounded-3xl border border-amber-500/15 shadow-[0_0_60px_-15px_rgba(245,158,11,0.15)] p-8 sm:p-12 transition-all duration-300">
          
          {/* Header & Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" />
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400/90">
                SNITCH
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
              Create an Account
            </h1>
            <p className="text-sm text-zinc-400 font-normal max-w-sm mx-auto leading-relaxed">
              Join our marketplace with simple, seamless access to modern fashion and commerce.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-amber-200">{successMessage}</p>
                <p className="text-xs text-amber-400/80 mt-1">You are now registered and ready to explore.</p>
              </div>
            </div>
          )}

          {/* Backend Error Banner */}
          {authError && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Full Name */}
            <div className="group">
              <label
                htmlFor="fullname"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400 group-focus-within:text-amber-400 transition-colors mb-2"
              >
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="e.g. Alex Johnson"
                  className={`w-full bg-[#171922] text-zinc-100 placeholder:text-zinc-600 pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none text-sm sm:text-base ${
                    formErrors.fullname
                      ? "border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                      : "border-zinc-800/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  }`}
                />
              </div>
              {formErrors.fullname && (
                <p className="text-xs text-rose-400 mt-1.5 ml-1">{formErrors.fullname}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="group">
              <label
                htmlFor="contact"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400 group-focus-within:text-amber-400 transition-colors mb-2"
              >
                Contact Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-2834"
                  className={`w-full bg-[#171922] text-zinc-100 placeholder:text-zinc-600 pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none text-sm sm:text-base ${
                    formErrors.contact
                      ? "border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                      : "border-zinc-800/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  }`}
                />
              </div>
              {formErrors.contact && (
                <p className="text-xs text-rose-400 mt-1.5 ml-1">{formErrors.contact}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400 group-focus-within:text-amber-400 transition-colors mb-2"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex.johnson@example.com"
                  className={`w-full bg-[#171922] text-zinc-100 placeholder:text-zinc-600 pl-12 pr-4 py-3.5 rounded-2xl border transition-all duration-300 outline-none text-sm sm:text-base ${
                    formErrors.email
                      ? "border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                      : "border-zinc-800/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-xs text-rose-400 mt-1.5 ml-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400 group-focus-within:text-amber-400 transition-colors mb-2"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`w-full bg-[#171922] text-zinc-100 placeholder:text-zinc-600 pl-12 pr-12 py-3.5 rounded-2xl border transition-all duration-300 outline-none text-sm sm:text-base ${
                    formErrors.password
                      ? "border-rose-500/70 focus:ring-2 focus:ring-rose-500/20"
                      : "border-zinc-800/80 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-zinc-500 hover:text-amber-400 transition-colors focus:outline-none p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-xs text-rose-400 mt-1.5 ml-1">{formErrors.password}</p>
              )}
            </div>

            {/* isSeller Checkbox Card */}
            <div
              onClick={() =>
                setFormData((prev) => ({ ...prev, isSeller: !prev.isSeller }))
              }
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-4 select-none ${
                formData.isSeller
                  ? "bg-amber-500/[0.06] border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.08)]"
                  : "bg-[#171922] border-zinc-800/80 hover:border-amber-500/25"
              }`}
            >
              <div className="pt-0.5">
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                    formData.isSeller
                      ? "bg-amber-400 border-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      : "bg-[#1f222d] border-zinc-700"
                  }`}
                >
                  {formData.isSeller && (
                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  id="isSeller"
                  name="isSeller"
                  type="checkbox"
                  checked={formData.isSeller}
                  onChange={handleChange}
                  className="sr-only"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium transition-colors ${
                    formData.isSeller ? "text-amber-300" : "text-zinc-200"
                  }`}>
                    Register as a Seller
                  </span>
                  {formData.isSeller && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Seller Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Unlock merchant tools, manage store inventory, and list products on Snitch.
                </p>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-zinc-950 font-semibold text-sm sm:text-base tracking-wide transition-all duration-300 hover:opacity-95 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Nav / Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-zinc-400">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-400/30 hover:decoration-amber-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

          </form>
        </div>

        {/* Footer info note */}
        <p className="text-center text-xs text-zinc-500 mt-8 tracking-wide">
          Protected by Snitch secure encryption &bull; Terms of Service apply
        </p>
      </div>
    </div>
  );
};

export default Register;