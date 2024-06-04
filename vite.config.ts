import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
		sourcemap: true,
	},
	plugins: [
		react(),
		VitePWA({
			strategies: 'injectManifest',
			registerType: 'autoUpdate',
			injectRegister: null,
			srcDir: 'src',
			filename: 'worker/index.ts',
			injectManifest: { minify: false, sourcemap: true },
			workbox: {
				// This increase the cache limit to 3mB
				maximumFileSizeToCacheInBytes: 2097152 * 1.5,
			},
			manifest: {
				name: 'Satellite Communities',
				short_name: 'Satellite',
				description: 'An interface for satellite communities',
				display: 'standalone',
				orientation: 'portrait-primary',
				theme_color: '#171819',
				categories: ['social'],
				icons: [
					{
						src: 'pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png',
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
				lang: 'en',
				start_url: '/',
				scope: '/',
			},
			devOptions: {
				enabled: true,
				type: 'module',
			},
		}),
	],
});
