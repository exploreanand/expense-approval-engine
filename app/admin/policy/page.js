import { Shield, RotateCcw, Save, Info, Bell, Search } from 'lucide-react';

export default function PolicyConfigurator() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation Bar - Ensures perfect alignment */}
      <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search expenses, reports, or users..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-6">
          <Bell className="text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" size={20} />
          <div className="flex items-center gap-3 border-l pl-6 border-slate-100">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900 leading-none">Jordan Admin</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Admin</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full border-2 border-white shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" alt="avatar" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-12 max-w-6xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              <span>Configuration</span>
              <span className="text-slate-300">→</span>
              <span className="text-blue-600">Policy Engine</span>
            </div>
            <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">Policy Configurator</h1>
            <p className="text-slate-500 font-medium mt-2">Create and manage multi-stage approval workflows for organizational spending.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <RotateCcw size={18} /> Discard
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-400/30 hover:bg-blue-700 transition transform hover:-translate-y-0.5">
              <Save size={18} /> Save Policy
            </button>
          </div>
        </div>

        {/* Policy Definition Card */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Policy Definition</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">Define the core identity and financial boundaries for this expense rule.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10 mt-12">
            <InputField label="Policy Name" placeholder="e.g., Executive International Travel" />
            <InputField label="Expense Category" placeholder="e.g., Travel & Entertainment" />
            <InputField label="Minimum Amount ($)" placeholder="0.00" />
            <InputField label="Maximum Amount ($)" placeholder="5,000.00" />
            <InputField label="Base Currency" placeholder="USD (Default)" disabled />
          </div>
        </section>

        {/* Approval Chain Section Placeholder */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Approval Chain Builder</h2>
          <p className="text-sm text-slate-400 font-medium">Configure the sequence of approvers required for this policy.</p>
          <div className="mt-12 h-48 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50/50 group hover:border-blue-200 transition-colors">
             <div className="p-4 bg-white rounded-full shadow-sm text-slate-300 group-hover:text-blue-500 transition-colors mb-4">
                <Info size={32} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Drag approvers here to start building</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function InputField({ label, placeholder, disabled = false }) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] block pl-1">
        {label}
      </label>
      <input 
        type="text" 
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
    </div>
  );
}