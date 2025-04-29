import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getRevenues, getTotalRevenue } from "$lib/server/revenue";
import { getCosts, getTotalCost } from "$lib/server/cost";
import { getExpenses, getTotalExpense } from "$lib/server/expense";
import type { BalanceDetailPagination } from "$lib/interfaces/balance";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/login')
    }

    const totalRevenue = await getTotalRevenue();
    const totalCost = await getTotalCost();
    const totalExpense = await getTotalExpense();

    return {
        totalRevenue,
        totalCost,
        totalExpense
    }
};

export const actions: Actions = {
    set_view_state: async (event) => {
        const formData = await event.request.formData();
        const viewState = formData.get('view_state') as string;

        if (!viewState) { return fail(400, { message: 'Error en los parámetros de la petición' }) }

        event.cookies.set('balance_view_state', viewState, {
            path: '/'
        })

        let balanceDetailPagination: BalanceDetailPagination | undefined;
        if (viewState === 'revenue') {
            const res = await getRevenues();
            balanceDetailPagination = {
                balanceDetails: res.revenues,
                totalPages: res.totalPages,
                currentPage: res.currentPage
            }
        } else if (viewState === 'cost') {
            const res = await getCosts();
            balanceDetailPagination = {
                balanceDetails: res.costs,
                totalPages: res.totalPages,
                currentPage: res.currentPage
            }
        } else if (viewState === 'expense') {
            const res = await getExpenses();
            balanceDetailPagination = {
                balanceDetails: res.expenses,
                totalPages: res.totalPages,
                currentPage: res.currentPage
            }
        }
        
        return {
            balanceDetailPagination
        }
    },    
};