import { NostrEvent, Relay } from 'nostr-tools';

import Subject, { PersistentSubject } from '../classes/subject';
import privateNode from './private-node';
import relayPoolService from './relay-pool';

class CommunitiesService {
	communities = new PersistentSubject<NostrEvent[]>([]);

	community = new Subject<NostrEvent>();
	relay = new Subject<Relay>();

	constructor() {
		this.communities.subscribe((v) => localStorage.setItem('communities', JSON.stringify(v)));

		const cached = localStorage.getItem('communities');
		if (cached) {
			try {
				const arr = JSON.parse(cached);
				this.communities.next(arr.filter((e: string | NostrEvent) => typeof e === 'object'));
			} catch (e) {}
		}
	}

	addCommunity(community: NostrEvent) {
		this.communities.next([...this.communities.value, community]);
	}

	switch(pubkey: string) {
		const community = this.communities.value.find((e) => (e.pubkey = pubkey));
		if (!community) return;

		this.community.next(community);
		this.relay.next(relayPoolService.getRelay(new URL(community.pubkey, privateNode?.url))!);
	}
}

const communitiesService = new CommunitiesService();

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.communitiesService = communitiesService;
}

export default communitiesService;
