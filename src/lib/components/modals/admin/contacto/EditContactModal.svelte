<script lang="ts">
	import type { Contact } from "$lib/interfaces/contact";
	import { fade, scale } from "svelte/transition";
	import ContainerModal from "../../ContainerModal.svelte";
	import { enhance } from "$app/forms";
	import Icon from "@iconify/svelte";

    interface Props {
        contactSelected?: Contact
        editContactModalIsVisible: boolean
        toggleEditContactModalIsVisible: (visible?: boolean) => void
        setContacts: (newContacts: Contact[]) => void
    }

    let { setContacts, editContactModalIsVisible, toggleEditContactModalIsVisible, contactSelected }:Props = $props();

    let formMessage = $state('');




    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 300)
        }
    }

    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 4000)
        }
    })

</script>

{#if editContactModalIsVisible}
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleEditContactModalIsVisible} visible={editContactModalIsVisible} cancelClick={true}>
            <form action="?/edit_contact" method="post" use:enhance={() => {
                return async ({ result }) => {
                    if (result.type === "failure") {
                        if (result.data?.message) {
                            formMessage = result.data.message as string;
                        }
                    } else if (result.type === "success") {
                        if (result.data?.contacts) {
                            setContacts(result.data.contacts as Contact[]);
                            toggleEditContactModalIsVisible(false);
                        }
                    }
                }
            }}
            class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-3 px-4 rounded-md max-w-full max-h-fit"
            >
                <input type="hidden" name="id_contact" value={contactSelected?.id ?? ''}>
                <div class="flex flex-col gap-2 place-items-center">
                    <label for="icon">Icono</label>
                    <input type="text" name="icon" id="icon" required autocomplete="off" value={contactSelected?.icon ?? ''}
                    class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                    />
                </div>
                <div class="flex flex-col gap-2 place-items-center">
                    <label for="text">Texto</label>
                    <input type="text" name="text" id="text" required autocomplete="off" value={contactSelected?.text ?? ''}
                    class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                    />
                </div>
                <div class="flex flex-col gap-2 place-items-center">
                    <label for="url">URL</label>
                    <input type="text" name="url" id="url" required autocomplete="off" value={contactSelected?.url ?? ''}
                    class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                    />
                </div>
                <div class="flex flex-col gap-2 place-items-center">
                    <button type="submit" class="border hover:text-red-500 focus:text-red-500 rounded-md p-2 cursor-pointer" 
                    onfocus={(e) => cancelFocus(e)}
                    >
                        Editar
                    </button>
                </div>
                {#if formMessage}
                <div transition:scale>
                    <p class="text-red-400 text-center">
                        {formMessage}
                    </p>
                </div>
                {/if}
                <div role="button" tabindex="0" onkeydown={()=>{}}
                class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleEditContactModalIsVisible(false)}">
                    <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                </div>
            </form>
        </ContainerModal>
    </div>
{/if}