import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ManagerClient from "./ManagerClient";

export default async function ManagerDashboard() {
  const session = await getServerSession();
  
  if (!session || !session.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, role: true }
  });

  if (!currentUser) redirect("/login");

  const pendingApprovals = await prisma.approvalStep.findMany({
    where: {
      approverId: currentUser.id,
      status: 'pending'
    },
    include: {
      expense: {
        include: {
          submitter: true,
          category: true,
          policy: true 
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // FIX: Serialize the data to remove Decimal/Date objects before passing to Client Component
  const serializedApprovals = JSON.parse(JSON.stringify(pendingApprovals));

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
        {/* Left Sidebar [cite: 177] */}
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between hidden md:flex">
          <nav className="space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
            <div className="space-y-1">
              <Link href="/employee" className="block p-2.5 rounded-lg hover:bg-gray-50 text-gray-600 cursor-pointer text-sm font-medium">My Expenses</Link>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm">Approvals Queue</div>
            </div>
          </nav>
          {/* Signout functionality handled via profile page or custom link [cite: 149] */}
          <Link href="/api/auth/signout" className="text-sm text-gray-500 hover:text-red-600 transition-colors p-2 border-t font-medium text-left">Logout</Link>
        </aside>

        {/* Dashboard Grid - Render the interactive Client Component [cite: 108] */}
        <ManagerClient pendingApprovals={serializedApprovals} />
      </main>
    </div>
  );
}