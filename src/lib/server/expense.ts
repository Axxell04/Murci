import * as table from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { generateId } from './functions';
import { eq } from 'drizzle-orm';

export async function createExpense (value: number, reason?: string) {
    const expenseId = generateId();
    const expense: table.Expense = {
        id: expenseId,
        value,
        reason,
        createdAt: new Date()
    }

    await db.insert(table.expense).values(expense).execute()
}

export async function getExpenses (page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const expenses = await db.select().from(table.expense).limit(limit).offset(offset).orderBy(table.expense.createdAt).execute()
    
    const totalOrders = (await db.select().from(table.expense).execute()).length 
    const totalPages = Math.ceil(totalOrders / limit);

    return {
        expenses,
        totalPages,
        currentPage: page
    };
}

export async function updateExpense (id: string, value?: number, reason?: string) {
    if (typeof value !== 'undefined' && typeof reason !== 'undefined') {
        await db.update(table.expense).set({value, reason}).where(eq(table.expense.id, id)).execute();
    } else if (typeof value !== 'undefined') {
        await db.update(table.expense).set({value}).where(eq(table.expense.id, id)).execute();
    } else if (typeof reason !== 'undefined') {
        await db.update(table.expense).set({reason}).where(eq(table.expense.id, id)).execute();
    }
}

export async function deleteExpense (id: string) {
    await db.delete(table.expense).where(eq(table.expense.id, id));
}