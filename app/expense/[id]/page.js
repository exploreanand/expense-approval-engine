import Link from 'next/link';
import { ArrowLeft, Download, Calendar, Tag, DollarSign, ShieldCheck, FileText } from 'lucide-react';

export default async function ExpensePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <div className="p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-12">
        <Link href="/employee" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Overview
        </Link>
        <div className="flex gap-4">
          <button className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Download size={20} />
          </button>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
            Approve Expense
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Report #{id}</span>
                <h2 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">Quarterly Team Offsite</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Amount</p>
                <p className="text-4xl font-black text-slate-900">$1,250.00</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-t border-slate-50">
              <DetailItem icon={Calendar} label="Date" value="March 24, 2026" />
              <DetailItem icon={Tag} label="Category" value="Travel & Events" />
              <DetailItem icon={ShieldCheck} label="Policy Status" value="Compliant" color="text-emerald-500" />
              <DetailItem icon={FileText} label="Attachment" value="receipt_offsite.pdf" />
            </div>
          </div>
        </div>

        {/* Sidebar Summary Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <h3 className="text-xl font-black mb-6">Audit Log</h3>
          <div className="space-y-6 relative z-10">
            <AuditStep title="Submitted" date="2h ago" active />
            <AuditStep title="Policy Check" date="1h ago" active />
            <AuditStep title="Manager Review" date="Pending" />
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, color = "text-slate-900" }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Icon size={20} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`font-bold mt-1 ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function AuditStep({ title, date, active }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4">
      <span className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{title}</span>
      <span className="text-[10px] font-black text-blue-400 uppercase">{date}</span>
    </div>
  );
}