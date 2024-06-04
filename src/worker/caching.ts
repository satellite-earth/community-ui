//  / <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="DOM" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;

import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

if (!import.meta.env.DEV) {
	if (self.__WB_MANIFEST) precacheAndRoute(self.__WB_MANIFEST);
	cleanupOutdatedCaches();

	let allowlist: undefined | RegExp[] = undefined;
	if (import.meta.env.DEV) allowlist = [/^\/$/];
	registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { allowlist }));
}
