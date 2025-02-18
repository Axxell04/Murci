import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createProduct, getProducts } from '$lib/server/product';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/login');
    }

    const products = await getProducts();

    return {
        user: event.locals.user,
        products: products
    }
}

export const actions: Actions = {
    logout: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        await auth.invalidateSession(event.locals.session.id);
        auth.deleteSessionTokenCookie(event);

        redirect(302, '/login')
    },
    add_product: async (event) => {
        const formData = await event.request.formData();
        const name = formData.get('name');
        const price = formData.get('price');
        const imgs = formData.getAll('imgs') as unknown as FileList;

        if (!validateName(name)) {
            return fail(400, { message: 'Invalid name' });
        }

        if (!validatePrice(price)) {
            return fail(400, { message: 'Invalid price' });
        }
        
        try {
            await createProduct(name, price, imgs);

        } catch (error) {
            console.log(error);
            return fail(500, { message: 'Internal server error' });
        }

        const products = await getProducts();
        return {products: products};
    } 
}

function validatePrice (price: unknown): price is number {
    return !isNaN(parseFloat(price as string));
}


function validateName (name: unknown): name is string {
    return typeof name === 'string' && name.length > 0;
}