import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session || !session.user) redirect("/login");

  // Fetch user, their company, and their manager (if they have one)
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      company: true,
      manager: { select: { name: true, email: true } }
    }
  });

  if (!currentUser) redirect("/login");

  // If the user is a manager or admin, fetch their direct reports
  let directReports = [];
  if (currentUser.role === 'manager' || currentUser.role === 'admin') {
    directReports = await prisma.user.findMany({
      where: { managerId: currentUser.id, isActive: true },
      select: { name: true, role: true }
    });
  }

  // Determine which dashboard they belong to for the "Back" button
  const dashboardPath = currentUser.role === 'admin' 
    ? '/admin' 
    : currentUser.role === 'manager' 
      ? '/manager' 
      : '/employee';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col items-center justify-center p-6">
      
      {/* Top Branding (Optional, but keeps the flow consistent) */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded p-1 text-xs font-bold">EF</span>
        <span className="font-bold text-xl text-blue-900">ExpenseFlow</span>
      </div>

      <div className="bg-white max-w-xl w-full rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Header / Avatar Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-10 flex flex-col items-center text-center relative">
          <div className="w-24 h-24 bg-white text-blue-700 rounded-full flex items-center justify-center font-bold text-4xl shadow-lg border-4 border-blue-100 mb-4">
            {currentUser.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{currentUser.name}</h1>
          <p className="text-blue-100 font-medium">{currentUser.email}</p>
          
          {/* Dynamic Role Badge */}
          <span className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm ${
            currentUser.role === 'admin' ? 'text-purple-600' :
            currentUser.role === 'manager' ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {currentUser.role}
          </span>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Company</p>
              <p className="text-sm font-bold text-gray-900">{currentUser.company.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Base Currency</p>
              <p className="text-sm font-bold text-gray-900">{currentUser.company.baseCurrency}</p>
            </div>
          </div>

          {/* Hierarchy Details: Show Manager OR Direct Reports */}
          {currentUser.manager && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {currentUser.manager.name.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-bold uppercase">Reports Directly To</p>
                <p className="text-sm font-bold text-gray-900">{currentUser.manager.name}</p>
                <p className="text-xs text-gray-500">{currentUser.manager.email}</p>
              </div>
            </div>
          )}

          {directReports.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
               <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                 <p className="text-xs font-bold text-gray-500 uppercase">Direct Reports ({directReports.length})</p>
               </div>
               <div className="max-h-32 overflow-y-auto p-4 space-y-2">
                 {directReports.map((report, idx) => (
                   <div key={idx} className="flex justify-between items-center text-sm">
                     <span className="font-semibold text-gray-800">{report.name}</span>
                     <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">{report.role}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
          <Link 
            href={dashboardPath}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center shadow-sm"
          >
            Back to Dashboard
          </Link>
          
          {/* Next-Auth Native Sign Out Route */}
          <Link 
            href="/api/auth/signout"
            className="flex-1 bg-red-50 border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors text-center shadow-sm"
          >
            Sign Out
          </Link>
        </div>

      </div>
    </div>
  );
}