import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { processApproval } from "@/lib/actions";
import Link from "next/link";

export default async function ManagerDashboard() {
  const session = await getServerSession();
  
  // 1. Fetch current user data (Safety check for email lookup)
  if (!session || !session.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true }
  });

  // 2. Fetch expenses waiting for THIS manager's approval [cite: 155, 398]
  const pendingApprovals = await prisma.approvalStep.findMany({
    where: {
      approverId: currentUser.id,
      status: 'pending'
    },
    include: {
      expense: {
        include: {
          submitter: true,
          category: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Top Navigation Bar [cite: 177] */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded p-1 text-xs font-bold">EF</span>
          <span className="font-bold text-xl text-blue-900">ExpenseFlow</span>
        </div>
        <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-lg transition-colors">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold border border-blue-200">
            {currentUser.name.charAt(0)}
          </div>
        </Link>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar [cite: 177, 395-399] */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
          <nav className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
            <div className="space-y-1">
              <div className="p-2.5 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer text-sm font-medium">Dashboard</div>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">Approvals</div>
            </div>
          </nav>
          <button className="text-sm text-gray-500 hover:text-red-600 transition-colors p-2 border-t font-medium">Logout</button>
        </aside>

        {/* Dashboard Grid [cite: 401] */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* List: Pending Queue [cite: 396-419] */}
          <div className="flex-1 p-8 overflow-y-auto border-r border-gray-100 bg-white">
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals Queue</h1>
            <p className="text-sm text-gray-500 mt-1 mb-8">You have {pendingApprovals.length} expenses awaiting your review.</p>
            
            <div className="space-y-3">
              {pendingApprovals.map((step) => (
                <div key={step.id} className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between hover:border-blue-300 hover:bg-white transition-all cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200 group-hover:text-blue-600 transition-colors">
                      {step.expense.submitter.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-none">{step.expense.submitter.name}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase">{step.expense.category.name}</span>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium">{new Date(step.expense.expenseDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Converted (USD)</p>
                    <p className="text-xl font-bold text-gray-900">${Number(step.expense.convertedAmount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="text-center py-20 text-gray-400 italic">No pending requests at this time.</div>
              )}
            </div>
          </div>

          {/* Right Panel: Review Details [cite: 406-441] */}
          <div className="w-[400px] p-8 bg-gray-50 overflow-y-auto">
             <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-0">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-6 tracking-tight">
                  <span className="text-blue-600">📋</span> Review Expense
                </h2>

                <div className="space-y-5">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
                      "Select an expense from the list to view full receipt evidence and descriptions." [cite: 421-427]
                    </p>
                  </div>

                  <form action={processApproval} className="space-y-5">
                    {/* stepId would be set dynamically when clicking a row */}
                    <input type="hidden" name="stepId" value="" /> 
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reviewer Comments</label>
                        <span className="text-[9px] text-gray-400 font-bold">MANDATORY FOR REJECTION [cite: 109, 437]</span>
                      </div>
                      <textarea 
                        name="comment" 
                        placeholder="Add specific details or feedback for the employee..." 
                        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        rows="5"
                      ></textarea>
                    </div>

                    <div className="flex gap-3">
                      <button name="action" value="reject" className="flex-1 bg-red-100 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-200 transition-all shadow-sm">Reject</button>
                      <button name="action" value="approve" className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">Approve</button>
                    </div>
                  </form>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}