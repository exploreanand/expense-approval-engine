// app/approvals/page.js
import { Search, Bell, History, FileText, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

export default function ApprovalsPage() {
  const pendingExpenses = [
    { id: "EXP-1042", user: "Elena Rodriguez", category: "Software", date: "Oct 25, 2024", amount: "318.45", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" },
    { id: "EXP-1043", user: "Jordan Smith", category: "Meals", date: "Oct 26, 2024", amount: "85.50", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" }
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Main Queue Section */}
      <div className="flex-1 p-10 border-r border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-slate-900">Pending Approvals Queue</h1>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition">
            <History size={16} /> History
          </button>
        </div>
        
        <div className="space-y-3">
          {pendingExpenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-5 hover:bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <img src={exp.avatar} className="w-10 h-10 rounded-xl bg-slate-100" />
                <span className="font-bold text-slate-900 w-32">{exp.user}</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">{exp.category}</span>
                <span className="text-xs font-bold text-slate-400 ml-4">{exp.date}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase">Converted (USD)</p>
                    <p className="font-black text-slate-900">${exp.amount}</p>
                </div>
                <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Review Pane */}
      <div className="w-[400px] bg-slate-50/50 p-10">
        <div className="flex items-center gap-2 mb-8 text-blue-600 font-black uppercase tracking-widest text-xs">
          <FileText size={16} /> Review Expense
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
            <p className="text-3xl font-black text-slate-900 mb-6">$1,250.00</p>
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-6">
                <p className="text-[10px] font-bold text-blue-700 italic">Policy Check: Automatically matches travel guidelines for Senior Sales Executive.</p>
            </div>
            <div className="space-y-4">
                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200">Approve</button>
                <button className="w-full py-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl font-black">Reject</button>
            </div>
        </div>
      </div>
    </div>
  );
}