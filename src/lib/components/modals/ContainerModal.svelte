<script lang="ts">
	import { onDestroy, onMount, type Snippet } from "svelte";

    interface Props {
        children: Snippet
        toggleModal: (visible?: boolean) => void
        visible?: boolean
        cancelClick?: boolean
    }

    let { children, toggleModal, cancelClick, visible }: Props = $props();

    // $effect(() => {
    //     if (typeof window !== 'undefined') {
    //         if (visible) {
    //             document.body.classList.add('overflow-hidden');
    //         } else {
    //             document.body.classList.remove('overflow-hidden');
    //         }
    //     }
    // })
    
    
    onMount(() => {
        document.body.classList.add('overflow-hidden');
    })
    onDestroy(() => {
        document.body.classList.remove('overflow-hidden');
    }) 
    

</script>

<div role="button" tabindex="0" onkeydown={()=>{}}
    class="fixed top-0 left-0 z-50 p-4 w-full min-h-dvh max-h-dvh box-border bg-stone-900/60 backdrop-blur-md overflow-hidden flex flex-col place-items-center place-content-center" 
    onclick={()=>{toggleModal(false)}}    
>
    {#if !cancelClick}
    {@render children()}
    {:else}
    <div onclick={(e) => e.stopPropagation()} role="button" tabindex="0" onkeypress={()=>{}} 
    class="flex flex-col place-items-center w-fit max-w-full place-content-center outline-none h-full relative"
    >
        {@render children()}
    </div>
    {/if}
</div>