'use server'

import prisma from './prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth";
import { revalidatePath } from 'next/cache';

/**
 * --- SMART SIGNUP (FR-1) ---
 */
export async function smartSignup(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const companyName = formData.get('companyName');
  const countryName = formData.get('country'); 

  try {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return { success: false, error: "Password must be 8+ chars with 1 uppercase and 1 digit." };
    }

    const countryRes = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=currencies,cca3`);
    if (!countryRes.ok) return { success: false, error: "Could not verify country data." };
    
    const countryData = await countryRes.json();
    const countryCode = countryData[0].cca3;
    const baseCurrency = Object.keys(countryData[0].currencies)[0];

    const passwordHash = await bcrypt.hash(password, 12); 

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName, countryCode, baseCurrency }
      });

      await tx.user.create({
        data: { name, email, passwordHash, role: 'admin', companyId: company.id }
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "Failed to create account. Email may already exist." };
  }
}

/**
 * --- APPROVAL ENGINE: POLICY MATCHER (Internal Helper) ---
 */
async function createApprovalChain(expenseId, tx) {
  const expense = await tx.expense.findUnique({
    where: { id: expenseId },
    include: { submitter: true }
  });

  const policy = await tx.approvalPolicy.findFirst({
    where: {
      companyId: expense.companyId,
      isActive: true,
      minAmount: { lte: expense.convertedAmount },
      OR: [{ maxAmount: { gte: expense.convertedAmount } }, { maxAmount: null }]
    },
    include: { policyApprovers: { orderBy: { sequence: 'asc' } } }
  });

  if (!policy) {
    throw new Error(`No approval policy covers the amount: ${expense.convertedAmount}. Contact Admin.`);
  }

  await tx.expense.update({ where: { id: expenseId }, data: { policyId: policy.id } });

  let approvalSteps = [];
  let currentSeq = 1;

  if (policy.isManagerApprover && expense.submitter.managerId) {
    approvalSteps.push({ expenseId: expense.id, approverId: expense.submitter.managerId, sequence: currentSeq++, status: 'pending' });
  }

  policy.policyApprovers.forEach(pa => {
    approvalSteps.push({ expenseId: expense.id, approverId: pa.approverId, sequence: currentSeq++, status: 'pending' });
  });

  await tx.approvalStep.createMany({ data: approvalSteps });

  await tx.auditLog.create({
    data: {
      companyId: expense.companyId,
      expenseId: expense.id,
      actorId: expense.submitterId,
      action: 'submitted',
      details: { policyName: policy.name, stepsCreated: approvalSteps.length }
    }
  });
}

/**
 * --- SUBMIT EXPENSE WITH CONVERSION (FR-3 & FR-8) ---
 */
export async function submitExpense(formData) {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Not authenticated" };

    const amount = parseFloat(formData.get('amount'));
    const originalCurrency = formData.get('currency');
    const categoryId = formData.get('categoryId');
    const description = formData.get('description');
    const expenseDate = new Date(formData.get('date'));

    // Graceful Validations (No app crashes!)
    if (isNaN(amount) || amount <= 0) return { success: false, error: "Amount must be > 0." };
    if (!description || description.length < 10 || description.length > 500) {
      return { success: false, error: "Description must be between 10-500 characters." };
    }
    if (!categoryId) return { success: false, error: "Category is required." };
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    if (expenseDate > new Date() || expenseDate < ninetyDaysAgo) {
      return { success: false, error: "Date must be within the last 90 days and not in the future." };
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });

    return await prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({
        where: { id: dbUser.companyId },
        select: { baseCurrency: true }
      });

      const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${originalCurrency}`);
      if (!rateRes.ok) throw new Error("Currency API unreachable. Blocked for accuracy.");
      
      const rateData = await rateRes.json();
      const rate = rateData.rates[company.baseCurrency];
      const convertedAmount = amount * rate;

      const expense = await tx.expense.create({
        data: {
          originalAmount: amount,
          originalCurrency,
          convertedAmount, 
          exchangeRate: rate,
          conversionTimestamp: new Date(),
          description,
          expenseDate,
          status: 'pending', 
          companyId: dbUser.companyId,
          submitterId: dbUser.id,
          categoryId: categoryId,
        }
      });

      await createApprovalChain(expense.id, tx);
      revalidatePath('/employee');
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * --- MANAGER: PROCESS APPROVAL/REJECTION (FR-6 & FR-5) ---
 */
