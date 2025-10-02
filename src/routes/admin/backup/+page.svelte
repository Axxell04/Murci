<script lang="ts">
	import { enhance } from "$app/forms";
	import BackupCard from "$lib/components/BackupCard.svelte";
	import Icon from "@iconify/svelte";
	import { fade, scale } from "svelte/transition";

    let resMessage = $state("");
    let loading = $state(false);

    $effect(() => {
        if (loading) {
            resMessage = "";
        }
    })

    $effect(() => {
        if (resMessage) {
            setTimeout(() => {
                resMessage = "";
            }, 5000)
        }
    });

</script>

<div in:fade class="flex flex-col gap-2 px-5 py-5">
    <h2 class="text-center text-xl">
        Backup
    </h2>
    <div class="flex flex-col px-10 py-5 items-center gap-3">
        <form action="/admin/backup/download" method="get">
            <button class="border flex flex-row gap-2 px-3 py-1 items-center rounded-md hover:text-red-500 active::text-red-500">
                <span>
                    Descargar
                </span>
                <Icon icon="clarity:backup-solid" class="text-3xl" />
            </button>
        </form>
        <form action="?/upload" method="post" class="p-3 bg-stone-800 rounded-md flex flex-col items-center gap-2"
            enctype="multipart/form-data"
            use:enhance={({formElement}) => {
                loading = true;
                return async ({ result }) => {
                    loading = false;
                    if (result.type === "success") {
                        resMessage = "Respaldo subido con éxito";
                        formElement.reset();
                    } else if (result.type === "failure") {
                        resMessage = "No fue posible subir el respaldo";
                    }
                }
            }}
        >
            <input type="file" name="backup" accept=".zip" required>
            <div class="flex flex-row gap-2">
                <span>
                    Forzar restauración
                </span>
                <input type="checkbox" name="force" class="accent-red-500">
            </div>
            <button class="border flex flex-row gap-2 px-3 py-1 items-center rounded-md hover:text-red-500 active::text-red-500" 
                disabled={loading}
            >
                <span>
                    Subir
                </span>
                <Icon icon="clarity:backup-restore-solid" class="text-3xl" />
            </button>
        </form>
        {#if loading}
        <div transition:scale={{duration: 200}} class="w-10 h-10 border-4 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            
        {/if}

        {#if resMessage}
        <span transition:scale>
            {resMessage}
        </span>            
        {/if}
    </div>
</div>