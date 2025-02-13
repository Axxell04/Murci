<script lang="ts">
	import type { Snippet } from "svelte";

    interface Props {
        children: Snippet
        toggleModal: (visible?: boolean) => void
    }

    let { children, toggleModal }: Props = $props();

</script>

<button class="fixed top-0 left-0 p-4 w-full h-dvh box-border bg-stone-900/60 backdrop-blur-md overflow-hidden flex flex-col place-items-center place-content-center" 
    onclick={()=>toggleModal(false)}    
>
    {@render children()}
</button>