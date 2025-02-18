<script lang="ts">
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import Icon from "@iconify/svelte";
	import '../app.css';
	import NavItem from '$lib/components/NavItem.svelte';
	import { goto } from '$app/navigation';
	import type { LayoutData, LayoutProps } from './$types';
	let { data, children }: LayoutProps = $props();

	let actualRoute = $derived(page.route.id);

	function validityAnchor (endPoint: string) {
		if (data.user && actualRoute) {
			if (actualRoute.includes("/admin")) {
				return "/admin" + (endPoint === "/" ? "" : endPoint);
			}
		}
		return endPoint;
	}

	// $inspect(actualRoute);
</script>

<nav class="flex flex-col place-items-center gap-4 flex-grow">
	<section class="relative flex place-content-center">
		<h1 class="text-red-500 font-black text-4xl p-3">
			<a href="/">
				murci
			</a>
		</h1>
		<button class="text-5xl absolute -bottom-4 " onclick={() => goto('/admin')}>
			<Icon icon="mdi:bat" />
		</button>
	</section>
	{#if data.user}
	<section class="flex flex-row gap-4 px-2">
		<ul class="flex flex-row gap-10 text-red-500 font-semibold place-items-center">
			<li class="flex flex-row gap-2">
				<Icon icon="mdi:account" class="text-2xl" />
				<span class="text-red-400">	
					{data.user?.username}
				</span>
			</li>
			<li>
				<form method="post" action="/admin?/logout">
					<button class="hover:text-red-400 rounded-md p-1 cursor-pointer">
						<Icon icon="ci:log-out" class="text-3xl" />
					</button>
				</form>
			</li>
		</ul>
	</section>
	{/if}
	<section class="flex flex-row gap-4 px-2 py-1">
		<ul class="flex flex-row gap-2 text-red-500 font-semibold">
			<NavItem name="Catálogo" endPoint={validityAnchor("/catalogo")} {actualRoute} />
			<NavItem name="Tienda" endPoint={validityAnchor("/")} {actualRoute} />
			<NavItem name="Contacto" endPoint={validityAnchor("/contacto")} {actualRoute} />
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