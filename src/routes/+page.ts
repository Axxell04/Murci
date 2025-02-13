import type { PageLoad } from "./$types";

export const load: PageLoad = async ({fetch}) => {
    const res = await fetch('/api/product');
    const data = await res.json()
    return {
        products: data
    };
};