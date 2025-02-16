<script lang="ts">
    import { enhance } from "$app/forms";
	import { fade } from "svelte/transition";
	import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

</script>

<div in:fade class="flex flex-col gap-2 px-10 py-5 max-h-full">
    <section class="flex flex-wrap gap-5">
        <form action="?/add_product" method="post" class="flex flex-col gap-2 border border-red-400 p-1 rounded-md max-w-full">
            <div class="flex flex-col gap-2 place-items-center">
                <label for="name">Nombre</label>
                <input type="text" name="name" required
                class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                />
            </div>
            <div class="flex flex-col gap-2 place-items-center">
                <label for="precio">Precio</label>
                <input type="number" name="precio" required
                class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                />
            </div>
            <div class="flex flex-col gap-2 place-items-center">
                <label for="imgs">Imagenes</label>
                <input type="file" aria-labelledby="imagenes" name="imgs"
                class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
                />
            </div>
        </form>
    </section>
</div>