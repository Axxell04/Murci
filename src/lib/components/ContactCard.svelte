<script lang="ts">
	import { page } from "$app/state";
	import type { Contact } from "$lib/interfaces/contact";


	import Icon from "@iconify/svelte";
	import { scale } from "svelte/transition";

    interface Props {
        contact: Contact
        toggleDeleteContactModalIsVisible?: (visible?: boolean) => void
        toggleEditContactModalIsVisible?: (visible?: boolean) => void
        selectThisContact?: (contact: Contact) => void
    }

    let { contact, toggleDeleteContactModalIsVisible, toggleEditContactModalIsVisible, selectThisContact }:Props = $props();

    let actualRoute = $state(page.route.id);

    let icon = $derived(`simple-icons:${contact.icon}`)

    if (typeof toggleDeleteContactModalIsVisible === 'undefined') {
        toggleDeleteContactModalIsVisible = () => {}
    }

    if (typeof toggleEditContactModalIsVisible === 'undefined') {
        toggleEditContactModalIsVisible = () => {}
    }

    if (typeof selectThisContact === 'undefined') {
        selectThisContact = (contact: Contact) => {}
    }

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 200)
        }
    }

</script>

<a href={contact.url} target="_blank" class="flex flex-row gap-2 place-items-center py-2 px-2 border rounded-xl w-fit" 
onclick={actualRoute?.includes('/admin') ? (e) => e.preventDefault() : () => {}}
>
    <Icon {icon} class="text-2xl"/>
    <span class="text-xl" style="font-family: Nunito;">
        {contact.text}
    </span>
    {#if actualRoute?.includes('/admin')}        
    <div transition:scale class="flex flex-row place-items-center gap-2 border-l pl-2 text-2xl bg-stone-900/90 backdrop-blur-xl">
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={()=>{selectThisContact(contact); toggleDeleteContactModalIsVisible(true)}}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="famicons:trash" />
        </button>
        <button class="cursor-pointer hover:text-red-500 focus:text-red-500" 
        onclick={()=>{selectThisContact(contact); toggleEditContactModalIsVisible(true)}}
        onfocus={(e) => cancelFocus(e)}
        >
            <Icon icon="mdi:edit-outline" />
        </button>
    </div>
    {/if}
</a>