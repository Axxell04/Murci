import { createProduct } from "$lib/server/product";
import { fail, redirect, type Actions } from "@sveltejs/kit";


export const actions: Actions = {
   create: async (event) => {
        const formData = await event.request.formData();
        const name = formData.get('name');
        const price = formData.get('price');

        if (!validateName(name)) {
            return { status: 400, message: 'Invalid name' };
        }

        if (!validatePrice(price)) {
            return { status: 400, message: 'Invalid price' };
        }
        
        try {
            await createProduct(name, price, new FileList());

        } catch {
            return fail(500, { message: 'Internal server error' });
        }

        return redirect(302, event.route.id as string);
   } 
}

function validatePrice (price: unknown): price is number {
    return !isNaN(parseFloat(price as string));
}

function validateName (name: unknown): name is string {
    return typeof name === 'string' && name.length > 0;
}