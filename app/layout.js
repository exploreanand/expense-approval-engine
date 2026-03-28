import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-[#f8fafc] min-h-screen">
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Content Area with proper left margin to clear sidebar */}
        <div className="flex-1 ml-72"> 
          <main className="max-w-[1400px] mx-auto min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}