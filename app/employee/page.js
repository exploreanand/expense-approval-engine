import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma"; // This fixes the 'prisma is not defined' error

export default async function EmployeeDashboard() {
  const session = await getServerSession();

  if (!session) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-xl font-bold">Session Missing</h1>
        <p className="text-gray-500">Please log in to access the dashboard.</p>
      </div>
    );
  }

  // Now prisma will work properly
  const categories = await prisma.expenseCategory.findMany({
    where: { companyId: session.user.companyId }
  });

  return (
    <div className="p-8">
      <h1>Welcome {session.user.name}</h1>
      {/* Your dashboard UI here */}
    </div>
  );
}