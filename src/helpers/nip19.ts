import { getPublicKey, nip19 } from 'nostr-tools';
import { safeRelayUrls } from './relay';

export function isHexKey(str?: string) {
	if (str?.match(/^[0-9a-f]{64}$/i)) return true;
	return false;
}

export function safeDecode(str: string) {
	try {
		const result = nip19.decode(str);
		if (
			(result.type === 'nevent' ||
				result.type === 'nprofile' ||
				result.type === 'naddr') &&
			result.data.relays
		)
			result.data.relays = safeRelayUrls(result.data.relays);
		return result;
	} catch (e) {}
}

export function getPubkeyFromDecodeResult(result?: nip19.DecodeResult) {
	if (!result) return;
	switch (result.type) {
		case 'naddr':
		case 'nprofile':
			return result.data.pubkey;
		case 'npub':
			return result.data;
		case 'nsec':
			return getPublicKey(result.data);
	}
}

export function normalizeToHexPubkey(hex: string) {
	if (isHexKey(hex)) return hex;
	const decode = safeDecode(hex);
	if (!decode) return null;
	return getPubkeyFromDecodeResult(decode) ?? null;
}

export function encodeDecodeResult(result: nip19.DecodeResult) {
	switch (result.type) {
		case 'naddr':
			return nip19.naddrEncode(result.data);
		case 'nprofile':
			return nip19.nprofileEncode(result.data);
		case 'nevent':
			return nip19.neventEncode(result.data);
		case 'nrelay':
			return nip19.nrelayEncode(result.data);
		case 'nsec':
			return nip19.nsecEncode(result.data);
		case 'npub':
			return nip19.npubEncode(result.data);
		case 'note':
			return nip19.noteEncode(result.data);
	}
}

/** get nip19.DecodeResult from a e,a, or p tag */
export function getPointerFromTag(tag: string[]): nip19.DecodeResult | null {
	if (tag[0] === 'e') {
		if (!tag[1]) return null;
		return {
			type: 'nevent',
			data: {
				id: tag[1],
				relays: tag[2] ? [tag[2]] : undefined,
			},
		};
	} else if (tag[0] === 'a') {
		const [_, coordinate, relay] = tag;
		const parts = coordinate.split(':') as (string | undefined)[];
		const kind = parts[0] && parseInt(parts[0]);
		const pubkey = parts[1];
		const d = parts[2];

		if (!kind) return null;
		if (!pubkey) return null;
		if (!d) return null;

		return {
			type: 'naddr',
			data: {
				kind,
				pubkey,
				identifier: d,
				relays: relay ? [relay] : undefined,
			},
		};
	} else if (tag[0] === 'p') {
		const [_, pubkey, relay] = tag;
		if (!pubkey) return null;
		return {
			type: 'nprofile',
			data: { pubkey, relays: relay ? [relay] : undefined },
		};
	}
	return null;
}
