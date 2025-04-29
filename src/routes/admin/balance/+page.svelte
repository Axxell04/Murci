<script lang="ts">
	import { enhance } from "$app/forms";
	import { fade, scale } from "svelte/transition";
	import type { PageProps } from "./$types";
	import type { BalanceDetail, BalanceDetailPagination } from "$lib/interfaces/balance";
	import Icon from "@iconify/svelte";

    let { data }: PageProps = $props()
    let totalRevenue = $state(data.totalRevenue);
    let totalCost = $state(data.totalCost);
    let totalExpense = $state(data.totalExpense);

    type ViewState = 'resume' | 'revenue' | 'cost' | 'expense';

    let balanceDetailPagination: BalanceDetailPagination | undefined = $state();
    let balanceDetails: BalanceDetail[] | undefined = $derived(balanceDetailPagination?.balanceDetails)

    let gotoPage: number | undefined = $state();

    // View State
    let viewState: ViewState = $state('resume')

    // HTML Elements
    let selectStateElement: HTMLButtonElement | undefined = $state();

    let selectStateElementHeight: number = $state(9);

    // Visible Elements
    let gotoPageListIsVisible = $state(false);
    let stateListIsVisible = $state(false);

    // Toggle Visible Elements
    function toggleGotoPageListIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            gotoPageListIsVisible = visible;
        } else {
            gotoPageListIsVisible = !gotoPageListIsVisible;
        }
    }

    function toggleStateListIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            stateListIsVisible = visible;
        } else {
            stateListIsVisible = !stateListIsVisible;
        }
    }

    // Setter Functions
    function setBalanceDetailPagination (newBalanceDetailPagination: BalanceDetailPagination | undefined) {
        balanceDetailPagination = newBalanceDetailPagination;
    }

    function refreshBalanceDetails () {
        if (typeof balanceDetailPagination === 'undefined') { return }
        const newBalanceDetails = balanceDetailPagination.balanceDetails;
        balanceDetailPagination.balanceDetails = [];
        setTimeout(() => {
            if (typeof balanceDetailPagination === 'undefined') { return }
            balanceDetailPagination.balanceDetails = newBalanceDetails;
        }, 200)
    }

    function createListPages (totalPages: number) {
        let list = []
        for (let index = 1; index <= totalPages; index++) {
            list.push(index);
        }

        return list;
    }

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 200)
        }
    }

    $effect(() => {
        if (typeof selectStateElement !== 'undefined' && stateListIsVisible) {
            selectStateElementHeight = selectStateElement.clientHeight;
        }
    })

</script>


