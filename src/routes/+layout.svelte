<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import Icon from "@iconify/svelte";
	import '../app.css';
	import NavItem from '$lib/components/NavItem.svelte';
	import { goto } from '$app/navigation';
	let { children } = $props();

	let actualRoute = $derived(page.route.id);

	// $inspect(actualRoute);
</script>

<nav class="flex flex-col place-items-center gap-4 flex-grow">
	<section class="relative flex place-content-center">
		<h1 class="text-red-500 font-black text-4xl p-3">
			murci
		</h1>
		<button class="text-5xl absolute -bottom-4 " onclick={() => goto('/login')}>
			<Icon icon="mdi:bat" />
		</button>
	</section>
	<section class="flex flex-row gap-4 px-2 py-1">
		<ul class="flex flex-row gap-2 text-red-500 font-semibold">
			<NavItem name="Catálogo" endPoint="/catalogo" {actualRoute} />
			<NavItem name="Tienda" endPoint="/" {actualRoute} />
			<NavItem name="Contacto" endPoint="/contacto" {actualRoute} />
		</ul>
	</section>
</nav>


<div class="px-2 my-2 flex-grow max-w-full">
	{@render children()}
</div>

<style>
	:global(body) {
		/* @apply  bg-stone-900 scroll-smooth ; */
		/* bg-gradient-to-t from-stone-900 via-red-900 to-stone-900 */
		color: #f87171; /* Este es el valor hexadecimal para red-400 */
        background-color: #1c1917;
		max-width: 100dvw;
	}	
</style>