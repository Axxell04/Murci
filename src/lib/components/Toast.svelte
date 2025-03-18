<script lang="ts">
	import { scale } from "svelte/transition";

    interface Props {
        message: string
    }

    let { message }: Props = $props();

</script>

{#if message}
<div transition:scale class="fixed top-0 left-0 z-[60] w-full p-2 flex flex-col place-items-center text-stone-900">
    <span class="border border-stone-900 rounded-2xl py-1 px-2 bg-red-300" 
    onclick={(e)=>e.preventDefault()} role="button" tabindex="0" onkeydown={() => {}}
    >
        {message}
    </span>
</div>
{/if}