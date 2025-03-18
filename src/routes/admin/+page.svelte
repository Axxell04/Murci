<script lang="ts">
    import { enhance } from "$app/forms";
	import { fade, scale, slide } from "svelte/transition";
	import type { PageProps } from "./$types";
	import ProductCard from "$lib/components/ProductCard.svelte";
	import { goto, invalidate, invalidateAll } from "$app/navigation";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import AddProductModal from "$lib/components/modals/admin/AddProductModal.svelte";
	import DeleteProductModal from "$lib/components/modals/admin/DeleteProductModal.svelte";
	import EditProductModal from "$lib/components/modals/admin/EditProductModal.svelte";
	import AddProductToCatalogModal from "$lib/components/modals/admin/AddProductToCatalogModal.svelte";

    let { data }: PageProps = $props();


    // Pagination Data
    let productPagination: ProductPagination = $state(data.pagination);
    let products: ProductComplete[] = $derived(productPagination.products); 

    let gotoPage: number | undefined = $state();

    // Catalogs
    let catalogs = $state(data.catalogs)
    let catalogId =  $state(data.catalogId ?? '');

    // HTML Elements
    let selectCatalogElement: HTMLButtonElement | undefined = $state();

    let selectCatalogElementHeight: number = $state(9);

    // Visible Elements
    let addProductModalIsVisible = $state(false);
    let addProductToCatalogModalIsVisible = $state(false);
    let deleteProductModalIsVisible = $state(false);
    let editProductModalIsVisible = $state(false);
    let gotoPageListIsVisible = $state(false);
    let catalogListIsVisible = $state(false);

    let optAddProductIsVisible = $state(false);

    // Selected Product
    let productSelected: ProductComplete | undefined = $state()

    function selectThisProduct (product: ProductComplete) {
        productSelected = product;
    }

    function setProductPagination (newProductPagination: ProductPagination) {
        productPagination = newProductPagination;
    }

    // Toggle Visible Elements
    function toggleAddProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            addProductModalIsVisible = visible;
        } else {
            addProductModalIsVisible = !addProductModalIsVisible;
        }
    }
    function toggleDeleteProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            deleteProductModalIsVisible = visible;
        } else {
            deleteProductModalIsVisible = !deleteProductModalIsVisible;
        }
    }
    function toggleEditProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            editProductModalIsVisible = visible;
        } else {
            editProductModalIsVisible = !editProductModalIsVisible;
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
    function toggleOptAddProductIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            optAddProductIsVisible = visible;
        } else {
            optAddProductIsVisible = !optAddProductIsVisible;
        }
    }
    function toggleAddProductToCatalogModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            addProductToCatalogModalIsVisible = visible;
        } else {
            addProductToCatalogModalIsVisible = !addProductToCatalogModalIsVisible;
        }
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
    

    // Effects

    $effect(() => {
        productPagination;
        scrollTo({behavior: 'smooth', top: 170})
    })
    
    
    $effect(() => {
        if (typeof selectCatalogElement !== 'undefined' && catalogListIsVisible) {
            selectCatalogElementHeight = selectCatalogElement.clientHeight;
        }
    })

</script>

