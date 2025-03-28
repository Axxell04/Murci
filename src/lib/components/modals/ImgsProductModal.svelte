<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import type { ActionData } from "../../../routes/admin/$types";
	import ContainerModal from "./ContainerModal.svelte";
	import Icon from "@iconify/svelte";
	import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet
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

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 200)
        }
    }

    function preloadImgs () {
        productSelected?.imgs.forEach((productImg) => {
            const img = new Image();
            img.src = productImg.url;
        })
    }

    $effect(() => {
        if (productSelected) {
            preloadImgs();
        }
    })

</script>

{#if imgsProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleImgsProductModalIsVisible} visible={imgsProductModalIsVisible} cancelClick={true}>
            <div class="flex flex-col max-h-full gap-9 box-border relative">
                <div class="flex flex-col relative box-border grow" style="height: 80%;">
                    {#if !imgSalt}
                    <div in:scale class="flex flex-col  max-h-full relative place-items-center box-border">
                        <div class="relative max-h-full box-border">
                            <img class=" object-contain relative box-border max-h-[26rem]" src={productSelected?.imgs[imgIndex].url} alt={productSelected?.product.name}
                            draggable="false"
                            
                            >
                        </div>
                        <span class="absolute bottom-1 bg-stone-900/80 backdrop-blur-md rounded-full py-1 px-3">
                            {imgIndex + 1} / {productSelected?.imgs.length ?? imgIndex + 1}
                        </span>
                    </div>
                    {/if}
                </div>
                <div class="flex flex-row gap-5 grow rounded-full bg-stone-900 p-3 place-items-center">
                    {#if typeof children !== 'undefined'}
                    <div class="flex flex-row grow gap-2 place-items-center">
                        {@render children()}
                    </div>
                    {/if}
                    <div class="flex flex-row gap-3 text-3xl">
                        <button class="border rounded-full p-1 cursor-pointer {prevImgIsValid() ? 'hover:text-red-500 hover:border-red-500 focus:text-red-500 focus:bg-stone-800': 'opacity-50'}"
                        onclick={prevImg}
                        onfocus={(e) => cancelFocus(e)}
                        >
                            <Icon icon="mingcute:left-fill" />
                        </button>
                        <button class="border rounded-full p-1 cursor-pointer {nextImgIsValid() ? 'hover:text-red-500 hover:border-red-500 focus:text-red-500 focus:bg-stone-800': 'opacity-50'}"
                        onclick={nextImg}
                        onfocus={(e) => cancelFocus(e)}
                        >
                            <Icon icon="mingcute:right-fill" />
                        </button>
                    </div>
                    <div class="flex flex-row place-items-center ml-auto">
                        <button class="border rounded-full cursor-pointer p-1 hover:text-red-500 hover:border-red-500 focus:text-red-500 focus:bg-stone-800"
                        onclick={closeModal}
                        onfocus={(e) => cancelFocus(e)}
                        >
                            <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                        </button>
                    </div>
                </div>
            </div>
        </ContainerModal>
    </div>
{/if}
