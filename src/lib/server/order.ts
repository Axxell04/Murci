import * as table from '$lib/server/db/schema'
import { generateId } from "$lib/server/functions";
import { db } from "$lib/server/db"
import { eq } from 'drizzle-orm';

export async function createOrder (content: object, contact: string) {
    const orderId = generateId();
    const order: table.Order = {
        id: orderId,
        content,
        contact,
        createdAt: new Date(),
    }

    await db.insert(table.order).values(order).execute();
}

export async function getOrders (page: number = 1, limit: number = 10, completed?: boolean) {
    const offset = (page - 1) * limit;
    const orders = typeof completed === 'undefined' 
        ? await db.select().from(table.order).limit(limit).offset(offset).orderBy(table.order.createdAt).execute()
        : await db.select().from(table.order).where(eq(table.order.completed, completed)).limit(limit).offset(offset).orderBy(table.order.createdAt).execute()
    
    const totalOrders = typeof completed === 'undefined'
        ? (await db.select().from(table.order).execute()).length 
        : (await db.select().from(table.order).where(eq(table.order.completed, completed)).execute()).length
    const totalPages = Math.ceil(totalOrders / limit);

    return {
        orders: orders,
        totalPages,
        currentPage: page
    };
}

export async function updateOrder (id: string, content?: object, completed?: boolean, revenueId?: string | null, totalValue?: number | undefined) {
    if (typeof completed !== 'undefined' && typeof revenueId === 'string') {
        await db.update(table.order).set({completed, revenueId}).where(eq(table.order.id, id)).execute();
    } else if (typeof completed !== 'undefined' && revenueId === null) {
        const [order] = await db.select().from(table.order).where(eq(table.order.id, id));
        await db.update(table.order).set({completed, revenueId}).where(eq(table.order.id, id)).execute();
        if (order.revenueId) {
            await db.delete(table.revenue).where(eq(table.revenue.id, order.revenueId));
        }
    } else if (typeof content !== 'undefined' && typeof completed !== 'undefined') {
        await db.update(table.order).set({content, completed}).where(eq(table.order.id, id)).execute();
    } else if (typeof content !== 'undefined' && typeof totalValue !== 'undefined') {
        const [order] = await db.select().from(table.order).where(eq(table.order.id, id)).execute();
        if (order.revenueId) {
            await db.update(table.revenue).set({value: totalValue}).where(eq(table.revenue.id, order.revenueId)).execute();
        }
        await db.update(table.order).set({content}).where(eq(table.order.id, id)).execute();
    } else if (typeof completed !== 'undefined') {
        await db.update(table.order).set({completed}).where(eq(table.order.id, id)).execute();
    }
}

export async function deleteOrder (id: string) {
    const [order] = await db.select().from(table.order).where(eq(table.order.id, id)).execute();
    if (order.revenueId) {
        await db.delete(table.revenue).where(eq(table.order.revenueId, order.revenueId));
    }
    await db.delete(table.order).where(eq(table.order.id, id));
}