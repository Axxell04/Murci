<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import { fade } from "svelte/transition";
	import type { ActionData } from "../../../../routes/admin/$types";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";

    interface Props {
        form: ActionData
        setProductPagination: (newProductPagination: ProductPagination) => void
        productSelected?: ProductComplete
        toggleDeleteProductModalIsVisible: (visible?: boolean) => void
        deleteProductModalIsVisible: boolean
    }

    let { form, setProductPagination, toggleDeleteProductModalIsVisible, deleteProductModalIsVisible, productSelected }: Props = $props();

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
                        }
                    }
                }} 
                enctype="multipart/form-data" 
                class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-5 px-10 rounded-md max-w-full max-h-fit">
                    <div class="flex flex-col gap-2 place-items-center">
                        <input type="hidden" name="product_id" value={!productSelected ? "" : (productSelected.product.id)}>
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
                    <div>
                        <p class="text-red-400 text-center">
                            {form?.message ?? ""}
                        </p>
                    </div>
                    <div role="button" tabindex="0" onkeydown={()=>{}}
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleDeleteProductModalIsVisible(false)}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
    </div>
{/if}
