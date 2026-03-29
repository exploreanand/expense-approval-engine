'use server'

import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { revalidatePath } from 'next/cache';

// --- SMART SIGNUP (FR-1) ---
export async function smartSignup(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const companyName = formData.get('companyName');
  const countryName = formData.get('country'); 

  try {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error("Password must be 8+ chars with 1 uppercase and 1 digit."); // [cite: 64]
    }

    const countryRes = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=currencies,cca3`); // [cite: 54]
    if (!countryRes.ok) throw new Error("Could not verify country data.");
    
    const countryData = await countryRes.json();
    const countryCode = countryData[0].cca3; // [cite: 126]
    const baseCurrency = Object.keys(countryData[0].currencies)[0]; // [cite: 55, 126]

    const passwordHash = await bcrypt.hash(password, 12); // [cite: 60, 128]

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          countryCode: countryCode,
          baseCurrency: baseCurrency,
        }
      });

      await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'admin',
          companyId: company.id,
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: error.message };
  }
}

// --- APPROVAL ENGINE: POLICY MATCHER (FR-3 & FR-5) ---
// Internal helper to route expenses to the correct approvers
async function createApprovalChain(expenseId, tx) {
  const expense = await tx.expense.findUnique({
    where: { id: expenseId },
    include: { submitter: true }
  });

  // 1. Match Policy by converted amount [cite: 89, 134, 185]
  const policy = await tx.approvalPolicy.findFirst({
    where: {
      companyId: expense.companyId,
      isActive: true,
      minAmount: { lte: expense.convertedAmount },
      OR: [
        { maxAmount: { gte: expense.convertedAmount } },
        { maxAmount: null } 
      ]
    },
    include: { 
      policyApprovers: { orderBy: { sequence: 'asc' } } 
    }
  });

  if (!policy) {
    throw new Error(`No approval policy found for amount: ${expense.convertedAmount}`); // [cite: 80]
  }

  // Link policy to expense [cite: 77]
  await tx.expense.update({
    where: { id: expenseId },
    data: { policyId: policy.id }
  });

  let approvalSteps = [];
  let currentSeq = 1;

  // 2. IS MANAGER APPROVER Logic [cite: 89, 91, 134]
  if (policy.isManagerApprover && expense.submitter.managerId) {
    approvalSteps.push({
      expenseId: expense.id,
      approverId: expense.submitter.managerId,
      sequence: currentSeq++,
      status: 'pending' // [cite: 141]
    });
  }

  // 3. Add defined chain approvers [cite: 89, 91, 136]
  policy.policyApprovers.forEach(pa => {
    approvalSteps.push({
      expenseId: expense.id,
      approverId: pa.approverId,
      sequence: currentSeq++,
      status: 'pending'
    });
  });

  // Create the chain in DB [cite: 78, 141]
  await tx.approvalStep.createMany({
    data: approvalSteps
  });

  // 4. Audit Log Entry [cite: 26, 143]
  await tx.auditLog.create({
    data: {
      companyId: expense.companyId,
      expenseId: expense.id,
      actorId: expense.submitterId,
      action: 'submitted',
      details: { policyName: policy.name, steps: approvalSteps.length }
    }
  });
}

// --- SUBMIT EXPENSE WITH CONVERSION (FR-3 & FR-8) ---
export async function submitExpense(formData) {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated"); // [cite: 16]

  // 1. Extract and Parse Data
  const amount = parseFloat(formData.get('amount'));
  const originalCurrency = formData.get('currency');
  const categoryId = formData.get('categoryId');
  const description = formData.get('description');
  const expenseDate = new Date(formData.get('date'));

  // 2. Mandatory Validations (SRS 3.3.1)
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be greater than 0."); // 
  }

  if (!description || description.length < 10 || description.length > 500) {
    throw new Error("Description must be between 10 and 500 characters."); // [cite: 74, 132]
  }

  if (!categoryId) {
    throw new Error("Category is required."); // 
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const today = new Date();

  if (expenseDate > today || expenseDate < ninetyDaysAgo) {
    throw new Error("Expense date must be within the last 90 days and not in the future."); // 
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 3. Get Base Currency & Fetch Live Rate [cite: 76, 117]
      const company = await tx.company.findUnique({
        where: { id: session.user.companyId },
        select: { baseCurrency: true }
      });

      // Fetch live rate; block submission if API is unreachable (SRS 1.4) [cite: 37, 118]
      const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${originalCurrency}`);
      if (!rateRes.ok) throw new Error("Currency API unreachable. Please try again later."); // [cite: 37, 118]
      
      const rateData = await rateRes.json();
      const rate = rateData.rates[company.baseCurrency];
      const convertedAmount = amount * rate;

      // 4. Create Expense Record 
      const expense = await tx.expense.create({
        data: {
          originalAmount: amount,
          originalCurrency: originalCurrency,
          convertedAmount: convertedAmount, 
          exchangeRate: rate,
          conversionTimestamp: new Date(),
          description,
          expenseDate,
          status: 'pending', // [cite: 33, 79]
          companyId: session.user.companyId,
          submitterId: session.user.id,
          categoryId: categoryId,
        }
      });

      // 5. Run Approval Engine [cite: 78, 185]
      await createApprovalChain(expense.id, tx);

      revalidatePath('/employee');
      return { success: true };
    });
  } catch (error) {
    console.error("Submission Error:", error);
    return { success: false, error: error.message };
  }
}

