import { NostrEvent } from 'nostr-tools';
import { getTagValue } from './event';

export const CHANNEL_KIND = 39000;

export function getChannelId(channel: NostrEvent) {
	const id = getTagValue(channel, 'd');
	if (!id) throw new Error('Channel missing id');
	return id;
}
export function getChannelName(channel: NostrEvent) {
	return getTagValue(channel, 'name');
}
export function getChannelAbout(channel: NostrEvent) {
	return getTagValue(channel, 'about');
}
export function getChannelPicture(channel: NostrEvent) {
	return getTagValue(channel, 'picture');
}
