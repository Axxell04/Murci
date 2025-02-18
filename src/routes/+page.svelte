<script lang="ts">

	import ProductCard from "$lib/components/ProductCard.svelte";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { PageProps } from "./$types";
	import ContainerModal from "$lib/components/modals/ContainerModal.svelte";
	import ProductModal from "$lib/components/modals/ProductModal.svelte";
	import type { Product, ProductComplete } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";

    let { data }: PageProps = $props();

    // Selected Elements
    let productSelected: ProductComplete | undefined = $state() 

    function selectThisProduct (product: ProductComplete) {
        productSelected = product;

        toggleProductModalIsVisible(true);
    }

    // Visible Elements
    let productModalIsVisible = $state(false);

    // Toggle Visible Elements
    function toggleProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            productModalIsVisible = visible;
        } else {
            productModalIsVisible = !productModalIsVisible;
        }
    }

    function updatePagination (e: Event) {
        const inputE = e as InputEvent;
        const target = e.target as HTMLInputElement;
        // console.log(isNaN(parseInt(inputE.data ?? "")));
        // console.log(inputE)
        if (isNaN(parseInt(inputE.data ?? "")) && inputE.inputType !== "deleteContentBackward") {
            e.preventDefault();
            target.value = target.value.slice(0, -1);

        }
        
    }

</script>

<div in:fade class="flex flex-col gap-2 max-w-full max-h-full">
    <section class="px-10 w-full sticky top-0 bg-stone-900/95 backdrop-blur-lg">
        <div class="flex flex-wrap gap-3 justify-center  text-center text-red-400 font-normal p-4 border border-transparent border-b-red-400">
            <span class="block self-center">
                Todo
            </span>
            <div class="flex flex-row gap-2 place-items-center">
                <button class="hover:text-red-500">
                    <Icon icon="icon-park-outline:left-c" class="text-3xl" />
                </button>
                <input type="text" class="w-10 text-center text-3xl bg-transparent outline-none" value="1" oninput={(e)=>updatePagination(e)} />
                <!-- <span class="block text-3xl">
                    1
                </span> -->
                <button class="hover:text-red-500">
                    <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                </button>
            </div>
            <div class="flex flex-row flex-grow place-content-end">
                <a href="/carrito" class="flex flex-row gap-1 justify-end place-items-center hover:text-red-500">
                    <div class="relative flex flex-col place-items-center">
                        <Icon icon="bi:cart-fill" class="text-4xl" />
                        <span class="block absolute -top-2 -right-2 rounded-full font-bold text-lg bg-stone-900 text-red-400 border border-red-400 px-2 ">
                            3
                        </span>
                    </div>
                </a>
            </div>
		</div>
	</section>
    <section class="flex flex-wrap justify-center p-2 gap-3">
        {#each data.products as product}
            <ProductCard {product} {toggleProductModalIsVisible} {productSelected} {selectThisProduct} />
        {/each}
    </section>
</div>

<ProductModal {productModalIsVisible} {toggleProductModalIsVisible} {productSelected} />
