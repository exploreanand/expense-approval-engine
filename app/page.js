import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();

  // 1. Smart Redirect: If logged in, skip the landing page 
  if (session) {
    const role = session.user.role;
    if (role === "admin") redirect("/admin");
    if (role === "manager") redirect("/manager");
    redirect("/employee");
  }

  // 2. Render Modern Landing Page for public visitors
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-lg p-1.5 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">ExpenseFlow</span>
        </div>
        <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl -z-10" />
        
        <div className="max-w-5xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Odoo x VIT Hackathon 2026
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
            Reimbursement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Management,</span> <br /> 
            Fully Reimagined.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            A high-performance approval engine featuring real-time currency conversion, 
            conditional short-circuit logic, and an immutable 3NF audit trail[cite: 22, 117, 121, 143].
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-xl shadow-blue-200">
              Get Started for Free
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-10 py-4 bg-white text-slate-600 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all">
              View Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid [cite: 14] */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-13V4m0 16v-2" /></svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Multi-Currency Engine</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Automatic normalization via ExchangeRate API. Submit in any currency, approve in your company's base currency[cite: 21, 117].
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Short-Circuit Logic</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Advanced conditional rules that auto-approve remaining steps if key stakeholders approve early[cite: 22, 96, 183].
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Immutable Audit Trail</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Every state change, comment, and override is logged in our 3NF-normalized database for 100% transparency[cite: 26, 121, 143].
            </p>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="max-w-7xl mx-auto px-8 pb-32 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-12">Developed by Team Suvria</p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          <span className="font-black text-2xl text-slate-800">Abhinav</span>
          <span className="font-black text-2xl text-slate-800">Anusha</span>
          <span className="font-black text-2xl text-slate-800">Devashree</span>
          <span className="font-black text-2xl text-slate-800">Aniket</span>
        </div>
      </div>
    </div>
  );
}