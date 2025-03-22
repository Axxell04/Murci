import type { LayoutServerLoad } from "./$types";
// import type { Config } from '@sveltejs/adapter-vercel';

export const load: LayoutServerLoad = async ({locals}) => {
    return {
        user: locals.user
    };
}

// export const config: Config = {
//     runtime: 'nodejs22.x'
// }

