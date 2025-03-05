<script lang="ts">
    import { enhance } from "$app/forms";
	import { fade, scale } from "svelte/transition";
	import type { PageProps } from "./$types";
	import ProductCard from "$lib/components/ProductCard.svelte";
	import { goto, invalidate, invalidateAll } from "$app/navigation";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import AddProductModal from "$lib/components/modals/admin/AddProductModal.svelte";
	import DeleteProductModal from "$lib/components/modals/admin/DeleteProductModal.svelte";
	import EditProductModal from "$lib/components/modals/admin/EditProductModal.svelte";

    let { data, form }: PageProps = $props();

    // console.log(data.pagination);

    let formAct = $derived(form);
    let messages = $derived(form?.message);

    // $inspect(formAct);
    // $inspect(messages);

    // Pagination Data
    let productPagination: ProductPagination = $state(data.pagination);
    let products: ProductComplete[] = $derived(productPagination.products); 

    let gotoPage: number | undefined = $state();

    // Visible Elements
    let addProductModalIsVisible = $state(false);
    let deleteProductModalIsVisible = $state(false);
    let editProductModalIsVisible = $state(false);
    let gotoPageListIsVisible = $state(false);

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
    })
    

</script>

<div in:fade class="flex flex-col gap-2 px-5 py-5">
    <section class="flex flex-col gap-3 ">
        <div class="sticky top-0 z-10 bg-stone-900/95 backdrop-blur-md place-content-around flex flex-row p-3 gap-2 place-items-center">
            <button class="flex flex-row gap-1 border rounded-md p-1 hover:text-red-500 cursor-pointer place-items-center"
            onclick={() => toggleAddProductModalIsVisible(true)}
            >
                <Icon icon="material-symbols:add-rounded" class="text-3xl" />
                <span style="font-family: Nunito;">
                    Añadir Producto
                </span>
            </button>
            
            <div class="flex flex-row gap-2 place-items-center">
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
                    <button class="hover:text-red-500">
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
                    <button type="button" class="w-10 text-center text-3xl bg-transparent outline-none" onclick={()=>toggleGotoPageListIsVisible()}>
                        {productPagination.currentPage}
                    </button>
                    {#if gotoPageListIsVisible}                        
                    <div transition:scale class="absolute -bottom-20 flex flex-col text-3xl rounded-b-md border bg-stone-900/95 h-20 overflow-y-auto place-self-center">
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

        </div>

        <div class="flex flex-wrap grow justify-center p-2 gap-3">
            {#each products as product}
                <ProductCard {product} {productSelected} {selectThisProduct} {toggleDeleteProductModalIsVisible} {toggleEditProductModalIsVisible} />
            {/each}
        </div>
    </section>
    <AddProductModal form={formAct} {setProductPagination} {toggleAddProductModalIsVisible} {addProductModalIsVisible} />
    <DeleteProductModal form={formAct} {setProductPagination} {toggleDeleteProductModalIsVisible} {deleteProductModalIsVisible} {productSelected} />
    <EditProductModal form={formAct} {setProductPagination} {toggleEditProductModalIsVisible} {editProductModalIsVisible} {productSelected} />
</div>