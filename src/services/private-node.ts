import { Relay } from 'nostr-tools';
import { logger } from '../helpers/debug';

const log = logger.extend('private-node');

export function setPrivateNodeURL(url: string) {
	localStorage.setItem('private-node-url', url);
	location.reload();
}
export function resetPrivateNodeURL() {
	localStorage.removeItem('private-node-url');
	location.reload();
}

let privateNode: Relay | null = null;

if (window.satellite) {
	log('Using URL from window.satellite');
	privateNode = new Relay(await window.satellite.getLocalRelay());
} else if (localStorage.getItem('private-node-url')) {
	log('Using URL from localStorage');
	privateNode = new Relay(localStorage.getItem('private-node-url')!);
} else {
	log('Unable to find private node URL');
}

privateNode?.connect();

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.privateNode = privateNode;
}

export default privateNode;
