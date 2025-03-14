<script lang="ts">

	import ProductCard from "$lib/components/ProductCard.svelte";
	import { onMount } from "svelte";
	import { fade, scale, slide } from "svelte/transition";
	import type { PageProps } from "./$types";
	import ContainerModal from "$lib/components/modals/ContainerModal.svelte";
	import ProductModal from "$lib/components/modals/ProductModal.svelte";
	import type { Product, ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import ImgsProductModal from "$lib/components/modals/ImgsProductModal.svelte";
	import { enhance } from "$app/forms";

    let { data }: PageProps = $props();

    // Pagination Data
    let productPagination: ProductPagination = $state(data.pagination);
    let products: ProductComplete[] = $derived(productPagination.products); 

    let gotoPage: number | undefined = $state();

    // Catalogs 
    let catalogs = $state(data.catalogs);
    let catalogId = $state(data.catalogId ?? '');

    // HTML Elements
    let selectCatalogElement: HTMLButtonElement | undefined = $state();

    let selectCatalogElementHeight: number = $state(9);

    // Selected Elements
    let productSelected: ProductComplete | undefined = $state() 

    function selectThisProduct (product: ProductComplete) {
        productSelected = product;

        toggleProductModalIsVisible(true);
    }

    // Visible Elements
    let productModalIsVisible = $state(false);
    let gotoPageListIsVisible = $state(false);
    let catalogListIsVisible = $state(false);


    // Toggle Visible Elements
    function toggleProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            productModalIsVisible = visible;
        } else {
            productModalIsVisible = !productModalIsVisible;
        }
    }
    function toggleGotoPageListIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            gotoPageListIsVisible = visible;
        } else {
            gotoPageListIsVisible = !gotoPageListIsVisible;
        }
    }
    function toggleCatalogListIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            catalogListIsVisible = visible;
        } else {
            catalogListIsVisible = !catalogListIsVisible;
        }
    }


    function updatePagination (e: Event) {
        const inputE = e as InputEvent;
        const target = e.target as HTMLInputElement;
        // console.log(isNaN(parseInt(inputE.data ?? "")));
        // console.log(inputE)
        if (isNaN(parseInt(inputE.data ?? "")) && inputE.inputType !== "deleteContentBackward") {
            e.preventDefault();
            target.value = target.value.slice(0, -1);

        }
        
    }

    function setProductPagination (newProductPagination: ProductPagination) {
        productPagination = newProductPagination;
    }

    function createListPages (totalPages: number) {
        let list = []
        for (let index = 1; index <= totalPages; index++) {
            list.push(index);
        }

        return list;
    }

    // Effects

    $effect(() => {
        productPagination;
        scrollTo({behavior: 'smooth', top: 170})
    });

    $effect(() => {
        if (typeof selectCatalogElement !== 'undefined' && catalogListIsVisible) {
            selectCatalogElementHeight = selectCatalogElement.clientHeight;
        }
    })

</script>

