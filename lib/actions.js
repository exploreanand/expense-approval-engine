'use server'

import prisma from './prisma';
import { getServerSession } from "next-auth";
import { revalidatePath } from 'next/cache';

export async function submitExpense(formData) {
  const session = await getServerSession();
  if (!session) throw new Error("Not authenticated");

  const amount = parseFloat(formData.get('amount'));
  const currency = formData.get('currency');
  const categoryId = formData.get('categoryId');
  const description = formData.get('description');
  const expenseDate = new Date(formData.get('date'));

  try {
    await prisma.expense.create({
      data: {
        originalAmount: amount,
        originalCurrency: currency,
        // For now, we'll set converted amount to original until you add the Exchange API
        convertedAmount: amount, 
        exchangeRate: 1.0,
        conversionTimestamp: new Date(),
        description,
        expenseDate,
        status: 'pending',
        companyId: session.user.companyId,
        submitterId: session.user.id,
        categoryId: categoryId,
      }
    });

    revalidatePath('/employee');
    return { success: true };
  } catch (error) {
    console.error("Submission Error:", error);
    return { success: false, error: "Failed to submit expense" };
  }
}