import { NostrEvent } from 'nostr-tools';

export function getGroupId(group: NostrEvent) {
	const id = group.tags.find((t) => t[0] === 'd')?.[1];
	if (!id) throw new Error('Group missing id');
	return id;
}

export function getGroupName(group: NostrEvent) {
	return group.tags.find((t) => t[0] === 'name')?.[1];
}
