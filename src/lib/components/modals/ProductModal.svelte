<script lang="ts">
	import { fade, fly, scale } from "svelte/transition";


	import ContainerModal from "./ContainerModal.svelte";
	import type { Product } from "$lib/interfaces/product";

    interface Props {
        productModalIsVisible: boolean
        toggleProductModalIsVisible: (visible?: boolean) => void
        productSelected: Product | undefined
    }

    let { toggleProductModalIsVisible, productModalIsVisible, productSelected }: Props = $props()

</script>

{#if productModalIsVisible}
<div transition:fade={{duration: 200}}>
<ContainerModal toggleModal={toggleProductModalIsVisible}>
    <div >
        <img src={productSelected?.img} alt={productSelected?.name} loading="lazy">
    </div>
</ContainerModal>
</div>
{/if}