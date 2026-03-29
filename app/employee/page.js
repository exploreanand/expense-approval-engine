import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { submitExpense } from "@/lib/actions";

export default async function EmployeeDashboard() {
  const session = await getServerSession();
  
  // 1. Fetch Categories for the dropdown
  const categories = await prisma.expenseCategory.findMany({
    where: { companyId: session.user.companyId }
  });

  // 2. Fetch User's Expense History 
  const expenses = await prisma.expense.findMany({
    where: { submitterId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-500">Track and submit your reimbursement claims</p>
        </div>
        {/* Simple "New Expense" form could go in a Modal, here it's simplified */}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Submission Form [cite: 18] */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-4">New Reimbursement Claim</h2>
          <form action={submitExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <div className="flex gap-2">
                <input name="amount" type="number" step="0.01" required className="flex-1 border p-2 rounded-lg" placeholder="0.00" />
                <select name="currency" className="border p-2 rounded-lg bg-gray-50">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="categoryId" className="w-full border p-2 rounded-lg" required>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Expense</label>
              <input name="date" type="date" required className="w-full border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" className="w-full border p-2 rounded-lg" rows="3" placeholder="Lunch with client..."></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Submit Claim
            </button>
          </form>
        </div>

        {/* Right Side: Expense History [cite: 21, 51] */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{exp.category.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{exp.originalAmount} {exp.originalCurrency}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      exp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {exp.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">No expenses submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}