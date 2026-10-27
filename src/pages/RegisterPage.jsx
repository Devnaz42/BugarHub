import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import loginBackground from "../assets/login-background.jpg";

function UserIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20c.5-4 3.1-6 7.5-6s7 2 7.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7.1 3.5H4.8c-.9 0-1.6.7-1.6 1.6 0 8.7 7.1 15.8 15.8 15.8.9 0 1.6-.7 1.6-1.6V17l-4.2-1.1-1.5 2.3a13.1 13.1 0 0 1-6.5-6.5l2.3-1.5-1.1-4.2H7.1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" />
    </svg>
  );
}

function EyeIcon({ hidden, className = "h-5 w-5" }) {
  return hidden ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 3 21 21M10.6 10.7a2 2 0 0 0 2.7 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.5 5 9 7-.2.8-1.2 2.5-2.8 3.9M6.2 6.3C3.9 7.8 2.4 10.5 2 12c.5 2 3.8 7 10 7 1.3 0 2.5-.3 3.5-.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2.5 12s3.2-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.2 6.5-9.5 6.5S2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4.5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.95h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.37l-3.24-2.52c-.9.6-2.03.96-3.38.96-2.6 0-4.8-1.76-5.59-4.13H3.06v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.94A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.94v-2.6H3.06A10 10 0 0 0 2 12c0 1.62.39 3.15 1.06 4.54l3.35-2.6Z" />
      <path fill="#EA4335" d="M12 5.93c1.47 0 2.79.5 3.83 1.51l2.87-2.87C16.96 2.98 14.7 2 12 2a10 10 0 0 0-8.94 5.46l3.35 2.6C7.2 7.69 9.4 5.93 12 5.93Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16.37 12.45c.02 2.2 1.93 2.93 1.95 2.94-.02.05-.3 1.03-.99 2.04-.6.87-1.22 1.73-2.2 1.75-.96.02-1.27-.57-2.37-.57s-1.45.55-2.35.59c-.95.04-1.68-.93-2.28-1.79-1.23-1.78-2.17-5.03-.91-7.22a3.52 3.52 0 0 1 2.98-1.8c.93-.02 1.8.63 2.37.63.57 0 1.63-.78 2.75-.66.47.02 1.79.19 2.63 1.43-.07.04-1.57.92-1.58 2.66ZM14.56 6.9c.5-.6.83-1.44.74-2.28-.72.03-1.6.48-2.12 1.08-.47.54-.88 1.4-.77 2.22.8.06 1.64-.41 2.15-1.02Z" />
    </svg>
  );
}

const DEMO_GOOGLE_SIGNUP_ACCOUNTS = [
  {
    id: "demo-signup-alya",
    name: "Alya Prameswari",
    email: "alya.prameswari@gmail.com",
    initials: "AP",
    avatarClass: "bg-[#d9eee4] text-[#24734b]",
  },
  {
    id: "demo-signup-abim",
    name: "Abim",
    email: "abimsehat@gmail.com",
    initials: "A",
    avatarClass: "bg-[#202326] text-white",
  },
];

