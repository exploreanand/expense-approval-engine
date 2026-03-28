'use client'; // Required for usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  CheckSquare, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/employee', icon: LayoutDashboard },
    { 
      name: 'Approvals', 
      href: '/approvals', // FIX: Changed from '#' to enable the page
      icon: CheckSquare,
      badge: 5 // Matches the "5 expenses awaiting review"
    },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Policy Config', href: '/admin/policy', icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50">
      {/* Brand Logo */}
      <div className="p-10 mb-4">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white not-italic text-sm">E</div>
          ExpenseFlow
        </h1>
      </div>

      <div className="px-6 mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Main Menu</p>
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                  isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                </div>
                
                {item.badge ? (
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md shadow-blue-200">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight size={14} className="opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Quick Settings */}
      <div className="px-6 mt-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">System</p>
        <Link 
          href="/admin/settings"
          className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
        >
          <ShieldCheck size={20} />
          <span className="text-sm tracking-tight">Security</span>
        </Link>
      </div>

      {/* User Session */}
      <div className="mt-auto p-6 border-t border-slate-50">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl overflow-hidden border-2 border-white">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Chen" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-slate-900 truncate">Sarah Chen</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase truncate">Manager</p>
          </div>
        </div>
        
        <button className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 font-bold hover:text-rose-500 transition-colors group">
          <div className="p-2 rounded-lg group-hover:bg-rose-50 transition-colors">
            <LogOut size={18} />
          </div>
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}