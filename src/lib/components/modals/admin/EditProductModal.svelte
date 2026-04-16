<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductComplete, ProductPagination } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import type { ActionData } from "../../../../routes/admin/$types";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";
	import ImgsProductModal from "../ImgsProductModal.svelte";
	import ImgsEditProductModal from "./ImgsEditProductModal.svelte";
	import { onDestroy, onMount } from "svelte";
    import imageCompression from "browser-image-compression";

    interface Props {
        setProductPagination: (newProductPagination: ProductPagination) => void
        productSelected?: ProductComplete
        toggleEditProductModalIsVisible: (visible?: boolean) => void
        editProductModalIsVisible: boolean
    }

    let { setProductPagination, toggleEditProductModalIsVisible, editProductModalIsVisible, productSelected }: Props = $props();

    // Form
    let formMessage = $state('')
    let name = $state("");
    let price = $state("");
    let imgsList: File[] = $state([]);

    // onMount(() => {
    //     if (!productSelected) return;
    //     name = productSelected.product.name;
    //     price = productSelected.product.price.toString();
    // })

    $effect(() => {
        editProductModalIsVisible;
        if (productSelected) {
            name = productSelected.product.name
            price = productSelected.product.price.toString()
            imgsList = []
        }
    })

    $inspect(productSelected);

    let inputImgs: HTMLInputElement | undefined = $state();

    let listDelete: number[] = $state([]);

    let listDeleteToForm: string[] = $derived(!productSelected || !listDelete.length ? [] : [...productSelected?.imgs.filter((img) => {
        if (listDelete.includes(productSelected.imgs.indexOf(img))) {
            return true
        } else {
            return false
        }
    }).map((img) => img.id)
    ]);

    let imgsEditProductModalIsVisible = $state(false);
    function toggleImgsEditProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            imgsEditProductModalIsVisible = visible;
        } else {
            imgsEditProductModalIsVisible = !imgsEditProductModalIsVisible;
        }

    }

    function updateListDelete (newList: number[]) {
        listDelete = newList;
    }

    function clearList () {
        listDelete = [];
        imgsList= [];
    }

    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 200)
        }
    }

    function handleName (e: Event) {
        const target = e.target as HTMLInputElement;
        name = target.value;
    }

    function handlePrice (e: Event) {
        const target = e.target as HTMLInputElement;
        price = target.value;
    }

    async function compress (file: File) {
        const compressedFile = await imageCompression(file, {
            maxWidthOrHeight: 800,
            maxSizeMB: 0.5,
            useWebWorker: true
        });
        return compressedFile;
    }

    async function handleFile (e: Event) {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        if (!files || !files.length) return;
        imgsList = [];
        for (const file of files) {
            imgsList.push(await compress(file));
        }
    }

    async function sendUpdate () {
        const formDataPhase1 = new FormData();
        formDataPhase1.append("phase", "1");
        formDataPhase1.append("product_id", productSelected?.product.id as string);
        formDataPhase1.append("name", name as string);
        formDataPhase1.append("price", price as string);
        const resPhase1 = await fetch("/admin/api/product/update", {
            method: "POST",
            body: formDataPhase1
        });
        const jsonPhase1 = await resPhase1.json();
        if (!jsonPhase1.success) return;
        for (const img of imgsList) {
            const formDataPhase2 = new FormData();
            formDataPhase2.append("phase", "2");
            formDataPhase2.append("img", img);
            formDataPhase2.append("product_id", productSelected?.product.id as string);
            const resPhase2 = await fetch("/admin/api/product/update", {
                method: "POST",
                body: formDataPhase2
            });
            const jsonPhase2 = await resPhase2.json();
            if (!jsonPhase2.success) return;
        }
        const formDataPhase3 = new FormData();
        formDataPhase3.append("phase", "3");        
        formDataPhase3.append("product_id", productSelected?.product.id as string);
        formDataPhase3.append("list_delete", JSON.stringify(listDeleteToForm));
        const resPhase3 = await fetch("/admin/api/product/update", {
            method: "POST",
            body: formDataPhase3
        });
        const jsonPhase3 = await resPhase3.json();
        if (!jsonPhase3.success) return;
        setProductPagination(jsonPhase3.pagination as ProductPagination);
        if (inputImgs) inputImgs.value = "";
        toggleEditProductModalIsVisible(false);
        clearList();
    }

    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 5000)
        }
    })

    $effect(() => {
        if (!editProductModalIsVisible) {
            clearList();
        }
    })

</script>

{#if editProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleEditProductModalIsVisible} visible={editProductModalIsVisible} cancelClick={true}>
                <form id="edit-product" action="?/edit_product" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        console.log(result)
                        if (result.type === "failure") {
                            if (result.data?.message) {
                                formMessage = result.data.message as string;
                            }
                        } else if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.pagination) {
                                // console.log(result.data.products)
                                setProductPagination(result.data.pagination as ProductPagination);
                                toggleEditProductModalIsVisible(false);
                                clearList();
                            }
                            // await goto("/admin", {invalidateAll: true});
                        }
                    }
                }} 
                enctype="multipart/form-data" 
                class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-5 px-10 rounded-md max-w-full max-h-fit">
                    <div class="flex flex-col gap-2 place-items-center">
                        <input type="hidden" name="product_id" value={!productSelected ? "" : (productSelected.product.id)}>
                        <label for="name">Nombre</label>
                        <span class="text-red-300">
                            {#if productSelected}
                            <input type="text" name="name" id="name" required autocomplete="off"
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            value={productSelected.product.name}
                            oninput={handleName}
                            />                               
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="price">Precio</label>
                        <span class="text-red-300">
                            {#if productSelected}
                            <input type="number" name="price" id="price" required step="0.01"
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            value={productSelected.product.price}
                            oninput={handlePrice}
                            />                             
                            {/if}
                        </span>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="imgs">Imagenes</label>
                        <input type="file" aria-labelledby="imagenes" name="imgs" id="imgs" accept="image/*" multiple 
                        class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                        style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
                        onchange={handleFile}
                        bind:this={inputImgs}
                        />
                        <button type="button" class="border p-1 rounded-md cursor-pointer hover:text-red-500 focus:text-red-500" 
                        onclick={()=>toggleImgsEditProductModalIsVisible(true)}
                        onfocus={(e) => cancelFocus(e)}
                        >
                            Ver imagenes
                        </button>
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <input type="text" hidden name="list_delete" 
                        value={JSON.stringify(listDeleteToForm)}
                        >
                        <button type="button" class="border hover:text-red-500 focus:text-red-500 rounded-md p-2 cursor-pointer"
                        onfocus={(e) => {
                            sendUpdate();
                            cancelFocus(e);
                            }}
                        >
                            Editar
                        </button>
                    </div>
                    {#if formMessage}
                    <div transition:scale>
                        <p class="text-red-500 text-center">
                            {formMessage}
                        </p>
                    </div>
                    {/if}
                    <div role="button" tabindex="0" onkeydown={()=>{}}
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => {toggleEditProductModalIsVisible(false)}}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
        <ImgsEditProductModal {productSelected} {imgsEditProductModalIsVisible} {toggleImgsEditProductModalIsVisible} {listDelete} {updateListDelete} />
    </div>
{/if}