// --- MANAGER: FETCH PENDING QUEUE (FR-6) ---
/**
 * Retrieves the pending approval requests for the currently logged-in manager[cite: 108].
 * Filters by the 'pending' status in the approval_steps table[cite: 145].
 */
export async function getPendingApprovals() {
  const session = await getServerSession();
  if (!session) return [];

  return await prisma.approvalStep.findMany({
    where: {
      approverId: session.user.id,
      status: 'pending',
      expense: { status: { in: ['pending', 'partially_approved'] } }
    },
    include: {
      expense: {
        include: {
          submitter: true,
          category: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
}

// --- MANAGER: PROCESS APPROVAL/REJECTION (FR-6 & FR-5) ---
/**
 * Processes a manager's decision to approve or reject an expense step[cite: 109, 155].
 * Handles terminal rejections and conditional short-circuiting[cite: 94, 96, 183].
 */
export async function processApproval(stepId, action, comment) {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated");

  // Rejection requires a mandatory comment of at least 10 chars [cite: 93, 109]
  if (action === 'rejected' && (!comment || comment.length < 10)) {
    throw new Error("Rejection requires a mandatory comment (min 10 chars).");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current step with full policy/chain context [cite: 141]
      const currentStep = await tx.approvalStep.findUnique({
        where: { id: stepId },
        include: { 
          expense: { 
            include: { 
              approvalSteps: true,
              policy: { include: { conditionalRule: true } }
            } 
          } 
        }
      });

      if (!currentStep || currentStep.approverId !== session.user.id) {
        throw new Error("Unauthorized action.");
      }

      // 2. Update the current step status [cite: 141]
      await tx.approvalStep.update({
        where: { id: stepId },
        data: { 
          status: action, 
          comment, 
          actedAt: new Date() 
        }
      });

      // 3. Handle REJECTION: Terminal state 
      if (action === 'rejected') {
        await tx.expense.update({
          where: { id: currentStep.expenseId },
          data: { status: 'rejected' }
        });

        // Cancel all remaining future steps [cite: 94]
        await tx.approvalStep.updateMany({
          where: { 
            expenseId: currentStep.expenseId, 
            sequence: { gt: currentStep.sequence } 
          },
          data: { status: 'skipped' }
        });
      } 
      
      // 4. Handle APPROVAL: Sequential + Conditional Logic [cite: 101, 103, 183]
      else if (action === 'approved') {
        const { expense } = currentStep;
        const remainingSteps = expense.approvalSteps.filter(s => s.sequence > currentStep.sequence);
        
        let isFinalStep = remainingSteps.length === 0;
        let shortCircuitTriggered = false;

        // EVALUATE CONDITIONAL RULES (FR-5.3) [cite: 96, 103, 183]
        if (expense.policy?.conditionalRule) {
          const rule = expense.policy.conditionalRule;
          const totalChainSteps = expense.approvalSteps.length;
          const currentApprovedCount = expense.approvalSteps.filter(s => s.status === 'approved').length + 1; // Including current

          // Percentage Rule evaluation [cite: 97, 103]
          if (rule.ruleType === 'percentage' || rule.ruleType === 'hybrid') {
            const approvedPercentage = (currentApprovedCount / totalChainSteps) * 100;
            if (approvedPercentage >= rule.percentageThreshold) shortCircuitTriggered = true;
          }

          // Specific Approver Rule evaluation [cite: 98, 103]
          if (rule.ruleType === 'specific_approver' || rule.ruleType === 'hybrid') {
            if (currentStep.approverId === rule.specificApproverId) shortCircuitTriggered = true;
          }
        }

        // Final Resolution: Approved vs Partially Approved [cite: 83, 95, 104]
        if (shortCircuitTriggered || isFinalStep) {
          await tx.expense.update({
            where: { id: currentStep.expenseId },
            data: { status: 'approved' }
          });

          // Mark any remaining steps as Auto-Approved 
          if (shortCircuitTriggered) {
            await tx.approvalStep.updateMany({
              where: { expenseId: currentStep.expenseId, status: 'pending' },
              data: { status: 'auto_approved', actedAt: new Date() }
            });
          }
        } else {
          // Expense moves to partially approved state [cite: 83, 176]
          await tx.expense.update({
            where: { id: currentStep.expenseId },
            data: { status: 'partially_approved' }
          });
        }
      }

      // 5. Create Audit Log entry for the action [cite: 26, 143, 189]
      await tx.auditLog.create({
        data: {
          companyId: session.user.companyId,
          expenseId: currentStep.expenseId,
          actorId: session.user.id,
          action: action, // 'approved' or 'rejected'
          details: { comment: comment || "No comment" }
        }
      });

      revalidatePath('/manager');
      return { success: true };
    });
  } catch (error) {
    console.error("Approval Processing Error:", error);
    return { success: false, error: error.message };
  }
}

// --- ADMIN: FETCH ALL EXPENSES (FR-7) ---
export async function getAllExpenses() {
  const session = await getServerSession();
  if (session?.user.role !== 'admin') return []; [cite: 153]

  return await prisma.expense.findMany({
    where: { companyId: session.user.companyId },
    include: { submitter: true, category: true, policy: true },
    orderBy: { createdAt: 'desc' }
  });
}

// --- ADMIN: OVERRIDE ACTION (FR-7) ---
export async function adminOverride(expenseId, action) {
  const session = await getServerSession();
  if (session?.user.role !== 'admin') throw new Error("Unauthorized"); [cite: 113]

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Force update the expense status 
      await tx.expense.update({
        where: { id: expenseId },
        data: { status: action === 'approve' ? 'approved' : 'rejected' }
      });

      // 2. Mark all pending steps as 'admin_override' [cite: 189]
      await tx.approvalStep.updateMany({
        where: { expenseId: expenseId, status: 'pending' },
        data: { 
          status: action === 'approve' ? 'approved' : 'rejected',
          comment: `Admin Override: ${action.toUpperCase()}`,
          actedAt: new Date()
        }
      });

      // 3. Log the override in the Audit Log [cite: 113, 143]
      await tx.auditLog.create({
        data: {
          companyId: session.user.companyId,
          expenseId: expenseId,
          actorId: session.user.id,
          action: 'admin_override',
          details: { decision: action }
        }
      });

      revalidatePath('/admin');
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// --- ADMIN: CREATE USER (FR-2) ---
export async function createUser(formData) {
  const session = await getServerSession();
  if (session?.user.role !== 'admin') throw new Error("Unauthorized"); [cite: 67]

  const email = formData.get('email');
  const role = formData.get('role'); // 'employee' or 'manager' [cite: 67]
  const managerId = formData.get('managerId') || null; [cite: 68]

  try {
    const passwordHash = await bcrypt.hash('welcome123', 12); // Temp password [cite: 67]

    await prisma.user.create({
      data: {
        name: formData.get('name'),
        email,
        passwordHash,
        role,
        managerId,
        companyId: session.user.companyId,
      }
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create user (Email may already exist)." }; [cite: 63]
  }
}

// --- ADMIN: FETCH POTENTIAL MANAGERS (FR-2) ---
export async function getManagers() {
  const session = await getServerSession();
  if (session?.user.role !== 'admin') return [];

  return await prisma.user.findMany({
    where: { 
      companyId: session.user.companyId,
      role: 'manager',
      isActive: true 
    },
    select: { id: true, name: true }
  });
}