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

<div class="w-72 h-fit flex flex-col relative bg-stone-800 rounded-xl cursor-pointer card outline-none active:scale-95"
    onclick={()=>selectThisProduct(product)}
    role="button"
    tabindex="0"
    onkeydown={()=>{}}
>
    <div class="img-container relative w-full flex flex-row flex-grow rounded-t-xl overflow-y-hidden overflow-x-auto snap-x snap-mandatory scroll-smooth" >
        <img src={product.imgs[0].url} alt={product.imgs[0].id} class="object-cover flex-shrink-0 snap-center w-72" loading="lazy">
        <img src={product.imgs[1].url} alt={product.imgs[1].id} class="object-cover flex-shrink-0 snap-center w-72" loading="lazy">
    </div>
    <div class="flex flex-col py-1 px-2">
        <p class=" text-red-400 font-extrabold">
            {product.product.name ?? 'Camisa'}
        </p>
        <p class="font-light text-red-300 text-xl">
            {`${product.product.price.toFixed(2)} $`}
        </p>
    </div>
    {#if isSelected && actualRoute?.includes('/admin')}        
    <div transition:scale class="absolute top-2 right-2 flex flex-col place-items-center gap-2 p-2 text-4xl bg-stone-900/90 backdrop-blur-xl rounded-md">
        <button class="cursor-pointer hover:text-red-500 focus:text
        -red-500" 
        onclick={()=>toggleDeleteProductModalIsVisible(true)}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="famicons:trash" />
        </button>
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={()=>toggleEditProductModalIsVisible(true)}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="mdi:edit-outline" />
        </button>
    </div>
    {/if}
</div>

<style>
    .card:hover {
        box-shadow: oklch(70.4% 0.191 22.216)  0px 0px 5px;
    }

    .img-container {
        --sb-track-color: #292524;
        --sb-thumb-color: #f87171;
        --sb-size: 8px;
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