'use client';

import { useState, useRef } from 'react';
import { submitExpense } from '@/lib/actions';

export default function ExpenseForm({ categories }) {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef(null);

  // Client-side wrapper for the Server Action
  async function handleAction(formData) {
    setIsPending(true);
    setError(null);
    
    const response = await submitExpense(formData);
    
    if (!response.success) {
      // If validation fails, show the error elegantly
      setError(response.error);
    } else {
      // If successful, clear the form!
      formRef.current?.reset();
    }
    
    setIsPending(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">+</span>
        Submit New Expense
      </h2>

      {/* --- FIX 2: ELEGANT ERROR DISPLAY --- */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}
      
      <form ref={formRef} action={handleAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount</label>
              <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="w-24">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Currency</label>
              <select name="currency" className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 outline-none">
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Purpose</label>
            <textarea name="description" rows="3" required placeholder="Explain the reason for this expense..." className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>

          <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <span className="font-semibold">Converted Base Amount:</span> Ready for API conversion
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select name="categoryId" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" required>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expense Date</label>
              <input name="date" type="date" required className="w-full border border-gray-300 rounded-lg p-2.5 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Receipt Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer h-28">
              <p className="text-sm font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs">PDF, PNG, JPG (MAX. 5MB)</p>
            </div>
          </div>
        </div>

        <div className="col-span-full flex justify-end gap-3 mt-2">
          <button type="button" onClick={() => { formRef.current?.reset(); setError(null); }} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
            Clear Draft
          </button>
          
          {/* Dynamic Loading Button */}
          <button type="submit" disabled={isPending} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition-colors disabled:bg-blue-400">
            {isPending ? 'Submitting...' : 'Submit Expense Claim'}
          </button>
        </div>
      </form>
    </div>
  );
}