import { getCatalogs } from "$lib/server/catalog";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const catalogs = await getCatalogs();

    return {
        catalogs: catalogs
    }
}

export const actions: Actions = {
    view_catalog: async (event) => {
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
    }
}