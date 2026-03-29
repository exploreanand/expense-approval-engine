import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white rounded-lg p-1 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">ExpenseFlow</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              A high-performance reimbursement management system built for the Odoo x VIT Hackathon 2026.
            </p>
          </div>

          {/* Team Section [cite: 7] */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-4">Development Team</h3>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li>Abhinav (Backend Lead)</li>
              <li>Anusha (Full-Stack)</li>
              <li>Devashree (Full-Stack)</li>
              <li>Aniket (Frontend Lead)</li>
            </ul>
          </div>

          {/* Tech Stack Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-4">Core Engine</h3>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li>Next.js & Prisma ORM</li>
              <li>PostgreSQL (3NF Schema)</li>
              <li>ExchangeRate API</li>
              <li>REST Countries API</li>
            </ul>
          </div>

          {/* DASHBOARD BUTTONS [cite: 16, 248] */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-4">Dashboards</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin">
                <button className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-purple-100 hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                  Admin
                </button>
              </Link>
              <Link href="/manager">
                <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  Manager
                </button>
              </Link>
              <Link href="/employee">
                <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                  Employee
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-medium">
            &copy; 2026 ExpenseFlow. Built for Odoo x VIT Hackathon.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">7-Hour Sprint [cite: 11]</span>
          </div>
        </div>
      </div>
    </footer>
  );
}