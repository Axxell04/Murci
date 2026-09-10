<script lang="ts">
	import { page } from "$app/state";
	import type { Img, Product, ProductComplete } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import { fade, scale } from "svelte/transition";

    interface Props {
        product: ProductComplete
        productSelected?: ProductComplete | undefined
        selectThisProduct?: (product: ProductComplete) => void
        toggleProductModalIsVisible?: (visible?: boolean) => void
        toggleDeleteProductModalIsVisible?: (visible?: boolean) => void
        toggleEditProductModalIsVisible?: (visible?: boolean) => void
    }

    let { product, toggleProductModalIsVisible, toggleDeleteProductModalIsVisible, toggleEditProductModalIsVisible, productSelected, selectThisProduct }: Props = $props();

    let actualRoute = $derived(page.route.id);
    let isSelected = $derived(product.product.id === productSelected?.product.id);

    if (!toggleProductModalIsVisible) {
        toggleProductModalIsVisible = () => {};
    }
    if (!toggleDeleteProductModalIsVisible) {
        toggleDeleteProductModalIsVisible = () => {};
    }
    if (!toggleEditProductModalIsVisible) {
        toggleEditProductModalIsVisible = () => {};
    }
    
    if (!selectThisProduct) {
        selectThisProduct = () => {};
    }

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 200)
        }
    }

</script>

<div class="group/card relative w-72 h-80 flex flex-col rounded-xl overflow-hidden cursor-pointer card outline-none"
    onclick={()=>selectThisProduct(product)}
    role="button"
    tabindex="0"
    onkeydown={()=>{}}
>
    <!-- Imagen: ocupa toda la card -->
    <div class="img-container absolute inset-0 flex flex-row overflow-y-hidden overflow-x-auto snap-x snap-mandatory scroll-smooth">
        {#each product.imgs as imgProduct }
        <img src={imgProduct.url} alt={imgProduct.id} class="object-cover flex-shrink-0 snap-center w-72 h-full" loading="lazy">            
        {/each}
    </div>

    <!-- Degradado inferior con nombre y precio -->
    <div class="absolute bottom-0 inset-x-0 flex flex-col px-3 pb-3 pt-8 bg-gradient-to-t from-stone-900/95 via-stone-900/60 to-transparent pointer-events-none">
        <p class="text-red-400 font-extrabold text-lg leading-tight drop-shadow-lg">
            {product.product.name ?? 'Camisa'}
        </p>
        <p class="font-light text-red-300 text-base drop-shadow-lg">
            {`${product.product.price.toFixed(2)} $`}
        </p>
    </div>

    <!-- Admin overlay -->
    {#if isSelected && actualRoute?.includes('/admin')}        
    <div transition:scale class="absolute top-2 right-2 flex flex-col place-items-center gap-2 p-2 text-4xl bg-stone-900/90 backdrop-blur-xl rounded-md z-10">
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={(e)=>{e.stopPropagation(); toggleDeleteProductModalIsVisible(true)}}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="famicons:trash" />
        </button>
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={(e)=>{e.stopPropagation(); toggleEditProductModalIsVisible(true)}}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="mdi:edit-outline" />
        </button>
    </div>
    {/if}
</div>

<style>
    .card {
        background: #1c1917;
    }

    .card:hover {
        box-shadow: oklch(70.4% 0.191 22.216) 0px 0px 8px;
    }

    .img-container {
        --sb-track-color: #292524;
        --sb-thumb-color: #f87171;
        --sb-size: 6px;
    }

    .img-container::-webkit-scrollbar {
        height: var(--sb-size);
    }

    .img-container::-webkit-scrollbar-track {
        background: var(--sb-track-color);
        border-radius: 10px;
    }

    .img-container::-webkit-scrollbar-thumb {
        background: var(--sb-thumb-color);
        border-radius: 10px;
    }

    @supports not selector(::-webkit-scrollbar) {
        .img-container {
            scrollbar-color: var(--sb-thumb-color)
                            var(--sb-track-color);
        }
    }
</style>