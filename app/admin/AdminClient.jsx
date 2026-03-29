'use client';

import { useState } from 'react';
import { adminOverride, createUser, createPolicy } from '@/lib/actions';

export default function AdminClient({ initialData }) {
  const [activeTab, setActiveTab] = useState('expenses'); // expenses, users, policies, audit
  const { allExpenses, users, policies, auditLogs, categories } = initialData;

  const stats = {
    total: allExpenses.length,
    pending: allExpenses.filter(e => e.status === 'pending' || e.status === 'partially_approved').length,
    approved: allExpenses.filter(e => e.status === 'approved').length
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50">
      {/* 162: Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Company Volume</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total} Total Claims</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-xs font-bold text-blue-400 uppercase mb-1">Active Pipeline</p>
          <p className="text-3xl font-bold text-blue-600">{stats.pending} Pending</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
          <p className="text-xs font-bold text-green-400 uppercase mb-1">Burn Rate (Approved)</p>
          <p className="text-3xl font-bold text-green-600">₹{allExpenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + Number(curr.convertedAmount), 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-200/50 p-1 rounded-xl w-fit mb-8">
        {['expenses', 'users', 'policies', 'audit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'audit' ? 'Audit Logs' : tab}
          </button>
        ))}
      </div>

      {/* 165: Global Expense Oversight */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Submitter</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount (Converted)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{exp.submitter.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase">{exp.category.name}</span>
                  </td>
                  <td className="px-6 py-4 font-bold">₹{Number(exp.convertedAmount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        exp.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        exp.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {exp.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(exp.status === 'pending' || exp.status === 'partially_approved') && (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => adminOverride(exp.id, 'reject')} className="text-[10px] font-bold text-red-600 hover:underline">Override Reject</button>
                        <button onClick={() => adminOverride(exp.id, 'approve')} className="text-[10px] font-bold text-green-600 hover:underline">Override Approve</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 166: Immutable Audit Log Viewer */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400">
                  {log.actor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-gray-900"><span className="font-bold">{log.actor.name}</span> <span className="text-gray-400 px-1 font-medium">{log.action}</span> expense: <span className="italic">"{log.expense?.description || 'N/A'}"</span></p>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(log.createdAt).toLocaleString('en-GB')}</p>
                </div>
              </div>
              <div className="text-[10px] font-mono bg-gray-50 px-2 py-1 rounded text-gray-400 border border-gray-100">
                LOG_ID: {log.id.slice(0, 8)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified User Management (Add User button would go here) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center py-20">
          <p className="text-gray-400 italic">User & Policy Management forms can be wired to your existing <code>createUser</code> and <code>createPolicy</code> actions[cite: 151, 157].</p>
        </div>
      )}
    </div>
  );
}