<script lang="ts">

	import { fade } from "svelte/transition";
	import type { PageProps } from "./$types";
	import Icon from "@iconify/svelte";
	import type { PurchaseDetail } from "$lib/interfaces/cart";
	import { enhance } from "$app/forms";
	import ClearCartModal from "$lib/components/modals/carrito/ClearCartModal.svelte";

    let { data }: PageProps = $props();

    let cart = $state(data.cart);

    //HTML Elements
    let btnUpdateCartElement: HTMLButtonElement | undefined = $state();

    // Visible Elements
    let clearCartModalIsVisible = $state(false);

    // Toggle Visible Elements
    function toggleClearCartModalIsVisible (visible?: boolean) {
        if (typeof visible === 'undefined') {
            clearCartModalIsVisible = !clearCartModalIsVisible;
        } else {
            clearCartModalIsVisible = visible;
        }
    }

    function addProduct (purchaseDetail: PurchaseDetail) {
        cart = cart.map((pd) => {
            if (pd.product.product.id === purchaseDetail.product.product.id) {
                return {
                    product: pd.product,
                    amount: pd.amount + 1
                }
            } else {
                return pd
            }
        })
    }
    
    function subtract (purchaseDetail: PurchaseDetail) {
        cart = cart.map((pd) => {
            if (pd.product.product.id === purchaseDetail.product.product.id) {
                return {
                    product: pd.product,
                    amount: pd.amount - 1
                }
            } else {
                return pd
            }
        });

        cart = cart.filter((pd) => pd.amount > 0);
    }

    function resetCart () {
        cart = [];
    }

    $effect(() => {
        cart;
        if (typeof btnUpdateCartElement !== 'undefined') {
            btnUpdateCartElement.click();
        }
        // USAR UNA COLA DE ACTUALIZACIÓN PARA EVITAR ACTUALIZACIONES DESFAZADAS???
    })

</script>

<div in:fade>
    <section class="sticky -top-1 z-30 flex flex-col bg-stone-900/95 backdrop-blur-lg gap-3 p-3">
        <div class="flex flex-col place-items-center text-xl">
            Carrito de compras
        </div>
        <div class="flex flex-wrap gap-3 place-content-center">
            <button class="flex flex-row gap-1 border py-2 px-2 rounded-full place-items-center hover:text-red-500 focus:text-red-500">
                <Icon icon="bi:cart-check-fill" class="text-2xl" />
                <span>
                    Realizar
                </span>
            </button>
            <button class="flex flex-row gap-1 border py-2 px-2 rounded-full place-items-center hover:text-red-500 focus:text-red-500"
            onclick={() => toggleClearCartModalIsVisible(true)}
            >
                <Icon icon="bi:cart-x-fill" class="text-2xl" />
                <span>
                    Vaciar
                </span>
            </button>
        </div>
    </section>
    <section class="flex flex-wrap gap-2 justify-center">
        {#each cart as purchaseDetail}
            <div class="flex flex-row gap-2 p-2 relative  w-fit max-h-40 border rounded-xl hover:border-red-500">
                <div class="h-full max-h-full min-h-full max-w-36">
                    <img src={purchaseDetail.product.imgs[0].url} alt="product_img" class="max-h-full min-h-full rounded-md object-contain">
                </div>
                <div class="flex flex-col px-3 gap-2 place-content-between text-center overflow-y-auto">
                    <div class="flex flex-col gap-1 place-items-center">
                        <span class="text-lg font-semibold">
                            {purchaseDetail.product.product.name}
                        </span>
                        <span>
                            {purchaseDetail.product.product.price} $
                        </span>
                    </div>
                    <div class="flex flex-col gap-3 place-items-center ">
                        <span>
                            Cantidad
                        </span>
                        <div class="flex flex-row gap-2 place-items-center text-lg">
                            <button class="p-1 border rounded-full hover:text-red-500 focus:text-red-500" onclick={() => subtract(purchaseDetail)}>
                                <Icon icon="octicon:dash-16" />
                            </button>
                            <span>
                                {purchaseDetail.amount}
                            </span>
                            <button class="p-1 border rounded-full hover:text-red-500 focus:text-red-500" onclick={() => addProduct(purchaseDetail)}>
                                <Icon icon="ic:round-plus" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </section>
</div>

<form action="?/update_cart" method="post" use:enhance 
class="hidden"
>
    <input type="hidden" name="cart" value={JSON.stringify(cart)}>
    <button bind:this={btnUpdateCartElement} type="submit">
        Update Cart
    </button>
</form>

<ClearCartModal {toggleClearCartModalIsVisible} {resetCart} {clearCartModalIsVisible} />