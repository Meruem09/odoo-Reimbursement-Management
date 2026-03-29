import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-[-10%] w-[120%] h-[800px] bg-gradient-to-b from-[#E0E7FF] via-[#F1F5F9] to-transparent opacity-70 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[-20%] left-[10%] w-[80%] h-[700px] bg-gradient-to-b from-[#DBEAFE]/60 to-transparent blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Navigation Bar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50">
        <nav className="flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Approvia
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/signIn"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signIn"
              className="text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-[0_2px_12px_rgba(59,130,246,0.3)] px-5 py-2.5 rounded-full transition-all"
            >
              Try for free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-4 flex flex-col items-center text-center w-full max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in-up">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-[11px] font-bold text-white tracking-wide uppercase">
            New
          </span>
          <span className="text-[13px] font-medium text-slate-600">
            Next-Gen Expense Solution
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[44px] sm:text-[56px] lg:text-[72px] font-extrabold text-slate-900 leading-[1.05] tracking-tight max-w-4xl mb-6">
          The Smartest Way to{" "}
          <br className="hidden sm:block" />
          Manage Expense Reimbursements.
        </h1>

        {/* Subheadline */}
        <p className="text-[17px] sm:text-[19px] text-slate-600 leading-relaxed max-w-2xl mb-10">
          From submission to approval, handle every expense claim with multi-level workflows, real-time tracking, and zero back-and-forth.
        </p>

        {/* CTA Button */}
        <Link
          href="/signIn"
          className="relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-500 rounded-full group overflow-hidden shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-0.5"
        >
          {/* Subtle button gradient overlay */}
          <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></span>
          <span className="relative z-10">Try for free</span>
        </Link>
      </main>

      {/* Dashboard Image Display */}
      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-8 pb-32 flex justify-center perspective-[1000px]">
        {/* Under-glow for the image */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-blue-500/20 blur-[100px] -z-10 rounded-full" />

        <div className="relative w-full rounded-2xl sm:rounded-[24px] bg-white border border-slate-200 shadow-[0_20px_80px_rgba(0,0,0,0.07)] p-2 sm:p-4 rotate-x-2 transition-all duration-700 hover:rotate-x-0">
          {/* Image inner border */}
          <div className="rounded-xl sm:rounded-[20px] border border-slate-100 overflow-hidden bg-slate-50 relative">
            <Image
              src="/new-dashboard-hero.png"
              alt="Approvia Dashboard Preview"
              width={1400}
              height={900}
              className="w-full h-auto object-cover rounded-[18px]"
              priority
            />
            {/* Top gradient to simulate a soft app header reflection */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
