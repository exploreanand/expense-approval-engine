import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/component/Footer"; // Import your new component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ExpenseFlow | Reimbursement Management",
  description: "A high-performance expense approval engine built for the Odoo x VIT Hackathon",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* The main content area grows to fill space, pushing footer down */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* Global Footer containing team credits and tech stack */}
        <Footer />
      </body>
    </html>
  );
}