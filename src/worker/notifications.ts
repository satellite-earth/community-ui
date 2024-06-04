/// <reference lib="ES2022" />
/// <reference lib="DOM" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;

import { type DirectMessageNotification } from '@satellite-earth/core/types/control-api/notifications.js';
import { getDMSender } from '@satellite-earth/core/helpers/nostr';
import { getUserDisplayName } from '@satellite-earth/core/helpers/nostr/profile.js';
import { finishRepostEvent } from 'nostr-tools/nip18';

self.addEventListener('push', (event) => {
	const data = event.data?.json() as DirectMessageNotification | undefined;

	try {
		if (data?.sender) {
			const content = JSON.parse(data.sender.content);
			const name = getUserDisplayName(content, data.event.pubkey);
			const message = `New direct message from ${name}`;

			event.waitUntil(
				self.registration.showNotification(message, { body: 'maybe contents?', data: getDMSender(data.event) }),
			);
		} else if (data?.event) {
			const message = `New direct message`;

			event.waitUntil(
				self.registration.showNotification(message, { body: 'maybe contents?', data: getDMSender(data.event) }),
			);
		}
	} catch (error) {}
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	const pubkey: string = event.notification.data;
	const url = `/messages/p/` + pubkey;

	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientList) => {
			const firstClient = clientList[0];
			if (firstClient) {
				firstClient.focus();
				firstClient.navigate(url);
			} else {
				self.clients.openWindow(url).then((window) => window?.focus());
			}
		}),
	);
});
