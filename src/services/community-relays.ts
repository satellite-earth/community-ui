import { Relay } from 'nostr-tools';
import relayPoolService from './relay-pool';
import privateNode from './private-node';

const relays = new Map<string, Relay>();

function getRelay(pubkey: string) {
	// TODO: find a more graceful way to require private node
	if (!privateNode) throw new Error('Missing private node');

	const relay = relays.get(pubkey);
	if (relay) {
		return relay;
	} else {
		const r = relayPoolService.requestRelay(new URL(pubkey, privateNode.url), false);
		relays.set(pubkey, r);
		return r;
	}
}
function closeRelay(pubkey: string) {
	const relay = relays.get(pubkey);
	// if (relay) relayPoolService.removeRelay(relay.url);
}

const communityRelaysService = {
	getRelay,
	closeRelay,
};

if (import.meta.env.DEV) {
	// @ts-ignore
	window.communityRelaysService = communityRelaysService;
}

export default communityRelaysService;
