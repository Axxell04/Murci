<script lang="ts">
	import Icon from "@iconify/svelte";
    import { enhance } from "$app/forms";

	import { fade, scale } from "svelte/transition";
	import type { PageProps } from "./$types";
	import { goto, invalidateAll } from "$app/navigation";

    let { form }: PageProps = $props();

    let formMessage = $state('');

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

    // Effects
    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = ""
            }, 6000);
        }
    })


</script>

<div in:fade>
    <div class="flex flex-col gap-4 place-items-center p-4">
        <h2 class="text-3xl font-bold text-red-500">Login</h2>
        <form method="post" action="?/login" use:enhance={({formElement}) => {
            return async ({ result }) => {
                if (result.type === "failure") {
                    if (result.data?.message) {
                        formMessage = result.data.message as string;
                    }
                } else if (result.type === "redirect") {
                    formElement.reset();
                    await invalidateAll()
                }
            }
        }}
        class="flex flex-col gap-2">
            <label for="username" class="text-red-500">Usuario</label>
            <input type="text" id="user" name="username" autocomplete="off"
            class="p-2 border border-red-500 bg-transparent outline-none rounded" />
            <label for="password" class="text-red-500">Contraseña</label>
            <div class=" border border-red-500 flex flex-row rounded">
                <input bind:this={passwordInput} autocomplete="off" type={passwordIsVisible ? 'text' : 'password'} id="password" name="password" class="p-2 bg-transparent outline-none" />
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
            <button class="bg-red-500 hover:bg-red-400 text-stone-900 font-semibold p-2 rounded cursor-pointer">Iniciar Sesión</button>
        </form>
        {#if formMessage}
        <p transition:scale>
            {formMessage}
        </p>
        {/if}
    </div>
</div>