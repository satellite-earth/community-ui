import { NostrEvent, Subscription, kinds } from 'nostr-tools';

import ControlledObservable from '../classes/controlled-observable';
import communityRelaysService from './community-relays';

class CommunityDeleteStreams {
	streams = new Map<string, ControlledObservable<NostrEvent>>();
	subscriptions = new Map<string, Subscription>();

	getStream(pubkey: string) {
		let stream = this.streams.get(pubkey);
		if (stream) return stream;

		stream = new ControlledObservable<NostrEvent>();
		const sub = communityRelaysService.getRelay(pubkey).subscribe([{ kinds: [kinds.EventDeletion], limit: 10 }], {
			onevent: (event) => {
				stream?.next(event);
			},
			onclose: () => {
				// TODO: reconnect
			},
		});
		this.streams.set(pubkey, stream);
		this.subscriptions.set(pubkey, sub);
		return stream;
	}
	closeStream(pubkey: string) {
		this.streams.delete(pubkey);
		const sub = this.subscriptions.get(pubkey);
		if (sub && !sub.closed) sub.close();
	}
}

const communityDeleteStreams = new CommunityDeleteStreams();

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.communityDeleteStreams = communityDeleteStreams;
}

export default communityDeleteStreams;
