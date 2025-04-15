import type { PurchaseDetail } from "$lib/interfaces/cart";
import { createOrder } from "$lib/server/order";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    const cart = event.locals.cart;

    return {
        cart: cart
    }
};

export const actions: Actions = {
    update_cart: async (event) => {
        const formData = await event.request.formData();
        const cart = formData.get('cart') as string;

        event.cookies.set('cart', cart, { path: '/' })
    },
    clear_cart: async (event) => {
        event.cookies.delete('cart', { path: '/' });
    },
    send_cart: async (event) => {
        const formData = await event.request.formData();
        const contact = formData.get('contact') as string;
        let cart: object;

        try {
            cart = JSON.parse(formData.get('cart') as string);
            if (!contact || !isPurchaseDetail(cart)) { return fail(400, { message: 'Error en los parámetros de la petición' }) }
            await createOrder(cart, contact);
            
        } catch {
            return fail(500, { message: 'A ocurrido un error en el servidor' })            
        }

    }
}

function isPurchaseDetail(content: unknown): content is PurchaseDetail {
    return (
        typeof content === 'object' &&
        Array.isArray(content) &&
        content.every(item => (
            typeof item === 'object' &&
            'product' in item && typeof item.product === 'object' &&
            'amount' in item && typeof item.amount === 'number'
        ))
    )
}