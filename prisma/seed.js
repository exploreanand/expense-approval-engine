require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Prisma Connection Logic
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting Demo Database Seeding...");

  // 1. Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.conditionalRule.deleteMany();
  await prisma.policyApprover.deleteMany();
  await prisma.approvalPolicy.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // 2. Create the Company
  const company = await prisma.company.create({
    data: { name: "Suvria", countryCode: "IN", baseCurrency: "INR" },
  });
  console.log(`Created Company: ${company.name}`);

  // 3. Create Expense Categories
  const categories = await prisma.expenseCategory.createManyAndReturn({
    data: [
      { companyId: company.id, name: "Travel & Transport" },
      { companyId: company.id, name: "Meals & Entertainment" },
      { companyId: company.id, name: "Marketing & Promotions" },
      { companyId: company.id, name: "Office Supplies" },
    ],
  });

  // 4. Hash password securely
  const passwordHash = await bcrypt.hash("password123", 12); // Updated to cost 12 for compliance

  // 5. Create Users (Admin -> Manager -> Employee)
  const admin = await prisma.user.create({
    data: { companyId: company.id, email: "admin@suvria.com", name: "Abhinav Anand", passwordHash, role: "admin" },
  });

  const manager = await prisma.user.create({
    data: { companyId: company.id, email: "manager@suvria.com", name: "Anushka", passwordHash, role: "manager", managerId: admin.id },
  });

  const employee = await prisma.user.create({
    data: { companyId: company.id, email: "employee@suvria.com", name: "Rahul Employee", passwordHash, role: "employee", managerId: manager.id },
  });
  console.log(`👥 Created Users: Admin, Manager, and Employee`);

  // 6. Create an Approval Policy (Manager -> Admin)
  const policy = await prisma.approvalPolicy.create({
    data: {
      companyId: company.id,
      name: "Standard Reimbursement Policy",
      minAmount: 0,
      isManagerApprover: true, 
    },
  });

  await prisma.policyApprover.create({
    data: { policyId: policy.id, approverId: admin.id, sequence: 1 },
  });

  // 7. NEW: Add a Conditional Short-Circuit Rule (FR-5.3)
  // Rule: If the Admin approves this step early, short-circuit the rest of the chain.
  await prisma.conditionalRule.create({
    data: {
      policyId: policy.id,
      ruleType: "specific_approver",
      specificApproverId: admin.id
    }
  });
  console.log(`Created Policy with Conditional Short-Circuit Rule`);

  // 8. NEW: Seed Demo Expenses so the UI isn't empty!
  const expenseDate = new Date();
  expenseDate.setDate(expenseDate.getDate() - 2); // 2 days ago

  const expense = await prisma.expense.create({
    data: {
      companyId: company.id,
      submitterId: employee.id,
      categoryId: categories[1].id, // Meals
      policyId: policy.id,
      originalAmount: 4500,
      originalCurrency: "INR",
      convertedAmount: 4500,
      exchangeRate: 1.0,
      conversionTimestamp: new Date(), // <--- ADDED REQUIRED FIELD HERE
      description: "Client Lunch for Makhana Pops pitch",
      expenseDate: expenseDate,
      status: "pending",
    }
  });

  // Create the Pending Steps for this expense
  await prisma.approvalStep.createMany({
    data: [
      { expenseId: expense.id, approverId: manager.id, sequence: 1, status: 'pending' },
      { expenseId: expense.id, approverId: admin.id, sequence: 2, status: 'pending' }
    ]
  });

  // Create Initial Audit Log
  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      expenseId: expense.id,
      actorId: employee.id,
      action: 'submitted',
      details: { policyName: policy.name, steps: 2, comment: "Initial Submission" }
    }
  });
  console.log(`Seeded Pending Expense for Demo Queue`);

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });