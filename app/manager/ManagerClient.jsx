'use client';

import { useState } from 'react';
import { processApproval } from '@/lib/actions';

export default function ManagerClient({ pendingApprovals }) {
  const [selectedStep, setSelectedStep] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDecision(actionType) {
    if (!selectedStep) return;
    
    setIsPending(true);
    setError(null);

    // Call your Server Action with the exact 3 arguments it expects
    const response = await processApproval(selectedStep.id, actionType, comment);

    if (!response.success) {
      setError(response.error);
    } else {
      // Success! Clear the selection and comment to reflect the updated queue
      setSelectedStep(null);
      setComment("");
    }
    
    setIsPending(false);
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left List: Pending Queue */}
      <div className="flex-1 p-8 overflow-y-auto border-r border-gray-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals Queue</h1>
        <p className="text-sm text-gray-500 mt-1 mb-8">You have {pendingApprovals.length} expenses awaiting your review.</p>
        
        <div className="space-y-3">
          {pendingApprovals.map((step) => (
            <div 
              key={step.id} 
              onClick={() => {
                setSelectedStep(step);
                setError(null);
                setComment("");
              }}
              className={`p-5 rounded-xl border flex items-center justify-between transition-all cursor-pointer group shadow-sm
                ${selectedStep?.id === step.id 
                  ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' 
                  : 'border-gray-100 bg-gray-50/50 hover:border-blue-300 hover:bg-white'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200 group-hover:text-blue-600 transition-colors">
                  {step.expense.submitter.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-none">{step.expense.submitter.name}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase">{step.expense.category.name}</span>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">{new Date(step.expense.expenseDate).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              
              {/* --- FIX APPLIED HERE: INR and ₹ --- */}
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Converted (INR)</p>
                <p className="text-xl font-bold text-gray-900">₹{Number(step.expense.convertedAmount).toFixed(2)}</p>
              </div>
            </div>
          ))}
          {pendingApprovals.length === 0 && (
            <div className="text-center py-20 text-gray-400 italic">No pending requests at this time.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Review Details */}
      <div className="w-full max-w-[450px] p-8 bg-gray-50 overflow-y-auto hidden lg:block">
         <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-0">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-6 tracking-tight">
              <span className="text-blue-600">📋</span> Review Expense
            </h2>

            {!selectedStep ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👈</div>
                <p className="text-sm text-gray-500 font-medium">Select an expense from the queue to review details and take action.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Expense Details */}
                <div className="space-y-4">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Purpose / Description</p>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {selectedStep.expense.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Original Amount</p>
                      <p className="text-sm font-bold text-gray-900">{Number(selectedStep.expense.originalAmount).toFixed(2)} {selectedStep.expense.originalCurrency}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Exchange Rate</p>
                      <p className="text-sm font-bold text-gray-900">{Number(selectedStep.expense.exchangeRate).toFixed(4)}</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                {/* Form Controls */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Reviewer Comments</label>
                      <span className="text-[9px] text-red-400 font-bold">MANDATORY FOR REJECTION</span>
                    </div>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add specific details or feedback for the employee..." 
                      className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      rows="4"
                      disabled={isPending}
                    ></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleDecision('rejected')} 
                      disabled={isPending}
                      className="flex-1 bg-red-100 text-red-600 py-3.5 rounded-xl font-bold hover:bg-red-200 transition-all shadow-sm disabled:opacity-50"
                    >
                      {isPending ? '...' : 'Reject'}
                    </button>
                    <button 
                      onClick={() => handleDecision('approved')} 
                      disabled={isPending}
                      className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
                    >
                      {isPending ? 'Processing...' : 'Approve'}
                    </button>
                  </div>
                </div>

              </div>
            )}
         </div>
      </div>
    </div>
  );
}