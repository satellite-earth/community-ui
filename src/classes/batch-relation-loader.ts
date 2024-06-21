import { NostrEvent } from 'nostr-tools';
import _throttle from 'lodash.throttle';
import debug, { Debugger } from 'debug';
import { AbstractRelay } from 'nostr-tools/abstract-relay';

import PersistentSubscription from './persistent-subscription';
import createDefer, { Deferred } from './deferred';
import SuperMap from './super-map';
import Subject from './subject';

/** Batches requests for events that reference another event (via #e tag) from a single relay */
export default class BatchRelationLoader {
	kinds: number[];
	relay: AbstractRelay;
	active = false;

	requested = new Set<string>();
	references = new SuperMap<string, Map<string, NostrEvent>>(() => new Map());

	onEventUpdate = new Subject<string>();

	subscription: PersistentSubscription;

	// a map of events that are waiting for the current request to finish
	private next = new Map<string, Deferred<Map<string, NostrEvent>>>();

	// a map of events currently being requested from the relay
	private pending = new Map<string, Deferred<Map<string, NostrEvent>>>();

	log: Debugger;

	constructor(relay: AbstractRelay, kinds: number[], log?: Debugger) {
		this.relay = relay;
		this.kinds = kinds;
		this.log = log || debug('BatchRelationLoader');

		this.subscription = new PersistentSubscription(this.relay, {
			onevent: (event) => this.handleEvent(event),
			oneose: () => this.handleEOSE(),
		});
	}

	requestEvents(uid: string): Promise<Map<string, NostrEvent>> {
		// if there is a cache only return it if we have requested this id before
		if (this.references.has(uid) && this.requested.has(uid)) {
			return Promise.resolve(this.references.get(uid));
		}

		if (this.pending.has(uid)) return this.pending.get(uid)!;
		if (this.next.has(uid)) return this.next.get(uid)!;

		const defer = createDefer<Map<string, NostrEvent>>();
		this.next.set(uid, defer);

		// request subscription update
		this.requestUpdate();

		return defer;
	}

	requestUpdate = _throttle(
		() => {
			// don't do anything if the subscription is already running
			if (this.active) return;

			this.active = true;
			this.update();
		},
		500,
		{ leading: false, trailing: true },
	);

	handleEvent(event: NostrEvent) {
		// add event to cache
		const updateIds = new Set<string>();
		for (const tag of event.tags) {
			if (tag[0] === 'e' && tag[1]) {
				const id = tag[1];
				this.references.get(id).set(event.id, event);
				updateIds.add(id);
			} else if (tag[0] === 'a' && tag[1]) {
				const cord = tag[1];
				this.references.get(cord).set(event.id, event);
				updateIds.add(cord);
			}
		}

		for (const id of updateIds) this.onEventUpdate.next(id);
	}
	handleEOSE() {
		// resolve all pending from the last request
		for (const [uid, defer] of this.pending) {
			defer.resolve(this.references.get(uid));
		}

		// reset
		this.pending.clear();
		this.active = false;

		// do next request or close the subscription
		if (this.next.size > 0) this.requestUpdate();
	}

	update() {
		// copy everything from next to pending
		for (const [uid, defer] of this.next) this.pending.set(uid, defer);
		this.next.clear();

		// update subscription
		if (this.pending.size > 0) {
			this.log(`Updating filters ${this.pending.size} events`);

			const ids: string[] = [];
			const cords: string[] = [];
			const uids = Array.from(this.pending.keys());
			for (const uid of uids) {
				this.requested.add(uid);

				if (uid.includes(':')) cords.push(uid);
				else ids.push(uid);
			}

			this.subscription.filters = [];
			if (ids.length > 0) this.subscription.filters.push({ '#e': ids, kinds: this.kinds });
			if (ids.length > 0) this.subscription.filters.push({ '#a': cords, kinds: this.kinds });

			this.subscription.update();
			this.active = true;
		} else {
			this.log('Closing');
			this.subscription.close();
			this.active = false;
		}
	}

	destroy() {
		this.subscription.destroy();
	}
}
