import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import loginBackground from "../assets/login-background.jpg";

function ArrowRightIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4.5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19.5 12h-14m6 6-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailCheckIcon({ className = "h-6 w-6" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2.8" y="4.8" width="18.4" height="14.2" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 7.8 5.8L20 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m15.5 16 1.6 1.6 3.2-3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OTPVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email address";
  const [code, setCode] = useState(["", "", "", ""]);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");
  const inputRefs = useRef([]);

  function updateDigit(index, rawValue) {
    const digits = rawValue.replace(/\D/g, "");
    if (!digits) {
      setCode((current) => current.map((digit, i) => (i === index ? "" : digit)));
      setFeedback("");
      return;
    }

    // If a user pastes a full 4-digit code into one box, distribute the digits.
    if (digits.length > 1) {
      const pasted = digits.slice(0, 4).split("");
      setCode((current) => current.map((digit, i) => pasted[i] ?? (i < index ? current[i] : "")));
      const nextIndex = Math.min(index + pasted.length, 3);
      inputRefs.current[nextIndex]?.focus();
      setFeedback("");
      return;
    }

    setCode((current) => current.map((digit, i) => (i === index ? digits : digit)));
    setFeedback("");
    if (index < 3) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 3) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    event.preventDefault();
    const digits = pasted.split("");
    setCode([digits[0] ?? "", digits[1] ?? "", digits[2] ?? "", digits[3] ?? ""]);
    inputRefs.current[Math.min(digits.length, 3)]?.focus();
    setFeedback("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (code.some((digit) => digit === "")) {
      setFeedbackType("error");
      setFeedback("Enter all 4 digits to continue.");
      inputRefs.current[code.findIndex((digit) => !digit)]?.focus();
      return;
    }
    setFeedbackType("info");
    setFeedback("Demo mode: code verification is not connected to a backend yet. No code has been verified.");
  }

  function handleResend() {
    setCode(["", "", "", ""]);
    inputRefs.current[0]?.focus();
    setFeedbackType("info");
    setFeedback("Demo mode: email delivery is not configured, so a new code has not been sent.");
  }

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
            Account verification
          </p>
          <h2 className="max-w-lg text-4xl font-black leading-[1.1] tracking-tight text-white xl:text-5xl">
            One more step to get back on track<span className="text-[#ff6b00]">.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/75 xl:text-lg">
            Verify your email to continue recovering your BugarHub member account.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-white/80">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Secure recovery</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">4-digit code</span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/55">BugarHub · Move forward, one session at a time.</p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="w-full max-w-[470px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <header className="mb-8 sm:mb-10">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#fff0e5] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f56600]">
              <span className="h-2 w-2 rounded-full bg-[#ff6b00]" />
              Email verification
            </p>
            <h1 className="text-[clamp(2.25rem,4vw,3.1rem)] font-black leading-[1.05] tracking-[-0.045em] text-[#202326]">
              Verification Code<span className="text-[#ff6b00]">.</span>
            </h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-[#767b80] sm:text-lg sm:leading-8">
              We sent a 4-digit code to <span className="font-semibold text-[#45494d]">{email}</span>.
            </p>
          </header>

          <form onSubmit={handleSubmit}>
            <label className="mb-3 block text-sm font-semibold text-[#292d30] sm:text-base" htmlFor="otp-digit-0">
              Enter verification code
            </label>
            <div className="grid grid-cols-4 gap-3 sm:gap-4" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  id={`otp-digit-${index}`}
                  aria-label={`Verification code digit ${index + 1}`}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  type="text"
                  maxLength={4}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className={`h-[66px] w-full rounded-2xl border text-center text-2xl font-extrabold text-[#202326] outline-none transition sm:h-[78px] sm:text-3xl ${digit ? "border-[#ff6b00] bg-[#fff0e5]" : "border-[#dedfdd] bg-[#f7f7f5]"} focus:border-[#ff6b00] focus:bg-white focus:ring-4 focus:ring-[#ff6b00]/10`}
                />
              ))}
            </div>

            <button type="submit" className="group mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#ff6b00] px-6 text-base font-bold text-white shadow-lg shadow-[#ff6b00]/20 transition hover:-translate-y-0.5 hover:bg-[#f26100] hover:shadow-xl hover:shadow-[#ff6b00]/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 active:translate-y-0 sm:mt-8 sm:h-[62px] sm:rounded-2xl sm:text-lg">
              Verify &amp; Continue
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#767b80] sm:text-base">
            Didn&apos;t receive code?{" "}
            <button type="button" onClick={handleResend} className="rounded font-bold text-[#f56600] hover:text-[#d95500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00]">
              Resend
            </button>
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#fff0e5] px-5 py-4 text-[#767b80] sm:mt-8 sm:px-6 sm:py-5">
            <MailCheckIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#ff6b00]" />
            <p className="text-sm leading-6 sm:text-base sm:leading-7">
              Check your inbox and spam folder for the latest code.
            </p>
          </div>

          {feedback && (
            <p
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-5 ${feedbackType === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-[#ffd4b5] bg-[#fff7f0] text-[#8a3b06]"}`}
            >
              {feedback}
            </p>
          )}

          <div className="mt-8 flex justify-center sm:mt-10">
            <button type="button" onClick={() => navigate("/forgot-password")} className="inline-flex items-center gap-3 rounded-lg px-3 py-2 font-semibold text-[#f56600] transition hover:bg-[#fff0e5] hover:text-[#d95500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00] sm:text-lg">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Forgot Password
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OTPVerificationPage;
