<script lang="ts">
	import type { ProductComplete } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";
	import ImgsProductModal from "../ImgsProductModal.svelte";

    interface Props {
        productSelected?: ProductComplete
        toggleImgsEditProductModalIsVisible: (visible?: boolean) => void
        imgsEditProductModalIsVisible: boolean
        listDelete: number[]
        updateListDelete: (newList: number[]) => void
    }

    let { toggleImgsEditProductModalIsVisible, imgsEditProductModalIsVisible, productSelected, updateListDelete, listDelete }: Props = $props();

    let imgIndex = $state(0);

    function setImgIndex (newIndex: number) {
        imgIndex = newIndex;
    }

    function toggleDelete () {
        if (inListDelete()) {
            updateListDelete(listDelete.filter((index) => index !== imgIndex));
        } else {
            updateListDelete([...listDelete, imgIndex])
        }
    }

    const inListDelete = () => listDelete.includes(imgIndex);

</script>

{#if imgsEditProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ImgsProductModal {productSelected} 
        imgsProductModalIsVisible={imgsEditProductModalIsVisible} 
        toggleImgsProductModalIsVisible={toggleImgsEditProductModalIsVisible}
        {setImgIndex}
        >
            <button class="text-3xl p-1 border rounded-full cursor-pointer {inListDelete() ? 'border-red-500 text-red-500 hover:border-red-400 hover:text-red-400' : 'hover:border-red-500 hover:text-red-500'}" 
            onclick={toggleDelete}
            >
                <Icon icon="famicons:trash" />
            </button>
            {#if listDelete.length > 0}
            <div transition:scale class="flex flex-row gap-2" >
                <button class="cursor-pointer hover:text-red-500" onclick={()=>updateListDelete([])}>
                    <span>
                        {listDelete.length} Descartar
                    </span>
                </button>
            </div>
            {/if}
        </ImgsProductModal>
    </div>
{/if}
