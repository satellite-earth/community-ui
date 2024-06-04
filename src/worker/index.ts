//  / <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="DOM" />
/// <reference lib="webworker" />

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare var self: ServiceWorkerGlobalScope;

import { type DirectMessageNotification } from '@satellite-earth/core/types/control-api/notifications.js';

import './notifications';
import './caching';

self.skipWaiting();

self.onerror = (err) => {
	console.log(err);
};
