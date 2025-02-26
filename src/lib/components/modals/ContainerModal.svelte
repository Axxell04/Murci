<script lang="ts">
	import type { Snippet } from "svelte";

    interface Props {
        children: Snippet
        toggleModal: (visible?: boolean) => void
        cancelClick?: boolean
    }

    let { children, toggleModal, cancelClick }: Props = $props();

</script>

<div role="button" tabindex="0" onkeydown={()=>{}}
    class="fixed top-0 left-0 z-50 p-4 w-full min-h-dvh max-h-dvh box-border bg-stone-900/60 backdrop-blur-md overflow-hidden flex flex-col place-items-center place-content-center" 
    onclick={()=>toggleModal(false)}    
>
    {#if !cancelClick}
    {@render children()}
    {:else}
    <div onclick={(e) => e.stopPropagation()} role="button" tabindex="0" onkeypress={()=>{}} 
    class="flex flex-col place-items-center place-content-center outline-none h-full relative"
    >
        {@render children()}
    </div>
    {/if}
</div>