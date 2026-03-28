import { Search, UserPlus, Download, Mail, MoreVertical, CheckCircle2, Clock } from 'lucide-react';

export default function UserManagement() {
  const users = [
    { id: "EF-1001", name: "Jordan Admin", email: "jordan.a@expenseflow.com", role: "Admin", manager: "N/A (Root)", status: "Active" },
    { id: "EF-1002", name: "Sarah Chen", email: "s.chen@expenseflow.com", role: "Manager", manager: "Jordan Admin", status: "Active" },
    { id: "EF-1003", name: "Marcus Wright", email: "m.wright@expenseflow.com", role: "Employee", manager: "Sarah Chen", status: "Active" },
    { id: "EF-1004", name: "Elena Rodriguez", email: "e.rodriguez@expenseflow.com", role: "Employee", manager: "Sarah Chen", status: "Pending" },
  ];

  return (
    <div className="p-12 min-h-screen bg-[#f8fafc]">
      {/* Header with Action Buttons */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium mt-1">Configure organizational hierarchy, roles, and access permissions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Download size={18} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
            <UserPlus size={18} /> Add New User
          </button>
        </div>
      </header>

      {/* Filter Row */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by name or email..." 
            className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
        <select className="bg-white border border-slate-100 rounded-xl px-6 py-3 shadow-sm outline-none font-bold text-slate-600 focus:ring-2 focus:ring-blue-500">
          <option>All Roles</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Employee</option>
        </select>
      </div>

      {/* Enhanced Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact Information</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Reporting Manager</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center font-black text-blue-600">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Mail size={14} className="text-slate-300" /> {user.email}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-slate-700">{user.role}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-slate-500">{user.manager}</span>
                </td>
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                    user.status === 'Active' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {user.status === 'Active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {user.status}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Showing 1 to 4 of 128 entries</p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-400 hover:bg-white transition">Previous</button>
            <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white shadow-sm transition">1</button>
            <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-400 hover:bg-white transition">2</button>
            <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-400 hover:bg-white transition">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}