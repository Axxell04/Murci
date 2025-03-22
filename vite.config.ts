import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	ssr: {
		noExternal: ['fs'], // Excluir 'fs' del empaquetado para el cliente
	  },
	  optimizeDeps: {
		exclude: ['fs'], // Excluir 'fs' durante la optimización de dependencias
	  },
});
