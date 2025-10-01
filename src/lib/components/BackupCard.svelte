<script lang="ts">
    interface Props {

    }

    let {}: Props = $props();
    let btnDownloadIsVisible = $state(false);

    // Functions
    function toggleBtnDownloadIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            btnDownloadIsVisible = visible;
        } else {
            btnDownloadIsVisible = !btnDownloadIsVisible;
        }
    }

</script>

<div class="flex flex-col gap-3 bg-stone-800 p-3 rounded-xl cursor-pointer"
    tabindex="0"
    onkeydown={() => {}}
    role="button"
    onclick={() => toggleBtnDownloadIsVisible()}
>
    <span class="font-bold">
        Backup-001
    </span>
    <span>
        24/09/2025, 03:47 p. m.
    </span>
    {#if btnDownloadIsVisible}
        <button class="border rounded-md hover:text-red-500"
            onclick={(e) => {e.stopPropagation()}}
        >
            Download
        </button>        
    {/if}
</div>