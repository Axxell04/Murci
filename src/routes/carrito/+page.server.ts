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
    }
}