<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import Icon from "@iconify/svelte";
	import type { Catalog } from "$lib/interfaces/catalog";
	import ContainerModal from "../../ContainerModal.svelte";

    interface Props {
        setCatalogs: (newCatalogs: Catalog[]) => void
        catalogSelected?: Catalog
        toggleDeleteCatalogModalIsVisible: (visible?: boolean) => void
        deleteCatalogModalIsVisible: boolean
    }

    let { setCatalogs, toggleDeleteCatalogModalIsVisible, deleteCatalogModalIsVisible, catalogSelected }: Props = $props();

    let formMessage = $state('');

    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 6000)
        }
    })


</script>

{#if deleteCatalogModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleDeleteCatalogModalIsVisible} visible={deleteCatalogModalIsVisible} cancelClick={true}>
                <form id="delete-catalog" action="?/delete_catalog" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.catalogs) {
                                // console.log(result.data.products)
                                setCatalogs(result.data.catalogs as Catalog[]);
                                toggleDeleteCatalogModalIsVisible(false);
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
                    <div class="flex flex-col gap-2 place-items-center text-center">
                        <input type="hidden" name="id" value={!catalogSelected ? "" : (catalogSelected.id)}>
                        <label for="name">Nombre</label>
                        <span class="text-red-300">
                            {#if catalogSelected}
                            {catalogSelected.name}                                
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center text-center">
                        <label for="price">Descripción</label>
                        <span class="text-red-300">
                            {#if catalogSelected}
                            {catalogSelected.description}                                
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <button type="submit" class="border hover:border-red-500 hover:text-red-500 border-red-400 rounded-md p-2 cursor-pointer">
                            Eliminar
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
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleDeleteCatalogModalIsVisible(false)}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
    </div>
{/if}
