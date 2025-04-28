<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import ContainerModal from "../ContainerModal.svelte";
	import { enhance } from "$app/forms";
	import type { PurchaseDetail } from "$lib/interfaces/cart";

    interface Props {
        resetCart: () => void
        sendCartModalIsVisible: boolean
        toggleSendCartModalIsVisible: (visible?: boolean) => void
        cart: PurchaseDetail[]
    }

    let { resetCart, sendCartModalIsVisible, toggleSendCartModalIsVisible, cart }: Props = $props();

    let formMessage = $state('');

    let contact = $state('');

    let totalValue = $derived(cart.reduce((pv, cv) => pv + (cv.amount * cv.product.product.price), 0))

    function updateContact (e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value
        contact = value;
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

</script>

{#if sendCartModalIsVisible}
<div transition:fade={{duration: 200}}>
    <ContainerModal toggleModal={toggleSendCartModalIsVisible} cancelClick={true} >
        <form action="?/send_cart" method="post" use:enhance={() => {
            return async ({ result }) => {
                if (result.type === "failure") {
                    if (result.data?.message) {
                        formMessage = result.data.message as string;
                    }
                } else if (result.type === "success") {
                    resetCart();
                    toggleSendCartModalIsVisible(false);
                }
            }
        }}
        class="flex flex-col gap-2 py-3 px-4 border rounded-md bg-stone-900"
        >
            <input type="hidden" name="cart" value={JSON.stringify(cart)} />
            <div class="flex flex-col place-items-center">
                <label for="total_value">Valor total</label>
                <span class="font-semibold">$ {totalValue}</span>
            </div>
            <div class="flex flex-col gap-2 place-items-center">
                <label for="contact">Contacto</label>
                <input type="hidden" name="contact" id="contact" value={contact} autocomplete="off" />
                <input type="number" name="contact-mask" id="contact-mask" required autocomplete="off"
                class="border border-red-400 rounded-md px-1 outline-none max-w-full"
                oninput={(e) => updateContact(e)}
                />
            </div>
            <div class="flex flex-row gap-2 place-content-center">
                <button type="button" class="py-1 px-2 rounded border hover:text-red-500 focus:text-red-500"
                onclick={() => toggleSendCartModalIsVisible(false)}
                onfocus={(e) => cancelFocus(e)}
                >
                    Cancelar
                </button>
                <button class="py-1 px-2 rounded bg-red-400 text-stone-900 border hover:bg-red-500 focus:bg-red-500"
                onfocus={(e) => cancelFocus(e)}
                >
                    Realizar pedido
                </button>
            </div>
            {#if formMessage}
            <div transition:scale>
                <p class="text-red-400 text-center">
                    {formMessage}
                </p>
            </div>
            {/if}
        </form>
    </ContainerModal>    
</div>
{/if}