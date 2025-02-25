<script lang="ts">
    import { enhance } from "$app/forms";
	import { fade } from "svelte/transition";
	import type { PageProps } from "./$types";
	import ProductCard from "$lib/components/ProductCard.svelte";
	import { goto, invalidate, invalidateAll } from "$app/navigation";
	import type { ProductComplete } from "$lib/interfaces/product";
	import Icon from "@iconify/svelte";
	import AddProductModal from "$lib/components/modals/admin/AddProductModal.svelte";
	import DeleteProductModal from "$lib/components/modals/admin/DeleteProductModal.svelte";
	import EditProductModal from "$lib/components/modals/admin/EditProductModal.svelte";

    let { data, form }: PageProps = $props();

    //console.log(data.products);

    let formAct = $derived(form);
    let messages = $derived(form?.message);

    // $inspect(formAct);
    // $inspect(messages);

    let products: ProductComplete[] = $state(data.products); 

    // Visible Elements
    let addProductModalIsVisible = $state(false);
    let deleteProductModalIsVisible = $state(false);
    let editProductModalIsVisible = $state(false);

    // Selected Product
    let productSelected: ProductComplete | undefined = $state()

    function selectThisProduct (product: ProductComplete) {
        productSelected = product;
    }

    function setProducts (newProducts: ProductComplete[]) {
        products = newProducts;
    }

    // Toggle Visible Elements
    function toggleAddProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            addProductModalIsVisible = visible;
        } else {
            addProductModalIsVisible = !addProductModalIsVisible;
        }
    }
    function toggleDeleteProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            deleteProductModalIsVisible = visible;
        } else {
            deleteProductModalIsVisible = !deleteProductModalIsVisible;
        }
    }
    function toggleEditProductModalIsVisible (visible?: boolean) {
        if (typeof visible !== "undefined") {
            editProductModalIsVisible = visible;
        } else {
            editProductModalIsVisible = !editProductModalIsVisible;
        }
    }

</script>

<div in:fade class="flex flex-col gap-2 px-5 py-5">
    <section class="flex flex-col gap-3 ">
        <div class="sticky top-0 z-10 bg-stone-900/95 backdrop-blur-md place-content-around flex flex-row p-3 gap-2 place-items-center">
            <button class="flex flex-row gap-1 border rounded-md p-1 hover:text-red-500 cursor-pointer place-items-center"
            onclick={() => toggleAddProductModalIsVisible(true)}
            >
                <Icon icon="material-symbols:add-rounded" class="text-3xl" />
                <span style="font-family: Nunito;">
                    Añadir Producto
                </span>
            </button>
            
            <div class="flex flex-row gap-2 place-items-center">
                <button class="hover:text-red-500">
                    <Icon icon="icon-park-outline:left-c" class="text-3xl" />
                </button>
                <input type="text" class="w-10 text-center text-3xl bg-transparent outline-none" value="1" />
                <button class="hover:text-red-500">
                    <Icon icon="icon-park-outline:right-c" class="text-3xl" />
                </button>
            </div>

        </div>

        <div class="flex flex-wrap grow justify-center p-2 gap-3">
            {#each products as product}
                <ProductCard {product} {productSelected} {selectThisProduct} {toggleDeleteProductModalIsVisible} {toggleEditProductModalIsVisible} />
            {/each}
        </div>
    </section>
    <AddProductModal form={formAct} {setProducts} {toggleAddProductModalIsVisible} {addProductModalIsVisible} />
    <DeleteProductModal form={formAct} {setProducts} {toggleDeleteProductModalIsVisible} {deleteProductModalIsVisible} {productSelected} />
    <EditProductModal form={formAct} {setProducts} {toggleEditProductModalIsVisible} {editProductModalIsVisible} {productSelected} />
</div>