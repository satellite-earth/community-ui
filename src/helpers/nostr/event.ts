import { NostrEvent, kinds } from 'nostr-tools';

export function isReplaceable(kind: number) {
	return (
		kinds.isReplaceableKind(kind) || kinds.isParameterizedReplaceableKind(kind)
	);
}

export function sortByDate(a: NostrEvent, b: NostrEvent) {
	return b.created_at - a.created_at;
}

export function getEventCoordinate(event: NostrEvent) {
	const d = event.tags.find((t) => t[0] === 'd')?.[1];
	return d
		? `${event.kind}:${event.pubkey}:${d}`
		: `${event.kind}:${event.pubkey}`;
}
