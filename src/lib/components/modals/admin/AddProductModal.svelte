<script lang="ts">

	import { enhance } from "$app/forms";
	import type { ProductPagination } from "$lib/interfaces/product";
	import { fade, scale } from "svelte/transition";
	import ContainerModal from "../ContainerModal.svelte";
	import Icon from "@iconify/svelte";
    import pica from "pica";
    import imageComression from "browser-image-compression";

    interface Props {
        setProductPagination: (newProductPagination: ProductPagination) => void
        toggleAddProductModalIsVisible: (visible?: boolean) => void
        addProductModalIsVisible: boolean
    }

    let { setProductPagination, toggleAddProductModalIsVisible, addProductModalIsVisible }: Props = $props();

    let formMessage = $state('');
    let name = $state("");
    let price = $state("");
    let imgsList: File[] = $state([]);

    let inputImgs: HTMLInputElement | undefined;


    function cancelFocus (e: FocusEvent) {
        const target = e.target as HTMLButtonElement;
        if (target) {
            setTimeout(() => {
                target.blur();
            }, 300)
        }
    }

    async function compress (file: File) {
        const compressedFile = await imageComression(file, { 
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

    async function sendProduct () {
        if (!name || !price || !imgsList.length) return;
        const formDataPhase1 = new FormData();
        formDataPhase1.append("phase", "1");
        formDataPhase1.append("name", name);
        formDataPhase1.append("price", price);
        const resPhase1 = await fetch("/admin/api/product/upload", {
            method: "POST",
            body: formDataPhase1
        })
        const jsonPhase1 = await resPhase1.json();
        if (!jsonPhase1.success) return;
        const productId = jsonPhase1.productId as string;
        for (const img of imgsList) {
            const formDataPhase2 = new FormData()
            formDataPhase2.append("phase", "2");
            formDataPhase2.append("img", img);
            formDataPhase2.append("index", imgsList.indexOf(img).toString());
            formDataPhase2.append("product-id", productId);
            const resPhase2 = await fetch("/admin/api/product/upload", {
                method: "POST",
                body: formDataPhase2
            })
            const jsonPhase2 = await resPhase2.json();
            if (!jsonPhase2.success) return;
        }
        const formDataPhase3 = new FormData();
        formDataPhase3.append("phase", "3");
        const resPhase3 = await fetch("/admin/api/product/upload", {
            method: "POST",
            body: formDataPhase3
        });
        const jsonPhase3 = await resPhase3.json();
        if (!jsonPhase3.success) return;
        clearForm();
        setProductPagination(jsonPhase3.pagination as ProductPagination);
        toggleAddProductModalIsVisible(false);
    }

    function clearForm () {
        name = "";
        price = "";
        if (inputImgs) inputImgs.value = "";
    }

    // async function resizeImage (file: File, width = 800 ) {
    //     const img = document.createElement("img");
    //     img.src = URL.createObjectURL(file);
    //     await img.decode();

    //     const canvas = document.createElement("canvas");
    //     const ratio = width / img.width;
    //     canvas.width = width;
    //     canvas.height = img.height * ratio;

    //     await pica().resize(img, canvas);
    //     const blob = await pica().toBlob(canvas, "image/webp", 0.8 );
    // }

    $effect(() => {
        if (formMessage) {
            setTimeout(() => {
                formMessage = '';
            }, 5000)
        }
    })

</script>

{#if addProductModalIsVisible }
    <div transition:fade={{duration: 200}}>
        <ContainerModal toggleModal={toggleAddProductModalIsVisible} visible={addProductModalIsVisible} cancelClick={true}>
                <form id="add-product" action="?/add_product" method="post" use:enhance={({formElement, formData, action, cancel}) => {
                    return async ({ result }) => {
                        if (result.type === "failure") {
                            if (result.data?.message) {
                                formMessage = result.data.message as string;
                            }
                        }
                        if (result.type === "success") {
                            formElement.reset();
                            if (result.data?.pagination) {
                                console.log(result.data.pagination)
                                setProductPagination(result.data.pagination as ProductPagination);
                                toggleAddProductModalIsVisible(false);
                            }
                            // await goto("/admin", {invalidateAll: true});
                        }
                    }
                }} 
                enctype="multipart/form-data" 
                class="relative flex flex-col gap-2 bg-stone-900 border border-red-400 py-3 px-4 rounded-md max-w-full max-h-fit">
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="name">Nombre</label>
                        <input type="text" name="name" id="name" required autocomplete="off"
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            bind:value={name}
                        />
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="price">Precio</label>
                        <input type="number" name="price" id="price" required step="0.01"
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            bind:value={price}
                        />
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <label for="imgs">Imagenes</label>
                        <input type="file" aria-labelledby="imagenes" name="imgs" id="imgs" accept="image/*" multiple required
                            class="border border-red-400 rounded-md px-1 outline-none max-w-full" 
                            style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
                            onchange={handleFile}
                            bind:this={inputImgs}
                        />
                    </div>
                    <div class="flex flex-col gap-2 place-items-center">
                        <button type="button" class="border hover:text-red-500 focus:text-red-500 rounded-md p-2 cursor-pointer" 
                        onfocus={(e) => {
                            sendProduct();
                            cancelFocus(e);
                            }}
                        >
                            Agregar
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
                    class="absolute top-2 right-2 hover:text-red-500 cursor-pointer" onclick="{() => toggleAddProductModalIsVisible(false)}">
                        <Icon icon="material-symbols:close-rounded" class="text-3xl" />
                    </div>
                </form>
        </ContainerModal>
    </div>
{/if}
