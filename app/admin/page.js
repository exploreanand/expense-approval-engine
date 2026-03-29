import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminClient from "./AdminClient";

export default async function AdminDashboard() {
  const session = await getServerSession();
  if (!session || !session.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true, companyId: true }
  });

  // FR-7: Security Gate - Only System Admins allowed [cite: 111]
  if (!currentUser || currentUser.role !== 'admin') redirect("/employee");

  // Parallel data fetching for maximum performance [cite: 162-166]
  const [users, allExpenses, policies, auditLogs, categories] = await Promise.all([
    prisma.user.findMany({ where: { companyId: currentUser.companyId }, orderBy: { name: 'asc' } }),
    prisma.expense.findMany({ 
      where: { companyId: currentUser.companyId }, 
      include: { submitter: true, category: true }, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.approvalPolicy.findMany({ 
      where: { companyId: currentUser.companyId }, 
      include: { policyApprovers: true, conditionalRule: true } 
    }),
    prisma.auditLog.findMany({ 
      where: { companyId: currentUser.companyId }, 
      include: { actor: { select: { name: true } }, expense: { select: { description: true } } }, 
      orderBy: { createdAt: 'desc' },
      take: 50 
    }),
    prisma.expenseCategory.findMany({ where: { companyId: currentUser.companyId } })
  ]);

  // Clean serialization for Client Component boundary
  const data = JSON.parse(JSON.stringify({
    users,
    allExpenses,
    policies,
    auditLogs,
    categories
  }));

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-slate-900">
      {/* Modern Blurred Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-4 flex justify-between items-center sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-lg p-1.5 shadow-sm shadow-blue-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Expense<span className="text-blue-600">Flow</span></span>
        </div>

        <div className="flex items-center gap-8">
          {/* Subtle Global Search (Visual Only) */}
          <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search audit logs..." className="bg-transparent border-none outline-none text-xs ml-2 w-48 text-slate-600 placeholder:text-slate-400 placeholder:font-medium" />
          </div>

          <Link href="/profile" className="flex items-center gap-4 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all group border border-transparent hover:border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{currentUser.name}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">System Root</p>
              </div>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-purple-100 group-hover:scale-105 transition-transform">
              {currentUser.name.charAt(0)}
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Refined Sidebar with Icons */}
        <aside className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col justify-between hidden md:flex">
          <div className="space-y-10">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Operations</p>
              <nav className="space-y-2">
                <Link href="/employee" className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-semibold group">
                  <svg className="w-5 h-5 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Personal Hub
                </Link>
                <Link href="/manager" className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-sm font-semibold group">
                  <svg className="w-5 h-5 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  Approval Tasks
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Administration</p>
              <nav className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold shadow-sm shadow-purple-50 border border-purple-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Control Center
                </div>
              </nav>
            </div>
          </div>

          <Link href="/api/auth/signout" className="flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-bold border-t border-slate-100 pt-8 group">
            <svg className="w-5 h-5 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            System Logout
          </Link>
        </aside>

        {/* Full-Height Client Viewport */}
        <section className="flex-1 h-full overflow-hidden flex flex-col">
          <AdminClient initialData={data} />
        </section>
      </main>
    </div>
  );
}