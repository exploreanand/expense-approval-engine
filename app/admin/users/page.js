export default function UserManagement() {
  const users = [
    { name: "Jordan Admin", role: "Admin", manager: "N/A", status: "Active" },
    { name: "Sarah Chen", role: "Manager", manager: "Jordan Admin", status: "Active" },
    { name: "Elena Rodriguez", role: "Employee", manager: "Sarah Chen", status: "Pending" }
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-8 hidden md:block">
        <h2 className="text-2xl font-black text-blue-600 mb-10 tracking-tighter italic">ExpenseFlow</h2>
        <nav className="space-y-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
          <p className="text-blue-600 cursor-pointer">User Management</p>
          <p className="hover:text-blue-600 cursor-pointer">Policy Config</p>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100">
            + Add New User
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manager</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="p-5 font-bold text-gray-900">{user.name}</td>
                  <td className="p-5 text-sm text-gray-600 font-medium">{user.role}</td>
                  <td className="p-5 text-sm text-gray-500">{user.manager}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}