<script lang="ts">
    import { enhance } from "$app/forms";
	import type { PageProps } from "./$types";

    let { form }: PageProps = $props();
</script>

<div>
    <h1>Productos</h1>
    <form method="post" action="?/create" use:enhance
    class="flex flex-col gap-2"
    >
        <label>
            Nombre
            <input name="name" class="border border-stone-900" />
        </label>
        <label>
            Precio
            <input name="price" class="border border-stone-900" />
        </label>
        <label>
            Cantidad
            <input name="amount" class="border border-stone-900" />
        </label>
        <button class="cursor-pointer">Crear</button>
    </form>
</div>
<p class="text-red-500">
    {form?.message ?? ""}
</p>
