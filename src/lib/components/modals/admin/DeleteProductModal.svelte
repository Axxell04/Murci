<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import type { ActionData } from "../../../../routes/admin/$types";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";

    interface Props {
        setProductPagination: (newProductPagination: ProductPagination) => void
        productSelected?: ProductComplete
        catalogId: string
        toggleDeleteProductModalIsVisible: (visible?: boolean) => void
        deleteProductModalIsVisible: boolean
    }

    let { setProductPagination, catalogId, toggleDeleteProductModalIsVisible, deleteProductModalIsVisible, productSelected }: Props = $props();

    let formMessage = $state('');

    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 6000);
        }
    })

    $effect(() => {
        if (typeof window !== 'undefined') {
            if (deleteProductModalIsVisible) {
                document.body.classList.add('overflow-hidden');
            } else {
                document.body.classList.remove('overflow-hidden');
            }
        }
    })

</script>

{#if deleteProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleDeleteProductModalIsVisible} cancelClick={true}>
                <form id="delete-product" action="?/delete_product" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.pagination) {
                                // console.log(result.data.products)
                                setProductPagination(result.data.pagination as ProductPagination);
                                toggleDeleteProductModalIsVisible(false);
                            }
                            // await goto("/admin", {invalidateAll: true});
                        } else if (result.type === "failure") {
                            if (result.data?.message) {
                                formMessage = result.data.message as string;
                            }
                        }
                    }
                }} 
                enctype="multipart/form-data" 
                class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-5 px-10 rounded-md max-w-full max-h-fit">
                    <div class="flex flex-col gap-2 place-items-center">
                        <input type="hidden" name="product_id" value={!productSelected ? "" : (productSelected.product.id)}>
                        <input type="hidden" name="catalog_id" value={catalogId}>
                        <label for="name">Nombre</label>
                        <span class="text-red-300">
                            {#if productSelected}
                            {productSelected.product.name}                                
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="price">Precio</label>
                        <span class="text-red-300">
                            {#if productSelected}
                            {productSelected.product.price}                                
                            {/if}
                        </span>
                    </div>
                    <!-- <div class="flex flex-col gap-2 place-items-center">
                        <label for="imgs">Imagenes</label>
                        <input type="file" aria-labelledby="imagenes" name="imgs" id="imgs" accept="image/*" multiple 
                        class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                        style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
                        />
                    </div> -->
                    <div class="flex flex-col gap-2 place-items-center">
                        <button type="submit" class="border hover:border-red-500 hover:text-red-500 border-red-400 rounded-md p-2 cursor-pointer">
                            Eliminar
                        </button>
                    </div>
                    {#if catalogId}
                    <div class="flex flex-col gap-2 place-items-center">
                        <button formaction="?/remove_product_to_catalog" type="submit" class="border hover:border-red-500 hover:text-red-500 border-red-400 rounded-md p-2 cursor-pointer">
                            Quitar del catálogo
                        </button>
                    </div>
                    {/if}
                    {#if formMessage}                        
                    <div transition:scale>
                        <p class="text-red-400 text-center">
                            {formMessage}
                        </p>
                    </div>
                    {/if}
                    <div role="button" tabindex="0" onkeydown={()=>{}}
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleDeleteProductModalIsVisible(false)}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
    </div>
{/if}
