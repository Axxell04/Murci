<script lang="ts">
	import Icon from "@iconify/svelte";
    import { enhance } from "$app/forms";

	import { fade, scale } from "svelte/transition";
	import type { PageProps } from "./$types";
	import { goto, invalidateAll } from "$app/navigation";

    let { form }: PageProps = $props();

    let formMessage = $state('');

    let viewState = $state('login')

    // HTML Elements
    let passwordInput: HTMLInputElement | undefined = $state();
    let confirmPasswordInput: HTMLInputElement | undefined = $state();

    // Visible elements
    let passwordIsVisible = $state(false);
    let confirmPasswordIsVisible = $state(false);

    // Toggle Visible Elements
    function togglePasswordVisibility (e: Event) {
        passwordIsVisible = !passwordIsVisible;
        if (passwordInput) {
            e.preventDefault();
            passwordInput.focus();
        }
    }
    function toggleConfirmPasswordVisibility (e: Event) {
        confirmPasswordIsVisible = !confirmPasswordIsVisible;
        if (confirmPasswordInput) {
            e.preventDefault();
            confirmPasswordInput.focus();
        }
    }
    

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 200)
        }
    }

    // Effects
    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = ""
            }, 6000);
            window.scrollTo({top: 10000000})
        }
    })


</script>

<div in:fade>
    <div class="flex flex-col gap-4 place-items-center p-4">
        {#if viewState === 'login'}
        <h2 in:fade class="text-3xl font-bold text-red-500">
            Login
        </h2>
        <form in:fade method="post" action="?/login" use:enhance={({formElement}) => {
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
            <input type="text" id="user" name="username" autocomplete="off" required
            class="p-2 border border-red-500 bg-transparent outline-none rounded" />
            <label for="password" class="text-red-500">Contraseña</label>
            <div class=" border border-red-500 flex flex-row rounded">
                <input bind:this={passwordInput} autocomplete="off" type={passwordIsVisible ? 'text' : 'password'} id="password" name="password" required class="p-2 bg-transparent outline-none" />
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
            <button class="bg-red-500 hover:bg-red-400 focus:bg-red-400 text-stone-900 font-semibold p-2 rounded cursor-pointer"
            onfocus={(e) => cancelFocus(e)}
            >
                Iniciar Sesión
            </button>
        </form>
        {:else}   
        <h2 in:fade class="text-3xl font-bold text-red-500">
            Register
        </h2>
        <form in:fade method="post" action="?/register" use:enhance={({formElement}) => {
            return async ({ result }) => {
                if (result.type === "failure") {
                    if (result.data?.message) {
                        formMessage = result.data.message as string;
                    }
                } else if (result.type === "success") {
                    formElement.reset();
                    await invalidateAll()
                    viewState = 'login';
                    formMessage = 'Registro exitoso';
                }
            }
        }}
        class="flex flex-col gap-2"
        >
            <label for="username" class="text-red-500">Usuario</label>
            <input type="text" id="user" name="username" autocomplete="off" required
            class="p-2 border border-red-500 bg-transparent outline-none rounded" minlength="3" maxlength="31"/>
            <label for="password" class="text-red-500">Contraseña</label>
            <div class=" border border-red-500 flex flex-row rounded">
                <input bind:this={passwordInput} autocomplete="off" type={passwordIsVisible ? 'text' : 'password'} id="password" name="password" required class="p-2 bg-transparent outline-none" 
                minlength="6" maxlength="255"
                />
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
            <label for="confirm_password" class="text-red-500">Confirmar contraseña</label>
            <div class=" border border-red-500 flex flex-row rounded">
                <input bind:this={confirmPasswordInput} autocomplete="off" type={confirmPasswordIsVisible ? 'text' : 'password'} id="confirm_password" name="confirm_password" required class="p-2 bg-transparent outline-none" 
                minlength="6" maxlength="255"
                />
                <button type="button" class="text-3xl px-2 w-[46px]" onclick={(e)=>toggleConfirmPasswordVisibility(e)}>
                    {#if confirmPasswordIsVisible}
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
            <label for="user_token" class="text-red-500">Token de usuario</label>
            <input type="text" id="user_token" name="user_token" autocomplete="off"
            class="p-2 border border-red-500 bg-transparent outline-none rounded" required/>
            <button class="bg-red-500 hover:bg-red-400 focus:bg-red-400 text-stone-900 font-semibold p-2 rounded cursor-pointer"
            onfocus={(e) => cancelFocus(e)}
            >
                Registrarse
            </button>
        </form>
        {/if}
        <div class="w-full flex flex-col place-items-center">
        {#if viewState === 'login'}
        <button in:fade class="hover:text-red-500 focus:text-red-500" 
        onfocus={(e) => cancelFocus(e)}
        onclick={() => viewState = "register"}
            >
                Registrarse
        </button>
        {:else}
        <button in:fade class="hover:text-red-500 focus:text-red-500" 
        onfocus={(e) => cancelFocus(e)}
        onclick={() => viewState = "login"}
        >
           Iniciar sesión
        </button>
        {/if}
        </div>
        {#if formMessage}
        <p transition:scale>
            {formMessage}
        </p>
        {/if}
    </div>
</div>