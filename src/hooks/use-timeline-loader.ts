import { useEffect, useMemo } from 'react';
import { Filter, NostrEvent, Relay } from 'nostr-tools';

import timelineCacheService from '../services/timeline-cache';
import { EventFilter } from '../classes/timeline-loader';
import { stringifyFilter } from '../helpers/nostr/filter';
import { useCommunityContext } from '../providers/community-context';
import communityDeleteStreams from '../services/delete-events';

type Options = {
	eventFilter?: EventFilter;
	cursor?: number;
};

export default function useTimelineLoader(
	key: string,
	filters: Filter[] | undefined,
	relay: string | URL | Relay,
	opts?: Options,
) {
	const timeline = useMemo(() => timelineCacheService.createTimeline(key), [key]);
	const community = useCommunityContext();

	useEffect(() => {
		if (filters && relay) {
			timeline.setRelay(relay);
			timeline.setFilters(filters);

			// if this timeline is in the context of a community, subscribe to the delete stream
			if (community) {
				const deleteStream = communityDeleteStreams.getStream(community.pubkey);
				const extraCheck = (event: NostrEvent) => event.pubkey === community.pubkey;
				timeline.setDeleteStream(deleteStream, extraCheck);
			}

			timeline.start();
		} else timeline.stop();
	}, [timeline, filters && stringifyFilter(filters), relay, community]);

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
