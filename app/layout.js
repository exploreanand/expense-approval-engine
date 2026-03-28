import Link from 'next/link';
import "./globals.css";

// 1. Define the Sidebar as a separate piece
function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 p-6 shadow-sm flex flex-col">
      <h2 className="text-2xl font-black text-blue-600 mb-10 tracking-tighter italic">ExpenseFlow</h2>
      <nav className="flex-1 space-y-2 font-bold text-gray-500">
        <Link href="/employee" className="block p-3 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition">
          🏠 Dashboard
        </Link>
        <Link href="/admin/users" className="block p-3 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition">
          👥 User Management
        </Link>
        <Link href="/expense/1" className="block p-3 hover:bg-blue-50 rounded-lg hover:text-blue-600 transition">
          📄 Expense Details
        </Link>
      </nav>
    </aside>
  );
}

// 2. This is the MAIN frame that holds everything
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar /> 
        <main className="flex-1 bg-gray-50 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
