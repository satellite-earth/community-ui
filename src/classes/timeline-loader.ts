import dayjs from 'dayjs';
import { Debugger } from 'debug';
import { Filter, NostrEvent, matchFilters } from 'nostr-tools';
import _throttle from 'lodash.throttle';

import { PersistentSubject } from './subject';
import { logger } from '../helpers/debug';
import EventStore from './event-store';
import { isReplaceable } from '../helpers/nostr/event';
import replaceableEventsService from '../services/replaceable-events';
import ChunkedRequest from './chunked-request';
import NostrSubscription from './nostr-subscription';
import relayPoolService from '../services/relay-pool';
import Relay from './relay';

export type EventFilter = (event: NostrEvent, store: EventStore) => boolean;

export default class TimelineLoader {
	cursor = dayjs().unix();
	relay: Relay | null = null;
	filters: Filter[] = [];

	running = false;
	events: EventStore;
	timeline = new PersistentSubject<NostrEvent[]>([]);
	loading = new PersistentSubject(false);
	complete = new PersistentSubject(false);

	loadNextBlockBuffer = 2;
	eventFilter?: EventFilter;

	name: string;
	log: Debugger;
	subscription: NostrSubscription | null = null;
	chunkLoader: ChunkedRequest | null = null;

	constructor(name: string) {
		this.name = name;
		this.log = logger.extend('TimelineLoader:' + name);

		this.events = new EventStore(name);

		// update the timeline when there are new events
		this.events.onEvent.subscribe(this.throttleUpdateTimeline.bind(this));
		this.events.onDelete.subscribe(this.throttleUpdateTimeline.bind(this));
		this.events.onClear.subscribe(this.throttleUpdateTimeline.bind(this));
	}

	private throttleUpdateTimeline = _throttle(this.updateTimeline, 10);
	private updateTimeline() {
		if (this.eventFilter) {
			const filter = this.eventFilter;
			this.timeline.next(
				this.events.getSortedEvents().filter((e) => filter(e, this.events)),
			);
		} else this.timeline.next(this.events.getSortedEvents());
	}
	private handleEvent(event: NostrEvent, _cache = true) {
		// if this is a replaceable event, mirror it over to the replaceable event service
		if (isReplaceable(event.kind)) replaceableEventsService.handleEvent(event);
		if (!matchFilters(this.filters, event)) return;

		this.events.addEvent(event);
		// if (cache) localRelay.publish(event);
	}
	private handleChunkFinished() {
		this.updateLoading();
		this.updateComplete();
	}

	private chunkLoaderSubs: ZenObservable.Subscription[] = [];
	private createChunkLoader() {
		if (this.chunkLoader) return;
		if (!this.relay) throw new Error('Relay not set');
		if (this.filters.length === 0) throw new Error('Filters not set');

		this.chunkLoader = new ChunkedRequest(
			this.relay.url,
			this.filters,
			this.log.extend('ChunkedRequest'),
		);
		this.events.connect(this.chunkLoader.events);
		const subs = this.chunkLoaderSubs;
		subs.push(
			this.chunkLoader.onChunkFinish.subscribe(
				this.handleChunkFinished.bind(this),
			),
		);
	}
	private destroyChunkLoader() {
		if (!this.chunkLoader) return;

		this.chunkLoader.cleanup();
		this.events.disconnect(this.chunkLoader.events);
		for (const sub of this.chunkLoaderSubs) sub.unsubscribe();
		this.chunkLoaderSubs = [];
		this.chunkLoader = null;
	}

	private subscriptionSub: ZenObservable.Subscription | null = null;
	private openSubscription() {
		if (this.subscription) return;
		if (!this.relay) throw new Error('Relay not set');
		if (this.filters.length === 0) throw new Error('Filters not set');

		this.subscription = new NostrSubscription(this.relay.url, this.filters);
		this.subscriptionSub = this.subscription.onEvent.subscribe((e) =>
			this.handleEvent(e),
		);
		this.subscription.open();
	}
	private closeSubscription() {
		if (!this.subscription) return;

		this.subscriptionSub?.unsubscribe();
		this.subscription.close();
		this.subscription = this.subscriptionSub = null;
	}

	start() {
		if (this.running) return;
		this.log('Starting');
		this.running = true;
		this.createChunkLoader();
		this.openSubscription();
		// NOTE: disabled until cached events can be tagged by relay
		// this.loadEventsFromCache();
	}
	stop() {
		if (!this.running) return;
		this.log('Stopping');
		this.running = false;
		this.destroyChunkLoader();
		this.closeSubscription();
	}

	// loadEventsFromCache(filters: Filter[] = this.filters) {
	// 	if (filters.length > 0) {
	// 		relayRequest(localRelay, filters).then((events) => {
	// 			for (const e of events) this.handleEvent(e, false);
	// 		});
	// 	}
	// }

	setRelay(url: string | URL) {
		this.log('Setting relay', url);
		this.relay = relayPoolService.requestRelay(url);
	}
	setFilters(filters: Filter[]) {
		this.log('Setting filters', filters);
		this.filters = filters;
	}
	setEventFilter(filter?: EventFilter) {
		this.eventFilter = filter;
		this.updateTimeline();
	}
	setCursor(cursor: number) {
		this.cursor = cursor;
		this.triggerChunkLoad();
	}

	triggerChunkLoad() {
		if (!this.chunkLoader) return;
		let triggeredLoad = false;
		if (this.chunkLoader.complete || this.chunkLoader.loading) return;
		const event = this.chunkLoader.getLastEvent(
			this.loadNextBlockBuffer,
			this.eventFilter,
		);
		if (!event || event.created_at >= this.cursor) {
			this.chunkLoader.loadNextChunk();
			triggeredLoad = true;
		}
		if (triggeredLoad) this.updateLoading();
	}
	loadAllNextChunks() {
		if (!this.chunkLoader) return;
		let triggeredLoad = false;
		if (this.chunkLoader.complete || this.chunkLoader.loading) return;
		this.chunkLoader.loadNextChunk();
		triggeredLoad = true;
		if (triggeredLoad) this.updateLoading();
	}

	private updateLoading() {
		if (this.chunkLoader && this.chunkLoader.loading !== this.loading.value)
			this.loading.next(this.chunkLoader.loading);
		else this.loading.next(false);
	}
	private updateComplete() {
		if (this.chunkLoader && this.chunkLoader.complete !== this.complete.value)
			this.complete.next(this.chunkLoader.complete);
		else this.complete.next(false);
	}

	forgetEvents() {
		this.events.clear();
		this.timeline.next([]);
	}
	reset() {
		this.cursor = dayjs().unix();
		this.destroyChunkLoader();
		this.forgetEvents();
	}

	/** close the subscription and remove any event listeners for this timeline */
	cleanup() {
		this.closeSubscription();
		this.destroyChunkLoader();
		this.events.cleanup();
	}
}
