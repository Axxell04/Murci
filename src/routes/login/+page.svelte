<script lang="ts">
	import Icon from "@iconify/svelte";
    import { enhance } from "$app/forms";

	import { fade, scale } from "svelte/transition";
	import type { PageProps } from "./$types";

    let { form }: PageProps = $props();

    // HTML Elements
    let passwordInput: HTMLInputElement;

    // Visible elements
    let passwordIsVisible = $state(false);

    // Toggle Visible Elements
    function togglePasswordVisibility (e: Event) {
        passwordIsVisible = !passwordIsVisible;
        if (passwordInput) {
            e.preventDefault();
            passwordInput.focus();
        }
    }


</script>

<div in:fade>
    <div class="flex flex-col gap-4 place-items-center p-4">
        <h2 class="text-3xl font-bold text-red-500">Login</h2>
        <form method="post" action="?/login" use:enhance class="flex flex-col gap-2">
            <label for="username" class="text-red-500">Usuario</label>
            <input type="text" id="user" name="username" class="p-2 border border-red-500 bg-transparent outline-none rounded" />
            <label for="password" class="text-red-500">Contraseña</label>
            <div class=" border border-red-500 flex flex-row rounded">
                <input bind:this={passwordInput} type={passwordIsVisible ? 'text' : 'password'} id="password" name="password" class="p-2 bg-transparent outline-none" />
                <button type="button" class="text-3xl px-2 w-[46px]" onclick={(e)=>togglePasswordVisibility(e)}>
                    {#if passwordIsVisible}
                    <div in:scale>
                        <Icon icon="hugeicons:view" />
                    </div>
                    {:else}  
                    <div in:scale>
                        <Icon icon="hugeicons:view-off" />
                    </div>
                    {/if}
                </button>
            </div>
            <button class="bg-red-500 text-stone-900 font-semibold p-2 rounded cursor-pointer">Iniciar Sesión</button>
        </form>
        <p>
            {form?.message ?? ''}
        </p>
    </div>
</div>