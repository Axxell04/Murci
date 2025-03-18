<script lang="ts">
	interface Props {
		name: string;
		endPoint: string;
        actualRoute: string | null
	}

	let { name, endPoint, actualRoute }: Props = $props();

	function isSelected () {
		if (actualRoute && endPoint) {
			return actualRoute === endPoint || endPoint.replace('/admin', '') === actualRoute || endPoint.replace('admin', '') === actualRoute;
		} else {
			return false;
		}

	}

</script>

<li class="{isSelected() ? 'border-b-red-400' : ''} border border-transparent hover:border-b-red-500">
	<a href={endPoint} class="px-2 py-1 w-full focus:text-red-400"> 
        {name} 
    </a>
</li>
