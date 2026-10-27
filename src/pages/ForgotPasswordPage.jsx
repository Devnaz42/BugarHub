import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import loginBackground from "../assets/login-background.jpg";


function MailIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon({ className = "h-6 w-6" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 19 6v5c0 4.4-2.8 8-7 10-4.2-2-7-5.6-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

function ArrowLeftIcon({ className = "h-5 w-5" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19.5 12h-14m6 6-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    // Frontend preview only: the backend/email service is not integrated yet.
    navigate("/verify-otp", { state: { email: email.trim() } });
  }

  return (
    <main className="min-h-screen bg-[#f4f4f2] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#202326] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <img src={loginBackground} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#111315]/80 via-[#202326]/55 to-[#202326]/90" />
        <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#ff6b00]/25 blur-3xl" />
        <div className="relative z-10 inline-flex w-fit rounded-2xl bg-white px-4 py-3 shadow-lg shadow-black/10"><Logo /></div>

        <div className="relative z-10 max-w-xl pb-5">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-[#ff6b00]" />Account recovery</p>
          <h2 className="max-w-lg text-4xl font-black leading-[1.1] tracking-tight text-white xl:text-5xl">Get back to your fitness journey<span className="text-[#ff6b00]">.</span></h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/75 xl:text-lg">Reset your password securely and get back to booking sessions, finding classes, and managing your membership.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-white/80"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Secure recovery</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-2">Member account</span></div>
        </div>

        <p className="relative z-10 text-xs text-white/55">BugarHub · Move forward, one session at a time.</p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-8 xl:px-14">
        <div className="w-full max-w-[470px]">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <header className="mb-8 sm:mb-10">
            <h1 className="text-[clamp(2.25rem,4vw,3.1rem)] font-black leading-[1.05] tracking-[-0.045em] text-[#202326]">Reset Password<span className="text-[#ff6b00]">.</span></h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-[#767b80] sm:text-lg sm:leading-8">Enter your email address and we will send you a verification code.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-[#292d30] sm:text-base">Email Address</label>
              <div className="flex items-center gap-3 rounded-xl border border-[#e1e2e0] bg-[#f7f7f5] px-4 text-[#7d8287] transition focus-within:border-[#ff6b00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff6b00]/10 sm:rounded-2xl sm:px-5">
                <MailIcon className="h-5 w-5 shrink-0" />
                <input id="reset-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="h-14 w-full min-w-0 border-0 bg-transparent px-0 text-base text-[#202326] outline-none placeholder:text-[#9a9ea2] focus:ring-0 sm:h-[62px] sm:text-lg" />
              </div>
            </div>
            <button type="submit" className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#ff6b00] px-6 text-base font-bold text-white shadow-lg shadow-[#ff6b00]/20 transition hover:-translate-y-0.5 hover:bg-[#f26100] hover:shadow-xl hover:shadow-[#ff6b00]/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b00]/25 active:translate-y-0 sm:h-[62px] sm:rounded-2xl sm:text-lg">Send Code<ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" /></button>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#fff0e5] px-5 py-4 text-[#767b80] sm:mt-8 sm:px-6 sm:py-5"><ShieldIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#ff6b00]" /><p className="text-sm leading-6 sm:text-base sm:leading-7">For your security, the code will expire in 10 minutes.</p></div>
          <p className="mt-4 rounded-xl border border-[#ffd4b5] bg-[#fff7f0] px-4 py-3 text-sm leading-5 text-[#8a3b06]">Preview mode: email delivery is not connected yet. Continue to preview the verification screen; no email will be sent.</p>

          <div className="mt-8 flex justify-center sm:mt-10"><Link to="/login" className="inline-flex items-center gap-3 rounded-lg px-3 py-2 font-semibold text-[#f56600] transition hover:bg-[#fff0e5] hover:text-[#d95500] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b00] sm:text-lg"><ArrowLeftIcon className="h-5 w-5" />Back to Login</Link></div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