const DEMO_APPLE_SIGNUP_ACCOUNT = {
  id: "demo-apple-abim",
  name: "Abim",
  email: "abimsehat@icloud.com",
  initials: "A",
  avatarClass: "bg-[#202326] text-white",
};

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [showAppleSheet, setShowAppleSheet] = useState(false);
  const [hideAppleEmail, setHideAppleEmail] = useState(true);
  const [providerNotice, setProviderNotice] = useState("");

  useEffect(() => {
    if (!showGooglePicker && !showAppleSheet) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowGooglePicker(false);
        setShowAppleSheet(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [showGooglePicker, showAppleSheet]);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setNoticeType("error");
      setNotice("Your passwords do not match. Please check them and try again.");
      return;
    }

    setNoticeType("info");
    setNotice("The registration form is ready, but account creation has not been connected to a backend yet.");
  }

  function handleProvider(provider) {
    setNotice("");
    setProviderNotice("");

    if (provider === "Google") {
      setShowAppleSheet(false);
      setShowGooglePicker(true);
      return;
    }

    if (provider === "Apple") {
      setShowGooglePicker(false);
      setHideAppleEmail(true);
      setShowAppleSheet(true);
    }
  }

  function handleSelectDemoGoogleAccount(account) {
    const demoMember = {
      ...account,
      provider: "Google",
      signupMethod: "Google",
      isNewRegistration: true,
    };

    try {
      window.sessionStorage.setItem("bugarhub-demo-member", JSON.stringify(demoMember));
    } catch {
      // The dashboard uses its fallback demo profile when sessionStorage is unavailable.
    }

    setShowGooglePicker(false);
    navigate("/dashboard");
  }

  function handleAppleDemoContinue() {
    const demoMember = {
      ...DEMO_APPLE_SIGNUP_ACCOUNT,
      provider: "Apple",
      signupMethod: "Apple",
      isNewRegistration: true,
      hideEmail: hideAppleEmail,
      email: hideAppleEmail
        ? "abim.bugarhub@privaterelay.example"
        : DEMO_APPLE_SIGNUP_ACCOUNT.email,
    };

    try {
      window.sessionStorage.setItem("bugarhub-demo-member", JSON.stringify(demoMember));
    } catch {
      // The dashboard uses its fallback demo profile when sessionStorage is unavailable.
    }

    setShowAppleSheet(false);
    navigate("/dashboard");
  }

  const inputClassName = "h-12 w-full min-w-0 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-4 text-[15px] text-[#202326] outline-none transition placeholder:text-[#9a9ea2] focus:border-[#ff6b00] focus:bg-white focus:ring-4 focus:ring-[#ff6b00]/10 sm:h-[52px] sm:rounded-2xl sm:px-4";
  const labelClassName = "mb-1.5 block text-sm font-semibold text-[#292d30]";

  return (
    <main className="min-h-screen bg-[#f4f4f2] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#202326] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <img src={loginBackground} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#111315]/80 via-[#202326]/55 to-[#202326]/90" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#ff6b00]/25 blur-3xl" />

        <div className="relative z-10 inline-flex w-fit rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10">
          <Logo />
        </div>

        <div className="relative z-10 max-w-xl pb-5">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#ff6b00]" />
            Your member journey
          </p>
          <h2 className="max-w-lg text-4xl font-black leading-[1.1] tracking-tight text-white xl:text-5xl">
            Build your best self with BugarHub<span className="text-[#ff6b00]">.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/75 xl:text-lg">
            Create your account to book personal trainers, explore classes, and manage your gym membership.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-white/80">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Personal training</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Class booking</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Gym membership</span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/55">BugarHub · Move forward, one session at a time.</p>
      </aside>

      <section className="flex min-h-screen items-start justify-center px-5 py-7 sm:px-8 sm:py-9 lg:items-center lg:px-10 lg:py-6 xl:px-14">
        <div className="w-full max-w-[470px]">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <header className="mb-5 sm:mb-6">
            <div className="mb-3 hidden items-center rounded-full bg-[#fff0e5] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f56600] lg:inline-flex">
              Member sign up
            </div>
            <h1 className="text-[clamp(2.25rem,4vw,3.1rem)] font-black leading-[1.05] tracking-[-0.045em] text-[#202326]">
              Join BugarHub<span className="text-[#ff6b00]">.</span>
            </h1>
            <p className="mt-2.5 text-base leading-6 text-[#767b80] sm:text-lg">
              Start your fitness journey today.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="register-name" className={labelClassName}>Full Name</label>
              <div className="group flex items-center gap-3 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-3.5 text-[#7d8287] transition focus-within:border-[#ff6b00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff6b00]/10 sm:rounded-2xl sm:px-4">
                <UserIcon className="h-5 w-5 shrink-0" />
                <input id="register-name" name="fullName" type="text" autoComplete="name" placeholder="Enter your full name" required className={`${inputClassName} border-0 bg-transparent px-0 focus:ring-0`} />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className={labelClassName}>Email Address</label>
              <div className="group flex items-center gap-3 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-3.5 text-[#7d8287] transition focus-within:border-[#ff6b00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff6b00]/10 sm:rounded-2xl sm:px-4">
                <MailIcon className="h-5 w-5 shrink-0" />
                <input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required className={`${inputClassName} border-0 bg-transparent px-0 focus:ring-0`} />
              </div>
            </div>

            <div>
              <label htmlFor="register-phone" className={labelClassName}>Phone Number</label>
              <div className="group flex items-center gap-3 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-3.5 text-[#7d8287] transition focus-within:border-[#ff6b00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff6b00]/10 sm:rounded-2xl sm:px-4">
                <PhoneIcon className="h-5 w-5 shrink-0" />
                <input id="register-phone" name="phone" type="tel" autoComplete="tel" placeholder="Enter your phone number" required className={`${inputClassName} border-0 bg-transparent px-0 focus:ring-0`} />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className={labelClassName}>Password</label>
              <div className="group flex items-center gap-3 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-3.5 text-[#7d8287] transition focus-within:border-[#ff6b00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff6b00]/10 sm:rounded-2xl sm:px-4">
                <LockIcon className="h-5 w-5 shrink-0" />
                <input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="Create a password" required className={`${inputClassName} border-0 bg-transparent px-0 focus:ring-0`} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="rounded-lg p-1 text-[#74797e] transition hover:bg-black/5 hover:text-[#202326] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]">
                  <EyeIcon hidden={showPassword} className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm-password" className={labelClassName}>Confirm Password</label>
              <div className="group flex items-center gap-3 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-3.5 text-[#7d8287] transition focus-within:border-[#ff6b00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff6b00]/10 sm:rounded-2xl sm:px-4">
                <LockIcon className="h-5 w-5 shrink-0" />
                <input id="register-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="Confirm your password" required className={`${inputClassName} border-0 bg-transparent px-0 focus:ring-0`} />
                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword} className="rounded-lg p-1 text-[#74797e] transition hover:bg-black/5 hover:text-[#202326] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]">
                  <EyeIcon hidden={showConfirmPassword} className="h-5 w-5" />
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-sm leading-5 text-[#777c81]">
              <input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#ff6b00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00] focus-visible:ring-offset-2" />
              <span>I agree to the <strong className="font-bold text-[#303437]">Terms &amp; Conditions</strong></span>
            </label>

            <button type="submit" className="group flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-[#ff6b00] px-6 text-base font-bold text-white shadow-lg shadow-[#ff6b00]/20 transition hover:-translate-y-0.5 hover:bg-[#f26100] hover:shadow-xl hover:shadow-[#ff6b00]/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 active:translate-y-0 sm:h-[58px] sm:rounded-2xl">
              Create Account
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {notice && (
            <p role="status" aria-live="polite" className={`mt-3 rounded-xl border px-4 py-3 text-sm leading-5 ${noticeType === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#ffd4b5] bg-[#fff7f0] text-[#8a3b06]"}`}>
              {notice}
            </p>
          )}

          <div className="my-5 flex items-center gap-3 sm:my-6">
            <span className="h-px flex-1 bg-[#ff6b00]/65" />
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-[#f56600] sm:text-sm">Or sign up with</span>
            <span className="h-px flex-1 bg-[#ff6b00]/65" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleProvider("Google")} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-[#ff6b00] bg-white px-3 text-sm font-semibold text-[#303437] transition hover:bg-[#fff7f1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/15 sm:h-[52px] sm:rounded-2xl sm:text-base">
              <GoogleIcon />Google
            </button>
            <button type="button" onClick={() => handleProvider("Apple")} className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-[#ff6b00] bg-white px-3 text-sm font-semibold text-[#303437] transition hover:bg-[#fff7f1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/15 sm:h-[52px] sm:rounded-2xl sm:text-base">
              <AppleIcon />Apple
            </button>
          </div>

          <p className="mt-5 text-center text-sm leading-6 text-[#777c81] sm:text-base">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#f56600] transition hover:text-[#d95500] hover:underline">Sign in</Link>
          </p>
        </div>
      </section>

      {/* Google account selector demo — follows the signup reference in Figma. */}
      {showGooglePicker && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowGooglePicker(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-google-title"
            className="w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-6 pt-5 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-7 sm:pb-7 sm:pt-6"
            style={{ maxHeight: "min(92dvh, 760px)", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between border-b border-[#eceff1] pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#42474c]">
                <GoogleIcon />
                <span>Google account selector</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGooglePicker(false)}
                aria-label="Close Google account selector"
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#697077] transition hover:bg-[#f2f3f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4285f4]"
              >
                ×
              </button>
            </div>

            <div className="px-1 pb-1 pt-6 sm:px-2">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f4ea] text-[#279653]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.2h-2.2c-.3-1.3-1.1-2.3-2.5-2.3-1.8 0-3 1.5-3 4s1.2 4 3 4c1.4 0 2.2-1 2.5-2.3h2.2c-.4 2.8-2.2 4.5-4.9 4.5-3.1 0-5.2-2.4-5.2-6.2s2.1-6.2 5.2-6.2c2.7 0 4.5 1.7 4.9 4.5Z" />
                </svg>
              </div>
              <h2 id="signup-google-title" className="mt-3 text-center text-xl font-semibold tracking-tight text-[#202326] sm:text-2xl">
                Pilih akun
              </h2>
              <p className="mt-1 text-center text-xs text-[#72777c] sm:text-sm">untuk melanjutkan ke BugarHub</p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-[#e5e7e9]">
                {DEMO_GOOGLE_SIGNUP_ACCOUNTS.map((account, index) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleSelectDemoGoogleAccount(account)}
                    className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-[#f7f8f8] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4285f4] sm:px-4 sm:py-3.5 ${index > 0 ? "border-t border-[#e9ebed]" : ""}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${account.avatarClass}`}>
                      {account.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-[#202326] sm:text-sm">{account.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-[#737980] sm:text-xs">{account.email}</span>
                    </span>
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b9095]" fill="none">
                      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setProviderNotice("Mode demo: pilih salah satu akun contoh di atas. Pendaftaran Google asli belum dikonfigurasi.")}
                  className="flex w-full items-center gap-3 border-t border-[#e9ebed] px-3.5 py-3 text-left text-xs font-medium text-[#3f4448] transition hover:bg-[#f7f8f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4285f4] sm:px-4 sm:py-3.5 sm:text-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dadce0] text-xl leading-none text-[#5f6368]">+</span>
                  <span>+ Tambahkan akun lain</span>
                </button>
              </div>

              {providerNotice && (
                <p role="status" className="mt-3 rounded-lg bg-[#fff7f0] px-3 py-2 text-xs leading-5 text-[#a34200]">{providerNotice}</p>
              )}
              <p className="mt-4 text-center text-[9px] leading-4 text-[#969ba0] sm:text-[10px]">
                Untuk melanjutkan, Google akan membagikan nama, alamat email, dan gambar profil Anda ke BugarHub.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Apple sign-up demo — visual flow based on the supplied Figma screen. */}
      {showAppleSheet && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAppleSheet(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-apple-title"
            className="w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-6 pt-5 shadow-2xl shadow-black/30 sm:rounded-[28px] sm:px-7 sm:pb-7 sm:pt-6"
            style={{ maxHeight: "min(92dvh, 760px)", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center text-black">
              <AppleIcon className="h-9 w-9" />
            </div>
            <h2 id="signup-apple-title" className="mt-2 text-center text-lg font-bold tracking-tight text-[#202326] sm:text-[22px]">
              Masuk dengan Apple ID
            </h2>
            <p className="mt-1 text-center text-xs text-[#74797e]">untuk BugarHub</p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#e8e8e8] bg-[#f7f7f7]">
              <div className="flex items-center gap-3 px-3 py-3 sm:px-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#202326] text-xs font-semibold text-white">A</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-[#202326] sm:text-sm">{DEMO_APPLE_SIGNUP_ACCOUNT.name}</span>
                  <span className="mt-0.5 block truncate text-[10px] text-[#777c81] sm:text-[11px]">{DEMO_APPLE_SIGNUP_ACCOUNT.email}</span>
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#4c8d65]" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#e8e8e8] bg-white px-3 py-3 sm:px-3.5">
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-[#303437]">Sembunyikan Email Saya</span>
                {hideAppleEmail && <span className="mt-0.5 block text-[10px] leading-4 text-[#858a8f]">Gunakan alamat email privat untuk demo ini.</span>}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={hideAppleEmail}
                aria-label="Sembunyikan Email Saya"
                onClick={() => setHideAppleEmail((current) => !current)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202326] focus-visible:ring-offset-2 ${hideAppleEmail ? "bg-black" : "bg-[#c8cbd0]"}`}
              >
                <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${hideAppleEmail ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-[#f5f6f6] px-3 py-3 sm:px-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e3e5] bg-white text-[#5f666c]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M12 3.2c-3.3 0-5.8 2.6-5.8 5.9v2.1M17.8 11.2V9.1c0-3.3-2.5-5.9-5.8-5.9M4.2 12v2.7c0 4.1 3.3 7.3 7.8 7.3s7.8-3.2 7.8-7.3V12M8.7 12v2.7c0 1.8 1.4 3.2 3.3 3.2s3.3-1.4 3.3-3.2V9.2c0-1.8-1.4-3.2-3.3-3.2S8.7 7.4 8.7 9.2v2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-[#303437]">Konfirmasi identitas Anda</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-[#858a8f]">Gunakan Face ID atau Touch ID untuk melanjutkan.</span>
              </span>
            </div>

            <p className="mt-3 text-center text-[10px] leading-4 text-[#969ba0]"> Apple Sign-In untuk pengembangan BugarHub.</p>
            <button
              type="button"
              onClick={handleAppleDemoContinue}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#242424] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Lanjutkan
            </button>
            <button
              type="button"
              onClick={() => setShowAppleSheet(false)}
              className="mt-2 flex h-9 w-full items-center justify-center rounded-lg text-xs font-medium text-[#6f7479] transition hover:bg-[#f5f5f5] hover:text-[#202326] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#202326]"
            >
              Batal
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default RegisterPage;
