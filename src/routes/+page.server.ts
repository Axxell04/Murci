import { getProducts } from "$lib/server/product";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getCatalogs } from "$lib/server/catalog";

export const load: PageServerLoad = async (event) => {
    const catalogId = event.locals.catalogId;

    const cart = event.locals.cart;
    
    const pagination = await getProducts(undefined, undefined, catalogId ?? undefined);
    const catalogs = await getCatalogs();

    return {
        pagination: pagination,
        catalogId: catalogId,
        catalogs: catalogs,
        cart: cart
    }
};

export const actions: Actions = {
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
        const pagination = await getProducts(nextPage);

        return {
            pagination: pagination
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
        const pagination = await getProducts(nextPage);

        return {
            pagination: pagination
        }
    },
    goto_page: async (event) => {
        const formData = await event.request.formData();
        let gotoPage = 0;

        try {
            gotoPage = parseInt(formData.get('goto_page') as string);
            if (isNaN(gotoPage)) {
                return fail(400, { message: 'Invalid pagination params' })
            }
        } catch {
            return fail(400, { message: 'Invalid pagination params' })
        }

        const pagination = await getProducts(gotoPage);

        return {
            pagination: pagination
        }
    },
    set_catalog: async (event) => {
        const formData = await event.request.formData();
        const catalogId = formData.get('catalog_id') as string;

        if (catalogId) {
            event.cookies.set('catalog-id', catalogId, {
                path: '/'
            })
        } else {
            event.cookies.delete('catalog-id', {
                path: '/'
            })
        }
        const pagination = await getProducts(undefined, undefined, catalogId ?? undefined);

        return {
            pagination: pagination
        }
    },
    update_cart: async (event) => {
        const formData = await event.request.formData();
        const cart = formData.get('cart') as string;

        event.cookies.set('cart', cart, { path: '/' })
    }
}