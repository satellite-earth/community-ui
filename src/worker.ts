//  / <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="DOM" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;

import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[] = undefined;
if (import.meta.env.DEV) allowlist = [/^\/$/];
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { allowlist }));

self.addEventListener('push', (event) => {
	console.log(event);
	console.log(event.data);
	event.waitUntil(
		// Show a notification with title 'ServiceWorker Cookbook' and body 'Alea iacta est'.
		self.registration.showNotification('ServiceWorker Cookbook', {
			body: 'Alea iacta est',
		}),
	);
});

self.addEventListener('pushsubscriptionchange', (event) => {
	console.log(event);
});
