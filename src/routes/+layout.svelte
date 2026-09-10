<script lang="ts">
	import { page } from '$app/state';
	// import { onMount, type Snippet } from 'svelte';
	import Icon from '@iconify/svelte';
	import '../app.css';
	import NavItem from '$lib/components/NavItem.svelte';
	import { goto } from '$app/navigation';
	import type { LayoutProps } from './$types';
	import { scale } from 'svelte/transition';
	let { data, children }: LayoutProps = $props();

	let actualRoute = $derived(page.route.id);

	let btnCardSelectNav: HTMLButtonElement | undefined = $state();
	let btnCardSelectNavHeight = $state(41);

	let cardSelectNavMenuIsVisible = $state(false);

	function toggleCardSelectNavMenuIsVisible(visible?: boolean) {
		if (typeof visible === 'undefined') {
			cardSelectNavMenuIsVisible = !cardSelectNavMenuIsVisible;
		} else {
			cardSelectNavMenuIsVisible = visible;
		}
	}

	function validityAnchor(endPoint: string) {
		if (data.user && actualRoute) {
			if (actualRoute.includes('/admin')) {
				return '/admin' + (endPoint === '/' ? '' : endPoint);
			}
		}
		return endPoint;
	}

	function cancelFocus(e: FocusEvent) {
		const target = e.target as HTMLButtonElement;
		if (target) {
			setTimeout(() => {
				target.blur();
			}, 200);
		}
	}

	$effect(() => {
		// btnCardSelectNav;
		if (typeof btnCardSelectNav !== 'undefined') {
			btnCardSelectNavHeight = btnCardSelectNav.offsetHeight;
			console.log(btnCardSelectNavHeight);
		}
	});

	// $inspect(actualRoute);
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="shortcut icon" href="/favicon.ico" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<meta name="apple-mobile-web-app-title" content="NockStars" />
	<link rel="manifest" href="/site.webmanifest" />

	<title>NockStars</title>
</svelte:head>

<nav class="flex flex-grow flex-col place-items-center gap-6">
	<section class="relative flex place-content-center">
		<h1 class="p-3 text-4xl font-black text-red-500">
			<a class="hover:text-red-400 focus:text-red-400" href="/" onfocus={(e) => cancelFocus(e)}>
				nockstars
			</a>
		</h1>
		<button
			class="absolute -bottom-7 transition-transform duration-200 hover:text-red-500 focus:text-red-500 active:scale-90"
			onclick={() => goto('/admin')}
			onfocus={(e) => cancelFocus(e)}
		>
			<img src="/nock-logo.png" alt="logo" class="h-14" />
		</button>
	</section>
	{#if data.user}
		<section class="flex flex-row gap-4 px-2">
			<ul class="relative flex flex-row place-items-center gap-6 font-semibold text-red-500">
				<li class="flex flex-row gap-2">
					<Icon icon="mdi:account" class="text-2xl" />
					<span class="text-red-400">
						{data.user?.username}
					</span>
				</li>
				{#if data.user.admin}
					<li class="flex flex-row gap-2">
						<a
						href="/admin/cuentas"
						class="px-1 transition-transform duration-200 mousedown:scale-90 hover:text-red-400 focus:text-red-400"
							onfocus={(e) => cancelFocus(e)}
						>
							<Icon icon="mdi:badge-account" class="text-3xl" />
						</a>
					</li>
					<li class="flex flex-row gap-2">
						<a
						href="/admin/backup"
						class="px-1 transition-transform duration-200 mousedown:scale-90 hover:text-red-400 focus:text-red-400"
							onfocus={(e) => cancelFocus(e)}
						>
							<Icon icon="material-symbols:backup-outline-rounded" class="text-4xl" />
						</a>
					</li>
				{/if}
				<li class="relative flex h-full flex-row gap-2">
					<button
						bind:this={btnCardSelectNav}
						class="h-full w-full px-1 transition-transform duration-200 active:scale-90 hover:text-red-400 focus:text-red-400"
						style="height: 41px;"
						onclick={() => toggleCardSelectNavMenuIsVisible()}
						onfocus={(e) => cancelFocus(e)}
					>
						<Icon icon="bxs:credit-card" class="text-3xl" />
					</button>
					{#if cardSelectNavMenuIsVisible}
						<div
							transition:scale
							class="absolute z-30 flex flex-col place-self-center rounded-b-md border bg-stone-900/95"
							style="top: {btnCardSelectNavHeight}px;"
						>
							<a
								href="/admin/balance"
								class="w-full px-2 py-1 hover:bg-stone-800 focus:bg-stone-800"
								onclick={() => {
									toggleCardSelectNavMenuIsVisible(false);
								}}
								onfocus={(e) => cancelFocus(e)}
							>
								Balance
							</a>
							<a
								href="/admin/pedidos"
								class="w-full rounded-b-md px-2 py-1 hover:bg-stone-800 focus:bg-stone-800"
								onclick={() => {
									toggleCardSelectNavMenuIsVisible(false);
								}}
								onfocus={(e) => cancelFocus(e)}
							>
								Pedidos
							</a>
						</div>
					{/if}
				</li>
				<li>
					<form method="post" action="/admin?/logout">
						<button class="cursor-pointer rounded-md p-1 transition-transform duration-200 active:scale-90 hover:text-red-400">
							<Icon icon="ci:log-out" class="text-3xl" />
						</button>
					</form>
				</li>
			</ul>
		</section>
	{/if}
	<section class="flex flex-row gap-4 px-2 py-1">
		<ul class="flex flex-row gap-2 font-semibold text-red-500">
			<NavItem name="Catálogo" endPoint={validityAnchor('/catalogo')} {actualRoute} />
			<NavItem name="Tienda" endPoint={validityAnchor('/')} {actualRoute} />
			<NavItem name="Contacto" endPoint={validityAnchor('/contacto')} {actualRoute} />
		</ul>
	</section>
</nav>

<div class="my-2 max-w-full flex-grow px-2">
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