export async function processApproval(stepId, action, comment) {
  try {
    const session = await getServerSession();
    if (!session) return { success: false, error: "Not authenticated" };

    if (action === 'rejected' && (!comment || comment.length < 10)) {
      return { success: false, error: "Rejection requires a comment (min 10 chars)." };
    }

    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });

    return await prisma.$transaction(async (tx) => {
      const currentStep = await tx.approvalStep.findUnique({
        where: { id: stepId },
        include: { expense: { include: { approvalSteps: true, policy: { include: { conditionalRule: true } } } } }
      });

      if (!currentStep || currentStep.approverId !== dbUser.id) throw new Error("Unauthorized.");

      await tx.approvalStep.update({
        where: { id: stepId },
        data: { status: action, comment, actedAt: new Date() }
      });

      if (action === 'rejected') {
        await tx.expense.update({ where: { id: currentStep.expenseId }, data: { status: 'rejected' } });
        await tx.approvalStep.updateMany({
          where: { expenseId: currentStep.expenseId, sequence: { gt: currentStep.sequence } },
          data: { status: 'skipped' }
        });
      } 
      else if (action === 'approved') {
        const { expense } = currentStep;
        const totalSteps = expense.approvalSteps.length;
        const approvedStepsCount = expense.approvalSteps.filter(s => s.status === 'approved').length + 1;
        
        let shortCircuit = false;

        if (expense.policy?.conditionalRule) {
          const rule = expense.policy.conditionalRule;
          if ((rule.ruleType === 'percentage' || rule.ruleType === 'hybrid') && ((approvedStepsCount / totalSteps) * 100 >= rule.percentageThreshold)) shortCircuit = true;
          if ((rule.ruleType === 'specific_approver' || rule.ruleType === 'hybrid') && currentStep.approverId === rule.specificApproverId) shortCircuit = true;
        }

        const isLastStep = !expense.approvalSteps.some(s => s.sequence > currentStep.sequence);

        if (shortCircuit || isLastStep) {
          await tx.expense.update({ where: { id: currentStep.expenseId }, data: { status: 'approved' } });
          if (shortCircuit) {
            await tx.approvalStep.updateMany({
              where: { expenseId: currentStep.expenseId, status: 'pending' },
              data: { status: 'auto_approved', actedAt: new Date() }
            });
          }
        } else {
          await tx.expense.update({ where: { id: currentStep.expenseId }, data: { status: 'partially_approved' } });
        }
      }

      await tx.auditLog.create({
        data: { companyId: dbUser.companyId, expenseId: currentStep.expenseId, actorId: dbUser.id, action, details: { comment } }
      });

      revalidatePath('/manager');
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * --- ADMIN: OVERRIDE ACTION (FR-7) ---
 */
export async function adminOverride(expenseId, decision) {
  try {
    const session = await getServerSession();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
    if (dbUser?.role !== 'admin') return { success: false, error: "Unauthorized" };

    return await prisma.$transaction(async (tx) => {
      await tx.expense.update({ where: { id: expenseId }, data: { status: decision === 'approve' ? 'approved' : 'rejected' } });
      await tx.approvalStep.updateMany({
        where: { expenseId, status: 'pending' },
        data: { status: decision === 'approve' ? 'approved' : 'rejected', comment: `Admin Override: ${decision.toUpperCase()}`, actedAt: new Date() }
      });

      await tx.auditLog.create({
        data: { companyId: dbUser.companyId, expenseId, actorId: dbUser.id, action: 'admin_override', details: { decision } }
      });

      revalidatePath('/admin');
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * --- ADMIN: POLICY CONFIGURATION (FR-5) ---
 */
export async function createPolicy(policyData) {
  try {
    const session = await getServerSession();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
    if (dbUser?.role !== 'admin') return { success: false, error: "Unauthorized" };

    return await prisma.$transaction(async (tx) => {
      const policy = await tx.approvalPolicy.create({
        data: {
          name: policyData.name,
          minAmount: policyData.minAmount,
          maxAmount: policyData.maxAmount || null,
          isManagerApprover: policyData.isManagerApprover,
          companyId: dbUser.companyId
        }
      });

      if (policyData.approverIds?.length > 0) {
        await tx.policyApprover.createMany({
          data: policyData.approverIds.map((id, idx) => ({ policyId: policy.id, approverId: id, sequence: idx + 1 }))
        });
      }

      if (policyData.rule) {
        await tx.conditionalRule.create({
          data: { policyId: policy.id, ruleType: policyData.rule.type, percentageThreshold: policyData.rule.threshold, specificApproverId: policyData.rule.specificApproverId }
        });
      }

      revalidatePath('/admin/policies');
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: "Failed to save policy." };
  }
}

/**
 * --- ADMIN: USER & CATEGORY MGMT (FR-2 & FR-8) ---
 */
export async function createUser(formData) {
  try {
    const session = await getServerSession();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
    if (dbUser?.role !== 'admin') return { success: false, error: "Unauthorized" };

    const passwordHash = await bcrypt.hash('Welcome@123', 12);
    await prisma.user.create({
      data: {
        name: formData.get('name'), email: formData.get('email'), passwordHash,
        role: formData.get('role'), managerId: formData.get('managerId') || null, companyId: dbUser.companyId,
      }
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create user." };
  }
}

export async function deactivateUser(userId) {
  try {
    const session = await getServerSession();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
    if (dbUser?.role !== 'admin') return { success: false, error: "Unauthorized" };

    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to deactivate user." };
  }
}

export async function createCategory(name) {
  try {
    const session = await getServerSession();
    const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
    if (dbUser?.role !== 'admin') return { success: false, error: "Unauthorized" };

    const category = await prisma.expenseCategory.create({ data: { name, companyId: dbUser.companyId } });
    revalidatePath('/admin');
    return { success: true, category };
  } catch (error) {
    return { success: false, error: "Failed to create category." };
  }
}

/**
 * --- DATA FETCHING HELPERS ---
 */
export async function getPendingApprovals() {
  const session = await getServerSession();
  if (!session) return [];
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  return await prisma.approvalStep.findMany({
    where: { approverId: dbUser.id, status: 'pending' },
    include: { expense: { include: { submitter: true, category: true } } },
    orderBy: { createdAt: 'asc' }
  });
}

export async function getExpenseDetail(id) {
  return await prisma.expense.findUnique({
    where: { id },
    include: {
      category: true, submitter: { select: { name: true } },
      approvalSteps: { include: { approver: { select: { name: true, role: true } } }, orderBy: { sequence: 'asc' } },
      auditLogs: { include: { actor: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
    }
  });
}

export async function getAllExpenses() {
  const session = await getServerSession();
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
  if (dbUser?.role !== 'admin') return [];
  
  return await prisma.expense.findMany({
    where: { companyId: dbUser.companyId },
    include: { submitter: true, category: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getCategories() {
  const session = await getServerSession();
  if (!session) return [];
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  return await prisma.expenseCategory.findMany({ where: { companyId: dbUser.companyId, isActive: true } });
}

export async function getPolicies() {
  const session = await getServerSession();
  if (!session) return [];
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  return await prisma.approvalPolicy.findMany({
    where: { companyId: dbUser.companyId, isActive: true },
    include: { policyApprovers: true, conditionalRule: true }
  });
}

export async function getCompanyAuditLogs() {
  const session = await getServerSession();
  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email } });
  if (dbUser?.role !== 'admin') return [];

  return await prisma.auditLog.findMany({
    where: { companyId: dbUser.companyId },
    include: { actor: { select: { name: true } }, expense: { select: { description: true, convertedAmount: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getManagers() {
  const session = await getServerSession();
  if (!session) return [];
  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });

  return await prisma.user.findMany({
    where: { companyId: dbUser.companyId, role: 'manager', isActive: true },
    select: { id: true, name: true }
  });
}