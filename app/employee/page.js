import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { submitExpense } from "@/lib/actions";
import Link from "next/link";
import { redirect } from "next/navigation"; // Added for safety check

export default async function EmployeeDashboard() {
  const session = await getServerSession();
  
  // Safety Check: Kick to login if session dropped
  if (!session || !session.user) {
    redirect("/login");
  }

  // 1. Fetch current user data for the top-right profile widget using EMAIL
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }, // Fix: Query by email
    select: { 
      id: true, // Need this for expenses query
      name: true, 
      role: true, 
      companyId: true // Need this for categories query
    }
  });

  // Handle case where user isn't in DB yet
  if (!currentUser) {
     redirect("/login");
  }

  // 2. Fetch Categories for the dropdown
  const categories = await prisma.expenseCategory.findMany({
    where: { companyId: currentUser.companyId } // Fix: Use currentUser
  });

  // 3. Fetch User's Expense History 
  const expenses = await prisma.expense.findMany({
    where: { submitterId: currentUser.id }, // Fix: Use currentUser
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Calculate Stats for the Top Cards
  const totalApproved = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + Number(e.originalAmount), 0);
    
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
      {/* --- NEW TOP NAVIGATION BAR --- */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded p-1 text-xs font-bold tracking-wider">EF</span>
          <span className="font-bold text-xl text-blue-900 tracking-tight">ExpenseFlow</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <button className="text-gray-400 hover:text-blue-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>

          {/* User Profile Widget */}
          <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-gray-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{currentUser.name}</p>
              <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
            </div>
            {/* Avatar Circle */}
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200 shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
          </Link>
        </div>
      </header>
      {/* ------------------------------ */}

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Stats Container */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back. You have {pendingCount} expenses pending approval.</p>
            </div>
            
            {/* Stat Cards */}
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[150px]">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Approved</p>
                <p className="text-xl font-bold text-gray-900">${totalApproved.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-w-[150px]">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Pending Status</p>
                <p className="text-xl font-bold text-blue-600">{pendingCount} Claims</p>
              </div>
            </div>
          </div>

          {/* Submit Expense Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">+</span>
              Submit New Expense
            </h2>
            
            <form action={submitExpense} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Amount</label>
                    <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Currency</label>
                    <select name="currency" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none">
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Purpose</label>
                  <textarea name="description" rows="3" required placeholder="Explain the reason for this expense..." className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>

                {/* Conversion Alert Box (Visual Only for now) */}
                <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg flex items-center gap-2">
                  <span className="font-semibold">Converted Base Amount:</span> Ready for API conversion
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                    <select name="categoryId" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" required>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Expense Date</label>
                    <input name="date" type="date" required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Receipt Upload</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer h-28">
                    <p className="text-sm font-semibold">Click to upload or drag and drop</p>
                    <p className="text-xs">PDF, PNG, JPG (MAX. 5MB)</p>
                  </div>
                </div>
              </div>

              <div className="col-span-full flex justify-end gap-3 mt-2">
                <button type="reset" className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Clear Draft</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition-colors">Submit Expense Claim</button>
              </div>
            </form>
          </div>

          {/* Recent Expense History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Expense History</h2>
              <button className="text-sm border border-gray-300 rounded-lg px-4 py-1.5 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Filter</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="pb-3 font-semibold px-4">Date</th>
                    <th className="pb-3 font-semibold px-4">Category</th>
                    <th className="pb-3 font-semibold px-4">Amount</th>
                    <th className="pb-3 font-semibold px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className="bg-gray-100 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">{exp.category.name}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900">{exp.originalAmount} {exp.originalCurrency}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          exp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {exp.status === 'approved' ? '● Approved' : exp.status === 'rejected' ? '● Rejected' : '○ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-500 italic">No expenses submitted yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}