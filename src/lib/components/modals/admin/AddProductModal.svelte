<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete } from "$lib/interfaces/product";
	import { fade } from "svelte/transition";
	import type { ActionData } from "../../../../routes/admin/$types";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";

    interface Props {
        form: ActionData
        setProducts: (newProducts: ProductComplete[]) => void
        toggleAddProductModalIsVisible: (visible?: boolean) => void
        addProductModalIsVisible: boolean
    }

    let { form, setProducts, toggleAddProductModalIsVisible, addProductModalIsVisible }: Props = $props();

</script>

{#if addProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleAddProductModalIsVisible} cancelClick={true}>
                <form id="add-product" action="?/add_product" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.products) {
                                console.log(result.data.products)
                                setProducts(result.data.products as ProductComplete[]);
                                toggleAddProductModalIsVisible(false);
                            }
                            // await goto("/admin", {invalidateAll: true});
                        }
                    }
                }} 
                enctype="multipart/form-data" 
                class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-1 px-2 rounded-md max-w-full max-h-fit">
                    <div class="flex flex-col gap-2 place-items-center">
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
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="imgs">Imagenes</label>
                        <input type="file" aria-labelledby="imagenes" name="imgs" id="imgs" accept="image/*" multiple 
                        class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                        style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
                        />
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <button type="submit" class="border hover:border-red-500 hover:text-red-500 border-red-400 rounded-md p-2 cursor-pointer">
                            Agregar
                        </button>
                    </div>
                    <div>
                        <p class="text-red-400 text-center">
                            {form?.message ?? ""}
                        </p>
                    </div>
                    <div role="button" tabindex="0" onkeydown={()=>{}}
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleAddProductModalIsVisible(false)}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
    </div>
{/if}
