import { kinds } from 'nostr-tools';
import _throttle from 'lodash.throttle';

import { Kind0ParsedContent, parseKind0Event } from '../helpers/nostr/user-metadata';
import SuperMap from '../classes/super-map';
import Subject from '../classes/subject';
import replaceableEventsService, { RequestOptions } from './replaceable-events';

class UserMetadataService {
	private metadata = new SuperMap<string, Subject<Kind0ParsedContent>>((pubkey) => {
		return replaceableEventsService.getEvent(0, pubkey).map(parseKind0Event);
	});
	getSubject(pubkey: string) {
		return this.metadata.get(pubkey);
	}
	requestMetadata(pubkey: string, relays: Iterable<string>, opts: RequestOptions = {}) {
		const subject = this.metadata.get(pubkey);
		replaceableEventsService.requestEvent(relays, kinds.Metadata, pubkey, undefined, opts);
		return subject;
	}
}

const userMetadataService = new UserMetadataService();

if (import.meta.env.DEV) {
	// @ts-ignore
	window.userMetadataService = userMetadataService;
}

export default userMetadataService;