<div in:fade class="flex flex-col gap-2 max-w-full max-h-full">
    <section class="px-10 w-full sticky -top-1 z-10 bg-stone-900/95 backdrop-blur-lg">
        <div class="flex flex-wrap gap-3 place-items-center place-content-between text-center text-red-400 font-normal p-4 border border-transparent border-b-red-400">
            <div class="flex flex-row gap-2 place-items-center">
                <form action="?/set_catalog" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.pagination) {
                                setProductPagination(result.data.pagination as ProductPagination);
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center relative"
                >
                    <input type="text" hidden name="catalog_id" value={catalogId} >
                    <!-- <input type="text" class="w-10 text-center text-3xl bg-transparent outline-none" value={productPagination.currentPage} oninput={(e)=>updatePagination(e)} /> -->
                    <button bind:this={selectCatalogElement} type="button" class="text-center text-2xl bg-transparent outline-none hover:text-red-500" onclick={()=>toggleCatalogListIsVisible()}>
                        {catalogId ? catalogs.find((cat) => cat.id === catalogId)?.name : 'Todo'}
                    </button>
                    {#if catalogListIsVisible}                        
                    <div transition:scale class="absolute flex flex-col text-2xl rounded-b-md border bg-stone-900/95 max-h-60 overflow-y-auto place-self-center z-10"
                    style="top: {selectCatalogElementHeight}px;"
                    >
                        <ul>
                            <li>
                                <button class="hover:bg-stone-800 px-2 py-1 w-full {catalogId ? '' : 'text-red-500'}" onclick={()=>{catalogId = ''; toggleCatalogListIsVisible(false)}}>
                                    Todo
                                </button>
                            </li>
                            {#each catalogs as catalog}
                            <li>
                                <button class="hover:bg-stone-800 px-2 py-1 w-full {catalogId === catalog.id ? 'text-red-500' : ''}" onclick={()=>{catalogId = catalog.id; toggleCatalogListIsVisible(false)}}>
                                    {catalog.name}
                                </button>
                            </li>
                            {/each}
                        </ul>
                    </div>
                    {/if}
                </form>
                <form action="?/prev_page" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.pagination) {
                                setProductPagination(result.data.pagination as ProductPagination);
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center"
                >
                    <input type="number" hidden name="current_page" value={productPagination.currentPage}>
                    <input type="number" hidden name="total_pages" value={productPagination.totalPages}>
                    {#if productPagination.currentPage > 1}
                    <button class="hover:text-red-500">
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
                            if (result.data?.pagination) {
                                setProductPagination(result.data.pagination as ProductPagination);
                                gotoPage = undefined;
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center relative"
                >
                    <input type="number" hidden name="goto_page" value={gotoPage} >
                    <!-- <input type="text" class="w-10 text-center text-3xl bg-transparent outline-none" value={productPagination.currentPage} oninput={(e)=>updatePagination(e)} /> -->
                    <button type="button" class="w-10 text-center text-3xl bg-transparent h-9 outline-none hover:text-red-500" onclick={()=>toggleGotoPageListIsVisible()}>
                        {productPagination.currentPage}
                    </button>
                    {#if gotoPageListIsVisible}                        
                    <div transition:scale class="absolute top-9 flex flex-col text-3xl rounded-b-md border bg-stone-900/95 max-h-65 overflow-y-auto place-self-center">
                        <ul>
                            {#each createListPages(productPagination.totalPages) as page}
                            <li>
                                <button class="hover:bg-stone-800 px-2 py-1 w-full" onclick={()=>{gotoPage = page; toggleGotoPageListIsVisible(false)}}>
                                    {page}
                                </button>
                            </li>
                            {/each}
                        </ul>
                    </div>
                    {/if}
                </form>
                <!-- <span class="block text-3xl">
                    1
                </span> -->
                <form action="?/next_page" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            if (result.data?.pagination) {
                                setProductPagination(result.data.pagination as ProductPagination);
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center"
                >
                    <input type="number" hidden name="current_page" value={productPagination.currentPage}>
                    <input type="number" hidden name="total_pages" value={productPagination.totalPages}>
                    {#if productPagination.currentPage < productPagination.totalPages}
                    <button class="hover:text-red-500">
                        <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                    </button>
                    {:else}    
                    <button class="opacity-50" disabled>
                        <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                    </button>
                    {/if}
                </form>
            </div>
            <div class="flex flex-row">
                <a href="/carrito" class="flex flex-row gap-1 justify-end self-end place-items-center hover:text-red-500">
                    <div class="relative flex flex-col place-items-center">
                        <Icon icon="bi:cart-fill" class="text-4xl" />
                        <span class="block absolute -top-2 -right-2 rounded-full font-bold text-lg bg-stone-900 text-red-400 border border-red-400 px-2 ">
                            3
                        </span>
                    </div>
                </a>
            </div>
		</div>
	</section>
    <section class="flex flex-wrap justify-center p-2 gap-3">
        {#each products as product}
            <ProductCard {product} {toggleProductModalIsVisible} {productSelected} {selectThisProduct} />
        {/each}
    </section>
</div>

<!-- <ProductModal {productModalIsVisible} {toggleProductModalIsVisible} {productSelected} /> -->
<ImgsProductModal {productSelected} imgsProductModalIsVisible={productModalIsVisible} toggleImgsProductModalIsVisible={toggleProductModalIsVisible} />
