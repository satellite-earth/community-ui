import { Relay } from 'nostr-tools';
import relayPoolService from './relay-pool';

const relays = new Map<string, Relay>();

function getRelay(pubkey: string) {
	const relay = relays.get(pubkey);
	if (relay) {
		return relay;
	} else {
		const r = relayPoolService.requestRelay(`ws://127.0.0.1:2012/${pubkey}`, false);
		relays.set(pubkey, r);
		return r;
	}
}
function closeRelay(pubkey: string) {
	const relay = relays.get(pubkey);
	if (relay) relayPoolService.removeRelay(relay.url);
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
