import { ShieldCheck, Key, Eye, Lock, Globe, FileDown, ShieldAlert, Fingerprint, Activity } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-12">
      {/* Header with Report Export */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Security</h1>
          <p className="text-slate-500 font-medium mt-1">Manage infrastructure access, encryption, and global authentication policies.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm group">
          <FileDown size={18} className="group-hover:text-blue-600 transition-colors" /> 
          Download Audit Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column: Security Controls */}
        <div className="col-span-2 space-y-8">
          
          {/* Authentication Policy Card */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Fingerprint size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Authentication</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Access Rules</p>
              </div>
            </div>

            <div className="space-y-6">
              <SecurityToggle 
                title="Multi-Factor Authentication (MFA)" 
                description="Require all administrative users to use a hardware key or authenticator app."
                enabled={true}
              />
              <SecurityToggle 
                title="Session Timeout" 
                description="Automatically log out inactive users after 30 minutes."
                enabled={true}
              />
              <SecurityToggle 
                title="IP Whitelisting" 
                description="Restrict dashboard access to recognized corporate office IP ranges."
                enabled={false}
              />
            </div>
          </section>

          {/* API Management */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Key size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-900">Infrastructure API Keys</h2>
              </div>
              <button className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                Generate New Key
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-between border border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Secret Key</p>
                <p className="font-mono text-sm font-bold text-slate-600 tracking-tighter">ef_live_••••••••••••••••4k2p</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                  <Eye size={18} />
                </button>
                <button className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-colors">
                  <Lock size={18} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Real-time Status */}
        <div className="space-y-8">
          {/* Security Health Score */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
            <ShieldCheck size={40} className="mb-6 text-blue-400" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Security Health Score</p>
            <p className="text-6xl font-black mt-2 mb-6">98<span className="text-2xl text-blue-400">%</span></p>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[98%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            </div>
            <p className="text-xs font-bold mt-6 leading-relaxed text-slate-400">
              <span className="text-blue-400">Excellent.</span> All critical systems are patched and encrypted.
            </p>
          </div>

          {/* Live Audit Log */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-blue-600" /> Live Audit Log
                </h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
              <AuditItem user="Jordan Admin" action="Updated Travel Policy" time="2 mins ago" type="policy" />
              <AuditItem user="System" action="API Key Rotated" time="4 hours ago" type="system" />
              <AuditItem user="Sarah Chen" action="User Provisioned" time="1 day ago" type="user" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityToggle({ title, description, enabled }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-slate-50 last:border-0">
      <div className="max-w-[80%]">
        <p className="font-black text-slate-800 tracking-tight">{title}</p>
        <p className="text-[11px] text-slate-400 font-bold mt-1 leading-relaxed">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${enabled ? 'bg-blue-600 shadow-inner' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${enabled ? 'left-7' : 'left-1'}`}></div>
      </div>
    </div>
  );
}

function AuditItem({ user, action, time, type }) {
  const colors = {
    policy: 'bg-blue-500',
    system: 'bg-amber-500',
    user: 'bg-purple-500'
  };

  return (
    <div className="flex gap-4 relative z-10">
      <div className={`w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm ring-1 ring-slate-100 ${colors[type] || 'bg-slate-400'} mt-1 shrink-0`}></div>
      <div>
        <p className="text-xs font-black text-slate-900 leading-tight">{action}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">
          {user} <span className="mx-1 opacity-30">•</span> {time}
        </p>
      </div>
    </div>
  );
}