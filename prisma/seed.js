require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Prisma 7 Connection Logic using the pg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // 1. Clean existing data (Prevents duplicates)
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
    data: {
      name: "Suvria",
      countryCode: "IN",
      baseCurrency: "INR",
    },
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
  console.log(`Created ${categories.length} Expense Categories`);

  // 4. Hash a default password for all seed users
  const passwordHash = await bcrypt.hash("password123", 10);

  // 5. Create Users (Admin -> Manager -> Employee)
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "admin@suvria.com",
      name: "Abhinav Anand",
      passwordHash,
      role: "admin",
    },
  });

  const manager = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "manager@suvria.com",
      name: "Anushka",
      passwordHash,
      role: "manager",
      managerId: admin.id, // Manager reports to Admin
    },
  });

  const employee = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "employee@suvria.com",
      name: "Rahul Employee",
      passwordHash,
      role: "employee",
      managerId: manager.id, // Employee reports to Manager
    },
  });
  console.log(`Created Users: Admin, Manager, and Employee`);

  // 6. Create an Approval Policy (All expenses go to Manager first, then Admin)
  const policy = await prisma.approvalPolicy.create({
    data: {
      companyId: company.id,
      name: "Standard Reimbursement Policy",
      minAmount: 0, // Applies to all expenses
      isManagerApprover: true, // Requires direct manager approval first
    },
  });

  // 7. Define the specific approvers for the policy
  await prisma.policyApprover.create({
    data: {
      policyId: policy.id,
      approverId: admin.id,
      sequence: 1,
      label: "Final Finance Review",
    },
  });
  console.log(`Created Approval Policy: ${policy.name}`);

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
