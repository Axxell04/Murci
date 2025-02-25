<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import type { ActionData } from "../../../routes/admin/$types";
	import ContainerModal from "./ContainerModal.svelte";
	import Icon from "@iconify/svelte";
	import type { Snippet } from "svelte";

    interface Props {
        children: Snippet
        productSelected?: ProductComplete
        toggleImgsProductModalIsVisible: (visible?: boolean) => void
        imgsProductModalIsVisible: boolean

        setImgIndex?: (newIndex: number) => void
    }

    let { toggleImgsProductModalIsVisible, imgsProductModalIsVisible, productSelected, children, setImgIndex }: Props = $props();

    let imgIndex = $state(0);
    let imgSalt = $state(false);

    $effect(() => {
        if (typeof setImgIndex !== 'undefined') {
            setImgIndex(imgIndex);
        }
    })

    function nextImg () {
        if (nextImgIsValid()) {
            imgSalt = true;
            setTimeout(() => {
                imgSalt = false;
                imgIndex = imgIndex + 1;
            }, 50);
        }
    }

    function prevImg () {
        if (prevImgIsValid()) {
            imgSalt = true;
            setTimeout(() => {
                imgSalt = false;
                imgIndex = imgIndex - 1;
            }, 50);
        }
    }

    function nextImgIsValid () {
        if (!productSelected) { return false };
        if (imgIndex < productSelected.imgs.length - 1) {
            return true
        }
        return false
    
    }
    function prevImgIsValid () {
        if (!productSelected) { return false };
        if (imgIndex > 0) {
            return true
        }
        return false
    }

    function closeModal () {
        imgIndex = 0;
        if (typeof setImgIndex !== 'undefined') {
            setImgIndex(0);
        }
        toggleImgsProductModalIsVisible(false);
    }

</script>

{#if imgsProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleImgsProductModalIsVisible} cancelClick={true}>
            {#if !imgSalt}
            <div in:scale class="flex flex-col relative place-items-center">
                <img src={productSelected?.imgs[imgIndex].url} alt={productSelected?.product.name} loading="lazy">
                <span class="absolute bottom-1 bg-stone-900/80 backdrop-blur-md rounded-full py-1 px-3">
                    {imgIndex + 1} / {productSelected?.imgs.length ?? imgIndex + 1}
                </span>
            </div>
            {/if}
            <div class="flex flex-row gap-5 rounded-full bg-stone-900 mt-3 p-3 place-items-center">
                <div class="flex flex-row grow gap-2 place-items-center">
                    {@render children()}
                </div>
                <div class="flex flex-row gap-3 text-3xl">
                    <button class="border rounded-full p-1 cursor-pointer {prevImgIsValid() ? 'hover:text-red-500 hover:border-red-500': 'opacity-50'}"
                    onclick={prevImg}
                    >
                        <Icon icon="mingcute:left-fill" />
                    </button>
                    <button class="border rounded-full p-1 cursor-pointer {nextImgIsValid() ? 'hover:text-red-500 hover:border-red-500': 'opacity-50'}"
                    onclick={nextImg}
                    >
                        <Icon icon="mingcute:right-fill" />
                    </button>
                </div>
                <div class="flex flex-row place-items-center ml-auto">
                    <button class="border rounded-full cursor-pointer p-1 hover:text-red-500 hover:border-red-500"
                    onclick={closeModal}
                    >
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </button>
                </div>
            </div>
        </ContainerModal>
    </div>
{/if}
