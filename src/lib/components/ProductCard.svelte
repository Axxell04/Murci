<script lang="ts">
	import { page } from "$app/state";
	import type { Img, Product, ProductComplete } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import { fade } from "svelte/transition";

    interface Props {
        product: ProductComplete
        toggleProductModalIsVisible?: (visible?: boolean) => void
        productSelected?: ProductComplete | undefined
        selectThisProduct?: (product: ProductComplete) => void
    }

    let { product, toggleProductModalIsVisible, productSelected, selectThisProduct }: Props = $props();

    let actualRoute = $derived(page.route.id);

    if (!toggleProductModalIsVisible) {
        toggleProductModalIsVisible = () => {};
    }
    if (!productSelected) {
        productSelected = undefined;
    }
    if (!selectThisProduct) {
        selectThisProduct = () => {};
    }

</script>

<div class="w-72 h-fit flex flex-col relative border border-red-400 rounded hover:border-red-500 cursor-pointer"
    onclick={()=>selectThisProduct(product)}
    role="button"
    tabindex="0"
    onkeydown={()=>{}}
>
    <div class=" w-full flex-grow rounded-t-sm overflow-hidden" >
        <img src={product.imgs[0].url} alt={product.imgs[0].id} class="object-cover" loading="lazy">
    </div>
    <div class="flex flex-col py-1 px-2">
        <p class=" text-red-400">
            {product.product.name ?? 'Camisa'}
        </p>
        <p class="font-light text-red-300">
            {`${product.product.price ?? 9.99} $`}
        </p>
    </div>
    <div class="absolute top-2 right-2 flex flex-col place-items-center gap-2 p-2 text-4xl bg-stone-900/90 backdrop-blur-xl rounded-md">
        <button class="cursor-pointer hover:text-red-500">
            <Icon icon="famicons:trash" />
        </button>
        <button class="cursor-pointer hover:text-red-500">
            <Icon icon="mdi:edit-outline" />
        </button>
    </div>
</div>