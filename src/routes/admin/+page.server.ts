import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createProduct, deleteProduct, getImgs, getProducts, updateProduct } from '$lib/server/product';

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
    },
    delete_product: async (event) => {
        const formData = await event.request.formData();
        const productId = formData.get('product_id');

        try {
            await deleteProduct(productId as string);
        } catch (error) {
            console.log(error);
            return fail(500, { message: 'Internal server error' })
        }
        
        const products = await getProducts();
        return {
            products: products
        }
    },
    edit_product: async (event) => {
        const formData = await event.request.formData();
        const product_id = formData.get('product_id')
        const name = formData.get('name');
        const price = formData.get('price');
        const imgs = formData.getAll('imgs') as unknown as FileList;
        const listDelete = formData.get('list_delete');
        let finalListDelete: string[] | undefined = [];

        if (!validateProductId(product_id)) {
            return fail(400, { message: 'Invalid product id'})
        }

        if (!validateName(name)) {
            return fail(400, { message: 'Invalid name'})
        }

        if (!validatePrice(price)) {
            return fail(400, { message: 'Invalid price'})
        }

        finalListDelete = validateListDelete(listDelete);
        if (!finalListDelete) {
            return fail(400, { message: 'Invalid list delete' })
        } 
        
        if ((await getImgs(product_id)).length <= finalListDelete.length && (imgs.length === 1 && (!imgs[0].name && !imgs[0].size))) {
            return fail(400, { message: 'Se necesita al menos una imagen del producto' })
        }

        try {
            await updateProduct(product_id, name, price, imgs, finalListDelete)
        } catch (error) {
            console.log(error);
            return fail(500, { message: 'Internal server error' })
        }


        const products = await getProducts();
        return {
            products: products
        }
    }
}

function validatePrice (price: unknown): price is number {
    return !isNaN(parseFloat(price as string));
}


function validateName (name: unknown): name is string {
    return typeof name === 'string' && name.length > 0;
}

function validateProductId (product_id: unknown): product_id is string {
    return typeof product_id === 'string';
} 

function validateListDelete (list: unknown) {
    if (typeof list === 'undefined') { return undefined };
    return JSON.parse(list as string) as string[]
}