import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { deleteOrder, getOrders, updateOrder } from "$lib/server/order";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/login')
    }

    // const pendingOrders = await getOrders(undefined, undefined, false);
    // const completedOrders = await getOrders(undefined, undefined, true);
    const orderPagination = await getOrders(undefined, undefined, false);

    return {
        orderPagination
    }
};

export const actions: Actions = {
    delete_order: async (event) => {
        const formData = await event.request.formData();
        const orderId = formData.get('order_id') as string;

        if (!orderId) { return fail(400, { message: 'Error en los parámetros de la petición' }) }

        try {
            await deleteOrder(orderId);
        } catch (error) {
            console.log(error);
            return fail(500, { message: 'A ocurrido un error en el servidor' })
        }
    },
    edit_order: async (event) => {
        const formData = await event.request.formData();
        const orderId = formData.get('order_id') as string;
        let content: object;
        let completed: boolean;
        try {
            content = JSON.parse(formData.get('content') as string);
            completed = JSON.parse(formData.get('completed') as string);
            if (!content || !completed || !orderId) { return fail(400, { message: 'Error en los parámetros de la petición' }) }
        } catch {
            return fail(400, { message: 'Error en los parámetros de la petición' })
        }

        await updateOrder(orderId, content, completed);

        const pendingOrders = await getOrders(undefined, undefined, false);
        const completedOrders = await getOrders(undefined, undefined, true);

        return {
            pendingOrders,
            completedOrders
        }

    }
};