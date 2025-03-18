<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import type { ActionData } from "../../../../routes/admin/$types";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";
	import ImgsProductModal from "../ImgsProductModal.svelte";
	import ImgsEditProductModal from "./ImgsEditProductModal.svelte";
	import { onDestroy } from "svelte";

    interface Props {
        setProductPagination: (newProductPagination: ProductPagination) => void
        productSelected?: ProductComplete
        toggleEditProductModalIsVisible: (visible?: boolean) => void
        editProductModalIsVisible: boolean
    }

    let { setProductPagination, toggleEditProductModalIsVisible, editProductModalIsVisible, productSelected }: Props = $props();

    // Form
    let formMessage = $state('')

    let listDelete: number[] = $state([]);

    let listDeleteToForm: string[] = $derived(!productSelected || !listDelete.length ? [] : [...productSelected?.imgs.filter((img) => {
        if (listDelete.includes(productSelected.imgs.indexOf(img))) {
            return true
        } else {
            return false
        }
    }).map((img) => img.id)
    ]);

    let imgsEditProductModalIsVisible = $state(false);
    function toggleImgsEditProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            imgsEditProductModalIsVisible = visible;
        } else {
            imgsEditProductModalIsVisible = !imgsEditProductModalIsVisible;
        }

    }

    function updateListDelete (newList: number[]) {
        listDelete = newList;
    }

    function clearList () {
        listDelete = []
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
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 5000)
        }
    })

    $effect(() => {
        if (!editProductModalIsVisible) {
            clearList();
        }
    })

</script>

{#if editProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleEditProductModalIsVisible} visible={editProductModalIsVisible} cancelClick={true}>
                <form id="edit-product" action="?/edit_product" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        console.log(result)
                        if (result.type === "failure") {
                            if (result.data?.message) {
                                formMessage = result.data.message as string;
                            }
                        } else if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.pagination) {
                                // console.log(result.data.products)
                                setProductPagination(result.data.pagination as ProductPagination);
                                toggleEditProductModalIsVisible(false);
                                clearList();
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
                            <input type="text" name="name" id="name" required autocomplete="off"
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            value={productSelected.product.name}
                            />                               
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="price">Precio</label>
                        <span class="text-red-300">
                            {#if productSelected}
                            <input type="number" name="price" id="price" required step="0.01"
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            value={productSelected.product.price}
                            />                             
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="imgs">Imagenes</label>
                        <input type="file" aria-labelledby="imagenes" name="imgs" id="imgs" accept="image/*" multiple 
                        class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                        style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
                        />
                        <button type="button" class="border p-1 rounded-md cursor-pointer hover:text-red-500 focus:text-red-500" 
                        onclick={()=>toggleImgsEditProductModalIsVisible(true)}
                        onfocus={(e) => cancelFocus(e)}
                        >
                            Ver imagenes
                        </button>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <input type="text" hidden name="list_delete" 
                        value={JSON.stringify(listDeleteToForm)}
                        >
                        <button type="submit" class="border hover:text-red-500 focus:text-red-500 rounded-md p-2 cursor-pointer"
                        onfocus={(e) => cancelFocus(e)}
                        >
                            Editar
                        </button>
                    </div>
                    {#if formMessage}
                    <div transition:scale>
                        <p class="text-red-500 text-center">
                            {formMessage}
                        </p>
                    </div>
                    {/if}
                    <div role="button" tabindex="0" onkeydown={()=>{}}
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => {toggleEditProductModalIsVisible(false)}}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
        <ImgsEditProductModal {productSelected} {imgsEditProductModalIsVisible} {toggleImgsEditProductModalIsVisible} {listDelete} {updateListDelete} />
    </div>
{/if}
