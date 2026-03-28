export default function ExpenseDetail() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Top Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Report: #EXP-2024-0812</h1>
            <p className="text-gray-500 text-sm">Submitted on Oct 12, 2024 at 09:45 AM</p>
          </div>
          <button className="bg-white border border-gray-300 px-4 py-2 rounded shadow-sm text-sm font-bold hover:bg-gray-50">
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary & Receipt (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Expense Summary</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-blue-600">$1,240.50</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Merchant</p>
                  <p className="text-lg font-bold text-gray-800">Grand Hyatt Berlin</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-gray-700 italic">
                "Submitting travel expenses for the Berlin Summit. All receipts attached."
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Receipt Evidence</h2>
              <div className="aspect-video border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
                <span className="text-green-600 font-bold mb-2">✓ Verified Receipt</span>
                <button className="text-blue-600 text-sm font-bold hover:underline">View Full Size</button>
              </div>
            </div>
          </div>

          {/* Approval Workflow (Right 1/3) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Approval Workflow</h2>
            <div className="space-y-10 relative border-l-2 border-gray-100 ml-4 pl-8">
              <div className="relative">
                <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-green-500 border-4 border-white"></div>
                <p className="font-bold text-sm">Alex Rivera (Requestor)</p>
                <p className="text-xs text-green-600 font-bold">Approved — Oct 12</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-green-500 border-4 border-white"></div>
                <p className="font-bold text-sm">Sarah Jenkins (Manager)</p>
                <p className="text-xs text-green-600 font-bold">Approved — Oct 12</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] w-5 h-5 rounded-full bg-blue-200 border-4 border-white"></div>
                <p className="font-bold text-sm text-gray-400">Marcus Vane (Finance)</p>
                <p className="text-xs text-blue-600 font-bold italic underline">Processing...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}