import { registerSW } from 'virtual:pwa-register';
import { logger } from '../helpers/debug';

const log = logger.extend('ServiceWorker');

let registration: ServiceWorkerRegistration | null = null;
registerSW({
	immediate: true,
	onRegisteredSW: (s, r) => {
		if (r) registration = r;

		if (import.meta.env.DEV) {
			// @ts-expect-error
			window.serviceWorker = r;
		}
	},
	onOfflineReady() {
		log('Offline ready');
	},
	onRegisterError(error) {
		log('Failed to register service worker');
		log(error);
	},
});
