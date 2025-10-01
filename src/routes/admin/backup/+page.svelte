<script lang="ts">
	import BackupCard from "$lib/components/BackupCard.svelte";
	import Icon from "@iconify/svelte";
	import { fade } from "svelte/transition";

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
        <form method="post" action="?/upload" class="p-3 bg-stone-800 rounded-md flex flex-col items-center gap-2">
            <input type="file" name="backup" accept=".json" required>
            <button class="border flex flex-row gap-2 px-3 py-1 items-center rounded-md hover:text-red-500 active::text-red-500">
                <span>
                    Subir
                </span>
                <Icon icon="clarity:backup-restore-solid" class="text-3xl" />
            </button>
        </form>
    </div>
</div>