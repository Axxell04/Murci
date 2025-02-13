<script lang="ts">
	import type { Product } from "$lib/interfaces/product";
	import { fade } from "svelte/transition";

    interface Props {
        product: Product
        toggleProductModalIsVisible: (visible?: boolean) => void
        productSelected: Product | undefined
        selectThisProduct: (product: Product) => void
    }

    let { product, toggleProductModalIsVisible, productSelected, selectThisProduct }: Props = $props();

    

</script>

<div class="w-72 h-fit flex flex-col border border-red-400 rounded hover:border-red-500 cursor-pointer"
    onclick={()=>selectThisProduct(product)}
    role="button"
    tabindex="0"
    onkeydown={()=>{}}
>
    <div class=" w-full flex-grow rounded-t-sm overflow-hidden" >
        <img src={product.img} alt={product.name} class="object-cover" loading="lazy">
    </div>
    <div class="flex flex-col py-1 px-2">
        <p class=" text-red-400">
            {product.name ?? 'Camisa'}
        </p>
        <p class="font-light text-red-300">
            {`${product.price ?? 9.99} $`}
        </p>
    </div>
</div>