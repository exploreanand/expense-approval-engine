import { Bell, Search, Filter, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function EnhancedDashboard() {
  return (
    <div className="p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      {/* Top Utility Bar */}
      <div className="flex justify-between items-center mb-10">
        <div className="relative w-96">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search reports, users, or policies..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition shadow-sm relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 pr-4 rounded-2xl shadow-sm">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-200">AA</div>
            <span className="text-sm font-bold text-slate-700">Abhinav Anand</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Executive Overview</h1>
        <p className="text-slate-500 font-medium mt-2">Real-time expense monitoring and policy compliance.</p>
      </header>

      {/* Modern Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard label="Pending" value="$2,450" change="+12.5%" color="bg-blue-600" />
        <MetricCard label="Approved" value="$8,120" change="+3.2%" color="bg-emerald-500" />
        <MetricCard label="Flagged" value="02" change="System Clean" color="bg-rose-500" />
        <MetricCard label="Efficiency" value="98%" change="Top 5%" color="bg-slate-900" />
      </div>

      {/* Split View: Recent Activity & Policy Quick-Check */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg">Active Submissions</h3>
            <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-4 py-2 rounded-xl transition">View Full Ledger</button>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">Cloud Infrastructure Overage</p>
                      <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">Technology • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">$450.00</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">In Review</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Competent "Policy" Feature Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6">Policy Guard</h3>
            <div className="space-y-6">
              <PolicyItem label="Travel Cap" status="92%" />
              <PolicyItem label="Dining Limit" status="Passed" />
              <PolicyItem label="Receipt Required" status="Active" />
            </div>
            <button className="w-full mt-10 bg-white/10 hover:bg-white/20 border border-white/10 py-4 rounded-2xl font-bold transition text-sm">
              Configure Engine
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all cursor-default group">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">{change}</span>
      </div>
    </div>
  );
}

function PolicyItem({ label, status }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5">
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{status}</span>
    </div>
  );
}