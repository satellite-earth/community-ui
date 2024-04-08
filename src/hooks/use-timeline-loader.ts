import { useEffect, useMemo } from 'react';
import { Filter } from 'nostr-tools';

import timelineCacheService from '../services/timeline-cache';
import { EventFilter } from '../classes/timeline-loader';
import { stringifyFilter } from '../helpers/nostr/filter';

type Options = {
	eventFilter?: EventFilter;
	cursor?: number;
};

export default function useTimelineLoader(
	key: string,
	filters: Filter[] | undefined,
	relay: string,
	opts?: Options,
) {
	const timeline = useMemo(
		() => timelineCacheService.createTimeline(key),
		[key],
	);

	useEffect(() => {
		if (filters) {
			if (relay) timeline.setRelay(relay);
			timeline.setFilters(filters);
			timeline.start();
		} else timeline.stop();
	}, [timeline, filters && stringifyFilter(filters), relay]);

	// update event filter
	useEffect(() => {
		timeline.setEventFilter(opts?.eventFilter);
	}, [timeline, opts?.eventFilter]);

	// update cursor
	useEffect(() => {
		if (opts?.cursor !== undefined) {
			timeline.setCursor(opts.cursor);
		}
	}, [timeline, opts?.cursor]);

	return timeline;
}
