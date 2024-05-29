import { NostrEvent } from 'nostr-tools';
import { AbstractRelay } from 'nostr-tools/abstract-relay';

import useTimelineLoader from './use-timeline-loader';
import { CHANNEL_KIND } from '../helpers/nostr/channel';
import useSubject from './use-subject';

export default function useCommunityChannels(community: NostrEvent, relay: AbstractRelay) {
	const timeline = useTimelineLoader(`${community.pubkey}-channels`, [{ kinds: [CHANNEL_KIND] }], relay);
	const channels = useSubject(timeline.timeline);

	return { channels, timeline };
}
