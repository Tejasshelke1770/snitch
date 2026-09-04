import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth";

const Register = () => {
  const navigate = useNavigate();
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
      setTimeout(() => {
        navigate("/login");
      }, 700);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex bg-[#09090b] text-[#f4efe6] font-sans antialiased select-none">
      
      {/* LEFT COLUMN: Full-Bleed Editorial Fashion Campaign Showcase */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-[55%] h-full flex-col justify-between p-8 xl:p-12 overflow-hidden bg-[#070709]">
        {/* Full Standing Male Model with balanced framing */}
        <img
          src="/assets/snitch_auth_register.jpg"
          alt="Snitch Menswear Campaign"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] select-none pointer-events-none"
        />

        {/* Ambient atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/30 via-25% to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-[#09090b] pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/20 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
            <span className="text-xs font-bold tracking-[0.35em] text-white uppercase">
              SNITCH
            </span>
            <span className="text-[10px] text-zinc-500">|</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300/90 font-medium">
              ATELIER RUNWAY
            </span>
          </div>

          <span className="text-[10px] font-mono tracking-widest text-zinc-400/80 uppercase px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            COLLECTION &bull; ARCHIVE
          </span>
        </div>

        {/* Bottom Fancy Editorial Typography Quote */}
        <div className="relative z-10 max-w-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-amber-400 font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              VOL. 02 &bull; HAUTE STREETWEAR
            </span>
          </div>

          <blockquote className="text-2xl xl:text-3xl font-light text-white tracking-tight leading-snug">
            &ldquo;Real style is never about fitting in. It&apos;s about being <span className="font-serif italic font-normal text-amber-300">unapologetically unforgettable</span>.&rdquo;
          </blockquote>

          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div className="flex items-center gap-2 pt-1">
              <div className="h-px w-6 bg-amber-400/80" />
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-300 font-medium">
                Snitch Collective &bull; Archive &apos;26
              </p>
            </div>
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              EDITION // 009
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimalist Luxury Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] h-full flex flex-col justify-between px-6 sm:px-12 xl:px-20 py-6 lg:py-8 bg-[#09090b] relative z-10 overflow-y-auto lg:overflow-hidden">
        
        {/* Top Header / Switch Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-bold tracking-[0.3em] text-white uppercase">
              SNITCH
            </span>
          </div>
          <div className="hidden lg:block">
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Member Registration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 decoration-amber-400/30 hover:decoration-amber-300 transition-colors ml-1"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          
          {/* Headline */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Create an account
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Join the collective for private drops, member perks, and express checkout.
            </p>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-amber-200">{successMessage}</p>
            </div>
          )}

          {/* Backend Error Notification */}
          {authError && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
            
            {/* Row 1: Full Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="fullname"
                    name="fullname"
                    type="text"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Alex Johnson"
                    className={`w-full bg-[#121216] text-white placeholder:text-zinc-600 pl-9 pr-3 py-2.5 rounded-xl border transition-all duration-200 outline-none text-xs sm:text-sm ${
                      formErrors.fullname
                        ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/20"
                        : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                    }`}
                  />
                </div>
                {formErrors.fullname && (
                  <p className="text-[11px] text-rose-400 mt-1 ml-0.5">{formErrors.fullname}</p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label
                  htmlFor="contact"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Contact Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-zinc-500 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className={`w-full bg-[#121216] text-white placeholder:text-zinc-600 pl-9 pr-3 py-2.5 rounded-xl border transition-all duration-200 outline-none text-xs sm:text-sm ${
                      formErrors.contact
                        ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/20"
                        : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                    }`}
                  />
                </div>
                {formErrors.contact && (
                  <p className="text-[11px] text-rose-400 mt-1 ml-0.5">{formErrors.contact}</p>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full bg-[#121216] text-white placeholder:text-zinc-600 pl-9 pr-3 py-2.5 rounded-xl border transition-all duration-200 outline-none text-xs sm:text-sm ${
                    formErrors.email
                      ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/20"
                      : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-rose-400 mt-1 ml-0.5">{formErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-zinc-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  autoComplete="new-password"
                  className={`w-full bg-[#121216] text-white placeholder:text-zinc-600 pl-9 pr-10 py-2.5 rounded-xl border transition-all duration-200 outline-none text-xs sm:text-sm ${
                    formErrors.password
                      ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/20"
                      : "border-zinc-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-zinc-500 hover:text-amber-400 transition-colors p-1 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[11px] text-rose-400 mt-1 ml-0.5">{formErrors.password}</p>
              )}
            </div>

            {/* isSeller Checkbox Card */}
            <div
              onClick={() =>
                setFormData((prev) => ({ ...prev, isSeller: !prev.isSeller }))
              }
              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between select-none ${
                formData.isSeller
                  ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                  : "bg-[#121216] border-zinc-800/90 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-200 shrink-0 ${
                    formData.isSeller
                      ? "bg-amber-400 border-amber-400 text-zinc-950 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                      : "bg-[#1f222d] border-zinc-700"
                  }`}
                >
                  {formData.isSeller && (
                    <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold tracking-wide ${
                      formData.isSeller ? "text-amber-300" : "text-zinc-200"
                    }`}>
                      Register as a Seller
                    </span>
                    {formData.isSeller && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Seller Mode
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Unlock merchant tools & list merchandise on Snitch
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 tracking-wider">
          <span>&copy; 2026 SNITCH CLOTHING</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy</span>
            <span>&bull;</span>
            <span className="hover:text-zinc-400 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Register;