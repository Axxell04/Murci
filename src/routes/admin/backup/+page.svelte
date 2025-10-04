<script lang="ts">
	import Icon from "@iconify/svelte";
	import { fade, scale } from "svelte/transition";
    import JSZip from "jszip";

    let resMessage = $state("");
    let loading = $state(false);

    let filesOfBackup: File[] = $state([]);    

    let inputBackupFile: HTMLInputElement | undefined;

    async function handleFile (e: Event) {
        const target = e.target as HTMLInputElement;
        const f = target.files?.[0];
        if (!f) return;

        const arrayBuffer = await f.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const mapTypes = {
            webp: "image/webp",
            json: "application/json",
            "": "application/octet-stream"
        }

        for (const file of Object.values(zip.files)) {            
            const content = await file.async("blob");
            const name = file.name.split('/').pop() as string;
            const ext = file.name.split('.').pop()?.toLowerCase();
            const type = mapTypes[ext === "webp" || ext === "json" ? ext : ""]
            filesOfBackup.push(new File([content], name, { type}));
        }
    }

    async function sendFiles () {
        if (!filesOfBackup.length || loading) return;
        loading = true;
        const resReset = await fetch("/admin/backup/upload/reset_data");
        if (!(await resReset.json()).success) return;
        for (const file of filesOfBackup) {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/admin/backup/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json();
            console.log(data);
            if (!data.success) {
                resMessage = "A ocurrido un error";
                loading = false;
                return;
            }
        }
        loading = false;
        const resRestore = await fetch("/admin/backup/upload/restore_data");
        const jsonRestore = await resRestore.json();
        if (jsonRestore.success) {
            resMessage = "Respaldo subído con éxito"
        } else {
            resMessage = "A ocurrido un error"
        }
        filesOfBackup = [];
        if (inputBackupFile) inputBackupFile.value = "";
    }

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
        <div class="p-3 bg-stone-800 rounded-md flex flex-col items-center gap-2">
            <input type="file" name="backup" accept=".zip" required onchange={handleFile} bind:this={inputBackupFile} >            
            <button class="border flex flex-row gap-2 px-3 py-1 items-center rounded-md hover:text-red-500 active::text-red-500" 
                disabled={loading}
                onclick={sendFiles}
            >
                <span>
                    Subir
                </span>
                <Icon icon="clarity:backup-restore-solid" class="text-3xl" />
            </button>
        </div>
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