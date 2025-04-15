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
    set_view_state: async (event) => {
        const formData = await event.request.formData();
        const viewState = formData.get('view_state') as string;

        if (!viewState) { return fail(400, { message: 'Error en los parámetros de la petición' }) }

        event.cookies.set('order_view_state', viewState, {
            path: '/'
        })

        const completed = viewState ? (viewState === 'completed' ? true : false) : false;  
        const orderPagination = await getOrders(undefined, undefined, completed);

        return {
            orderPagination
        }
    },
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

    },
    prev_page: async (event) => {
        const formData = await event.request.formData();
        let totalPages = 0;
        let currentPage = 0;
        
        try {
            totalPages = parseInt(formData.get('total_pages') as string);
            currentPage = parseInt(formData.get('current_page') as string);
            if (isNaN(totalPages) || isNaN(currentPage)) {
                return fail(400, { message: 'Invalid pagination params' })
            }
        } catch {
            return fail(400, { message: 'Invalid pagination params' })
        }


        
        if (currentPage <= 1) {
            return fail(404, { message: 'Page not found' })
        }
        const nextPage = currentPage - 1;
        const orderPagination = await getOrders(nextPage);

        return {
            orderPagination
        }
    },
    next_page: async (event) => {
        const formData = await event.request.formData();
        let totalPages = 0;
        let currentPage = 0;
        
        try {
            totalPages = parseInt(formData.get('total_pages') as string);
            currentPage = parseInt(formData.get('current_page') as string);
            if (isNaN(totalPages) || isNaN(currentPage)) {
                return fail(400, { message: 'Invalid pagination params' })
            }
        } catch {
            return fail(400, { message: 'Invalid pagination params' })
        }


        
        if (currentPage >= totalPages) {
            return fail(404, { message: 'Page not found' })
        }
        const nextPage = currentPage + 1;
        const orderPagination = await getOrders(nextPage);

        return {
            orderPagination
        }
    },
    goto_page: async (event) => {
        const formData = await event.request.formData();
        let gotoPage = 0;
        const completed = event.locals.orderViewState ? (event.locals.orderViewState === 'completed' ? true : false) : false;

        try {
            gotoPage = parseInt(formData.get('goto_page') as string);
            if (isNaN(gotoPage)) {
                return fail(400, { message: 'Invalid pagination params' })
            }
        } catch {
            return fail(400, { message: 'Invalid pagination params' })
        }

        const orderPagination = await getOrders(gotoPage, undefined, completed);

        return {
            orderPagination
        }
    },
};