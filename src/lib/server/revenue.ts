import * as table from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { generateId } from './functions';
import { eq } from 'drizzle-orm';

export async function createRevenue (value: number, reason?: string) {
    const revenueId = generateId();
    const revenue: table.Revenue = {
        id: revenueId,
        value,
        reason,
        createdAt: new Date()
    }

    await db.insert(table.revenue).values(revenue).execute()
}

export async function getRevenues (page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const revenues = await db.select().from(table.revenue).limit(limit).offset(offset).orderBy(table.revenue.createdAt).execute()
    
    const totalOrders = (await db.select().from(table.revenue).execute()).length 
    const totalPages = Math.ceil(totalOrders / limit);

    return {
        revenues,
        totalPages,
        currentPage: page
    };
}

export async function updateRevenue (id: string, value?: number, reason?: string) {
    if (typeof value !== 'undefined' && typeof reason !== 'undefined') {
        await db.update(table.revenue).set({value, reason}).where(eq(table.revenue.id, id)).execute();
    } else if (typeof value !== 'undefined') {
        await db.update(table.revenue).set({value}).where(eq(table.revenue.id, id)).execute();
    } else if (typeof reason !== 'undefined') {
        await db.update(table.revenue).set({reason}).where(eq(table.revenue.id, id)).execute();
    }
}

export async function deleteRevenue (id: string) {
    await db.delete(table.revenue).where(eq(table.revenue.id, id));
}