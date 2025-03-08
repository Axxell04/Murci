<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";
	import { onMount } from "svelte";

    interface Props {
        products: ProductComplete[]
        setProductPagination: (newProductPagination: ProductPagination) => void
        catalogId: string
        toggleAddProductToCatalogModalIsVisible: (visible?: boolean) => void
        addProductToCatalogModalIsVisible: boolean
    }

    let { products, setProductPagination, catalogId, toggleAddProductToCatalogModalIsVisible, addProductToCatalogModalIsVisible }: Props = $props();

    let formMessage = $state('');
    
    // Binded Elements
    let btnGetProducts: HTMLButtonElement | undefined = $state();

    let totalProductsList: ProductComplete[] = $state([]);
    let productsToAddList: ProductComplete[] = $state([]);

    function toggleProductToAdd (product: ProductComplete) {
        const initLength = productsToAddList.length;
        productsToAddList = productsToAddList.filter(p => p.product.id !== product.product.id);
        const finalLength = productsToAddList.length;
        if (initLength === finalLength) {
            productsToAddList.push(product);
        }
    }

    function isSelected (product: ProductComplete) {
        if (productsToAddList.find(p => p.product.id === product.product.id)) {
            return true;
        }
        return false;
    }

    function filterTotalProducts (totalList: ProductComplete[]) {
        totalList = totalList.filter((p) => {
            const inList = products.some(product => product.product.id === p.product.id)
            return !inList
        })

        return totalList;
    }

    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 5000)
        }
    })

    $effect(() => {
        if (typeof window !== 'undefined') {
            const body = document.querySelector('body')
            if (addProductToCatalogModalIsVisible) {
                if (typeof btnGetProducts !== 'undefined') {
                    btnGetProducts.click();
                }
                body?.classList.add('overflow-hidden')
            } else {
                body?.classList.remove('overflow-hidden')
                
            }

        }
    })

</script>

{#if addProductToCatalogModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleAddProductToCatalogModalIsVisible} cancelClick={true}>
                <form action="?/get_products" method="post" use:enhance={() => {
                    return async ({ result }) => {
                        if (result.type === "failure") {
                            if (result.data?.message) {
                                formMessage = result.data.message as string;
                            }
                        } else if (result.type === "success") {
                            if (result.data?.pagination) {
                                // setProductPagination(result.data.pagination as ProductPagination);
                                const pagination = result.data.pagination as ProductPagination;
                                totalProductsList = filterTotalProducts(pagination.products);
                            }
                        }
                    }
                }}>
                    <button bind:this={btnGetProducts} class="hidden">
                        Get Products
                    </button>
                </form>
                <form id="add-product-to-catalog" action="?/add_product_to_catalog" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        if (result.type === "failure") {
                            if (result.data?.message) {
                                formMessage = result.data.message as string;
                            }
                        }
                        if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.pagination) {
                                console.log(result.data.pagination)
                                setProductPagination(result.data.pagination as ProductPagination);
                                toggleAddProductToCatalogModalIsVisible(false);
                                productsToAddList = [];
                            }
                            // await goto("/admin", {invalidateAll: true});
                        }
                    }
                }} 
                enctype="multipart/form-data" 
                class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-5 px-9 rounded-md max-w-full max-h-fit">
                    <input type="hidden" name="catalog_id" value={catalogId} >
                    <input type="hidden" name="products_to_add_list" value={JSON.stringify(productsToAddList)} >
                    <!-- <div class="flex flex-col gap-2 place-items-center">
                        <label for="name">Nombre</label>
                        <input type="text" name="name" id="name" required autocomplete="off"
                        class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                        />
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="price">Precio</label>
                        <input type="number" name="price" id="price" required step="0.01"
                        class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                        />
                    </div> -->
                    <div class="flex flex-col relative max-h-72 gap-2 place-items-center">
                        <div class="flex flex-col overflow-y-auto max-h-full ">
                            <ul>                                
                                {#each totalProductsList as product}
                                <li>
                                    <button type="button" class="w-full hover:bg-stone-800 p-2 {isSelected(product) ? 'text-red-500' : '' }" 
                                    onclick={() => toggleProductToAdd(product)}>
                                        {product.product.name}
                                    </button>
                                </li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <button type="submit" class="border hover:border-red-500 hover:text-red-500 border-red-400 rounded-md p-2 cursor-pointer">
                            Agregar
                        </button>
                    </div>
                    {#if formMessage}
                    <div transition:scale>
                        <p class="text-red-400 text-center">
                            {formMessage}
                        </p>
                    </div>
                    {/if}
                    <div role="button" tabindex="0" onkeydown={()=>{}}
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleAddProductToCatalogModalIsVisible(false)}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
    </div>

{/if}