<div in:fade class="flex flex-col gap-2 max-w-full max-h-full">
    <section class="px-10 w-full sticky -top-1 z-10 bg-stone-900/95 backdrop-blur-lg">
        <div class="flex flex-wrap gap-3 place-items-center place-content-between text-center text-red-400 font-normal p-4 border border-transparent border-b-red-400">
            <div class="flex flex-row gap-2 place-items-center">
                <form action="?/set_view_state" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.balanceDetailPagination) {
                                setBalanceDetailPagination(result.data.balanceDetailPagination as BalanceDetailPagination);
                                refreshBalanceDetails();
                            } else {
                                setBalanceDetailPagination(undefined);
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center relative"
                >
                    <input type="text" hidden name="view_state" value={viewState} />
                    <button bind:this={selectStateElement} type="button" class="text-center text-2xl bg-transparent outline-none hover:text-red-500 focus:text-red-500" 
                    onclick={()=>toggleStateListIsVisible()}
                    onfocus={(e) => cancelFocus(e)}
                    >
                        {#if viewState === 'resume'}
                        Resumen
                        {:else if viewState === 'revenue'}
                        Ingresos
                        {:else if viewState === 'cost'}
                        Costos
                        {:else if viewState === 'expense'}
                        Gastos
                        {/if}
                    </button>
                    {#if stateListIsVisible}                        
                    <div transition:scale class="absolute flex flex-col text-2xl rounded-b-md border bg-stone-900/95 max-h-60 overflow-y-auto place-self-center z-10"
                    style="top: {selectStateElementHeight}px;"
                    >
                        <ul>
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 px-2 py-1 w-full {viewState === 'resume' ? '' : 'text-red-500'}" onclick={()=>{viewState = 'resume'; toggleStateListIsVisible(false)}}>
                                    Resumen
                                </button>
                            </li>
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 px-2 py-1 w-full {viewState === 'revenue' ? '' : 'text-red-500'}" onclick={()=>{viewState = 'revenue'; toggleStateListIsVisible(false)}}>
                                    Ingresos
                                </button>
                            </li>
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 px-2 py-1 w-full {viewState === 'cost' ? '' : 'text-red-500'}" onclick={()=>{viewState = 'cost'; toggleStateListIsVisible(false)}}>
                                    Costos
                                </button>
                            </li>
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 px-2 py-1 w-full {viewState === 'expense' ? '' : 'text-red-500'}" onclick={()=>{viewState = 'expense'; toggleStateListIsVisible(false)}}>
                                    Gastos
                                </button>
                            </li>
                        </ul>
                    </div>
                    {/if}
                </form>
                {#if typeof balanceDetailPagination !== 'undefined' && viewState !== 'resume'}
                <form action="?/prev_page" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.balanceDetailPagination) {
                                setBalanceDetailPagination(result.data.balanceDetailPagination as BalanceDetailPagination);
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center"
                >
                    <input type="number" hidden name="current_page" value={balanceDetailPagination.currentPage}>
                    <input type="number" hidden name="total_pages" value={balanceDetailPagination.totalPages}>
                    <input type="hidden" name="view_state" value={viewState}>
                    {#if balanceDetailPagination.currentPage > 1}
                    <button class="hover:text-red-500 focus:text-red-500" onfocus={(e) => cancelFocus(e)}>
                        <Icon icon="icon-park-outline:left-c" class="text-3xl" />
                    </button>
                    {:else}
                    <button class="opacity-50" disabled>
                        <Icon icon="icon-park-outline:left-c" class="text-3xl" />
                    </button>
                    {/if}
                </form>
                <form action="?/goto_page" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.balanceDetailPagination) {
                                setBalanceDetailPagination(result.data.balanceDetailPagination as BalanceDetailPagination);
                                gotoPage = undefined;
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center relative"
                >
                    <input type="number" hidden name="goto_page" value={gotoPage} >
                    <input type="hidden" name="view_state" value={viewState}>
                    <button type="button" class="w-10 text-center text-3xl bg-transparent h-9 outline-none hover:text-red-500 focus:text-red-500" 
                    onclick={()=>toggleGotoPageListIsVisible()}
                    onfocus={(e) => cancelFocus(e)}
                    >
                        {balanceDetailPagination.currentPage}
                    </button>
                    {#if gotoPageListIsVisible}                        
                    <div transition:scale class="absolute top-9 flex flex-col text-3xl rounded-b-md border bg-stone-900/95 max-h-65 overflow-y-auto place-self-center">
                        <ul>
                            {#each createListPages(balanceDetailPagination.totalPages) as page}
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 focus:text-red-500 px-2 py-1 w-full" 
                                onclick={()=>{gotoPage = page; toggleGotoPageListIsVisible(false)}}
                                onfocus={(e) => cancelFocus(e)}
                                >
                                    {page}
                                </button>
                            </li>
                            {/each}
                        </ul>
                    </div>
                    {/if}
                </form>
                <form action="?/next_page" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.balanceDetailPagination) {
                                setBalanceDetailPagination(result.data.balanceDetailPagination as BalanceDetailPagination);
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center"
                >
                    <input type="number" hidden name="current_page" value={balanceDetailPagination.currentPage}>
                    <input type="number" hidden name="total_pages" value={balanceDetailPagination.totalPages}>
                    <input type="hidden" name="view_state" value={viewState}>
                    {#if balanceDetailPagination.currentPage < balanceDetailPagination.totalPages}
                    <button class="hover:text-red-500 focus-within:text-red-500" onfocus={(e) => cancelFocus(e)}>
                        <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                    </button>
                    {:else}    
                    <button class="opacity-50" disabled>
                        <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                    </button>
                    {/if}
                </form>
                {/if}
            </div>
		</div>
	</section>
    <section class="flex flex-wrap justify-center p-2 gap-3">
        <!-- {#key Date.now()} -->
        {#if typeof balanceDetails !== 'undefined'}
        {#each balanceDetails as balanceDetail (balanceDetail.id)}
            <div transition:scale={{delay: 100 * (balanceDetails.indexOf(balanceDetail) + 1), duration: 200}}>
                <!-- <OrderCard {order} {selectThisOrder} {orderSelected} {setOrderPagination} {updateOrderPaginationContent} /> -->
                <div class="flex flex-col gap-1 p-1">
                    <span>
                        {balanceDetail.reason ?? ''}
                    </span>
                    <span>
                        $ {balanceDetail.value.toFixed(2)}
                    </span>
                </div>
            </div>
        {/each}
        {/if}
        <!-- {/key} -->
        {#if viewState === 'resume'}
        <div class="flex flex-col gap-4 p-2 rounded-md bg-stone-800 self-start place-items-center card">
            <span>
                Ingresos
            </span>
            <span>
                $ {totalRevenue.toFixed(2)}
            </span>
        </div>
        <div class="flex flex-col gap-4 p-2 rounded-md bg-stone-800 self-start place-items-center card">
            <span>
                Costos
            </span>
            <span>
                $ {totalCost.toFixed(2)}
            </span>
        </div>
        <div class="flex flex-col gap-4 p-2 rounded-md bg-stone-800 self-start place-items-center card">
            <span>
                Gastos
            </span>
            <span>
                $ {totalExpense.toFixed(2)}
            </span>
        </div>
        
        {/if}
    </section>
</div>

<style>
    .card:hover {
        box-shadow: oklch(70.4% 0.191 22.216)  0px 0px 5px;
    }
</style>