<div in:fade class="flex flex-col gap-2 px-5 py-5">
    <section class="flex flex-col gap-3 ">
        <div class="sticky -top-1 z-10 bg-stone-900/95 backdrop-blur-md place-content-around flex flex-wrap p-3 gap-2 place-items-center">
            <div class="flex flex-row gap-2 place-items-center">
                <button class="flex flex-row gap-1 border rounded-md p-1 hover:text-red-500 focus:text-red-500 cursor-pointer place-items-center"
                onclick={() => {
                    if (catalogId) {
                        toggleOptAddProductIsVisible();
                    } else {
                        toggleAddProductModalIsVisible(true);
                    }
                    }}
                onfocus={(e) => cancelFocus(e)}
                >
                    <Icon icon="material-symbols:add-rounded" class="text-3xl" />
                    <span style="font-family: Nunito;">
                        Añadir Producto
                    </span>
                </button>
                {#if optAddProductIsVisible}    
                <div transition:slide={{axis: "x"}} class="flex flex-row gap-1 border rounded-md h-fit">
                    <button class="flex flex-row gap-1 border rounded-md p-1 bg-red-400 text-stone-900 hover:bg-red-500 focus:bg-red-500 cursor-pointer place-items-center"
                    onclick={() => toggleAddProductModalIsVisible(true)}
                    onfocus={(e) => cancelFocus(e)}
                    >
                        <span style="font-family: Nunito;">
                            Nuevo
                        </span>
                    </button>
                    <button class="flex flex-row gap-1 border border-transparent rounded-md p-1 hover:text-red-500 focus:text-red-500 cursor-pointer place-items-center"
                    onclick={() => toggleAddProductToCatalogModalIsVisible(true)}
                    onfocus={(e) => cancelFocus(e)}
                    >
                        <span style="font-family: Nunito;">
                            Existente
                        </span>
                    </button>

                </div>
                {/if}
            </div>

            
            <div class="flex flex-row gap-3 place-items-center">
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
                    <button bind:this={selectCatalogElement} type="button" class="text-center text-2xl bg-transparent outline-none hover:text-red-500 focus:text-red-500" 
                    onclick={()=>toggleCatalogListIsVisible()}
                    onfocus={(e) => cancelFocus(e)}
                    >
                        {catalogId ? catalogs.find((cat) => cat.id === catalogId)?.name : 'Todo'}
                    </button>
                    {#if catalogListIsVisible}                        
                    <div transition:scale class="absolute flex flex-col text-2xl rounded-b-md border bg-stone-900/95 max-h-60 overflow-y-auto place-self-center"
                    style="top: {selectCatalogElementHeight}px;"
                    >
                        <ul>
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 px-2 py-1 w-full {catalogId ? '' : 'text-red-500'}" 
                                onclick={()=>{catalogId = ''; toggleCatalogListIsVisible(false)}}
                                onfocus={(e) => cancelFocus(e)}
                                >
                                    Todo
                                </button>
                            </li>
                            {#each catalogs as catalog}
                            <li>
                                <button class="hover:bg-stone-800 focus:bg-stone-800 px-2 py-1 w-full {catalogId === catalog.id ? 'text-red-500' : ''}" 
                                onclick={()=>{catalogId = catalog.id; toggleCatalogListIsVisible(false)}}
                                onfocus={(e) => cancelFocus(e)}
                                >
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
                                setProductPagination(result.data.pagination as ProductPagination)
                            }
                        }
                    }
                }}
                class="flex flex-col place-content-center"
                >
                    <input type="number" hidden name="current_page" value={productPagination.currentPage}>
                    <input type="number" hidden name="total_pages" value={productPagination.totalPages}>
                    {#if productPagination.currentPage > 1}
                    <button class="hover:text-red-500 focus:text-red-500" onfocus={(e) => cancelFocus(e)}>
                        <Icon icon="icon-park-outline:left-c" class="text-3xl" />
                    </button>
                    {:else}
                    <button class="opacity-50" disabled>
                        <Icon icon="icon-park-outline:left-c" class="text-3xl" />
                    </button>
                    {/if}
                </form>
                <!-- <input type="text" class="w-10 text-center text-3xl bg-transparent outline-none" value={productPagination.currentPage ?? 1} /> -->
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
                    <button type="button" class="w-10 text-center text-3xl h-9 bg-transparent outline-none hover:text-red-500 focus:text-red-500" 
                    onclick={()=>toggleGotoPageListIsVisible()}
                    onfocus={(e) => cancelFocus(e)}
                    >
                        {productPagination.currentPage}
                    </button>
                    {#if gotoPageListIsVisible}                        
                    <div transition:scale class="absolute top-9 flex flex-col text-3xl rounded-b-md border bg-stone-900/95 max-h-60 overflow-y-auto place-self-center">
                        <ul>
                            {#each createListPages(productPagination.totalPages) as page}
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
                    <button class="hover:text-red-500 focus:text-red-500" onfocus={(e) => cancelFocus(e)}>
                        <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                    </button>
                    {:else}    
                    <button class="opacity-50" disabled>
                        <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                    </button>
                    {/if}
                </form>
            </div>

        </div>

        <div class="flex flex-wrap grow justify-center p-2 gap-3">
            {#each products as product}
                <ProductCard {product} {productSelected} {selectThisProduct} {toggleDeleteProductModalIsVisible} {toggleEditProductModalIsVisible} />
            {/each}
        </div>
    </section>
    <AddProductModal {setProductPagination} {toggleAddProductModalIsVisible} {addProductModalIsVisible} />
    <DeleteProductModal {setProductPagination} {catalogId} {toggleDeleteProductModalIsVisible} {deleteProductModalIsVisible} {productSelected} />
    <EditProductModal {setProductPagination} {toggleEditProductModalIsVisible} {editProductModalIsVisible} {productSelected} />
    <AddProductToCatalogModal {products} {setProductPagination} {catalogId} {toggleAddProductToCatalogModalIsVisible} {addProductToCatalogModalIsVisible} />
</div>