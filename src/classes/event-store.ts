import { nanoid } from 'nanoid';
import { NostrEvent } from 'nostr-tools';

import ControlledObservable from './controlled-observable';
import SuperMap from './super-map';
import { sortByDate } from '../helpers/nostr/event';
import { getEventUID } from 'nostr-idb';

export type EventFilter = (event: NostrEvent, store: EventStore) => boolean;

/** a class used to store and sort events */
export default class EventStore {
	id = nanoid(8);
	name?: string;
	events = new Map<string, NostrEvent>();

	customSort?: typeof sortByDate;

	constructor(name?: string, customSort?: typeof sortByDate) {
		this.name = name;
		this.customSort = customSort;
	}

	getSortedEvents() {
		return Array.from(this.events.values()).sort(this.customSort || sortByDate);
	}

	onEvent = new ControlledObservable<NostrEvent>();
	onDelete = new ControlledObservable<string>();
	onClear = new ControlledObservable();

	private handleEvent(event: NostrEvent) {
		const uid = getEventUID(event);
		const existing = this.events.get(uid);
		if (!existing || event.created_at > existing.created_at) {
			this.events.set(uid, event);
			this.onEvent.next(event);
		}
	}

	addEvent(event: NostrEvent) {
		this.handleEvent(event);
	}
	getEvent(id: string) {
		return this.events.get(id);
	}
	deleteEvent(id: string) {
		if (this.events.has(id)) {
			this.events.delete(id);
			this.onDelete.next(id);
		}
	}

	clear() {
		this.events.clear();
		this.onClear.next(undefined);
	}

	private storeSubs = new SuperMap<EventStore, ZenObservable.Subscription[]>(() => []);
	connect(other: EventStore, fullSync = true) {
		const subs = this.storeSubs.get(other);
		subs.push(
			other.onEvent.subscribe((e) => {
				if (fullSync || this.events.has(getEventUID(e))) this.addEvent(e);
			}),
		);
		subs.push(other.onDelete.subscribe(this.deleteEvent.bind(this)));
	}
	disconnect(other: EventStore) {
		const subs = this.storeSubs.get(other);
		for (const sub of subs) sub.unsubscribe();
		this.storeSubs.delete(other);
	}

	cleanup() {
		this.clear();
		for (const [_, subs] of this.storeSubs) {
			for (const sub of subs) sub.unsubscribe();
		}
		this.storeSubs.clear();
	}

	getFirstEvent(nth = 0, filter?: EventFilter) {
		const events = this.getSortedEvents();

		let i = 0;
		while (true) {
			const event = events.shift();
			if (!event) return;
			if (filter && !filter(event, this)) continue;
			if (i === nth) return event;
			i++;
		}
	}
	getLastEvent(nth = 0, filter?: EventFilter) {
		const events = this.getSortedEvents();

		let i = 0;
		while (true) {
			const event = events.pop();
			if (!event) return;
			if (filter && !filter(event, this)) continue;
			if (i === nth) return event;
			i++;
		}
	}
}
