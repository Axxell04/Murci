<script lang="ts">
	import { page } from "$app/state";
	import type { Catalog } from "$lib/interfaces/catalog";
	import type { Img, Product, ProductComplete } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import { fade, scale } from "svelte/transition";

    interface Props {
        catalog: Catalog
        catalogSelected?: Catalog | undefined
        selectThisCatalog?: (catalog: Catalog) => void
        toggleDeleteCatalogModalIsVisible?: (visible?: boolean) => void
        toggleEditCatalogModalIsVisible?: (visible?: boolean) => void
    }

    let { catalog, toggleDeleteCatalogModalIsVisible, toggleEditCatalogModalIsVisible, catalogSelected, selectThisCatalog }: Props = $props();

    let actualRoute = $derived(page.route.id);
    let isSelected = $derived(catalog.id === catalogSelected?.id);

    if (!toggleDeleteCatalogModalIsVisible) {
        toggleDeleteCatalogModalIsVisible = () => {};
    }
    if (!toggleEditCatalogModalIsVisible) {
        toggleEditCatalogModalIsVisible = () => {};
    }
    
    if (!selectThisCatalog) {
        selectThisCatalog = () => {};
    }

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 300)
        }
    }

</script>

<div class="flex flex-row gap-2 relative border border-red-400 rounded hover:border-red-500 focus:border-red-500 focus:bg-stone-800 cursor-pointer"
    onclick={()=>selectThisCatalog(catalog)}
    role="button"
    tabindex="0"
    onkeydown={()=>{}}
>
    <div class="flex flex-col gap-1 p-2 grow">
        <span class="font-semibold">
            {catalog.name}
        </span>
        <p class="text-red-300 font-light">
            {catalog.description}
        </p>
    </div>
    {#if actualRoute?.includes('/admin')}        
    <div transition:scale class="flex flex-row place-items-center gap-2 p-2 text-4xl bg-stone-900/90 backdrop-blur-xl rounded-md">
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={()=>toggleDeleteCatalogModalIsVisible(true)}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="famicons:trash" />
        </button>
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={()=>toggleEditCatalogModalIsVisible(true)}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="mdi:edit-outline" />
        </button>
    </div>
    {/if}
</div>