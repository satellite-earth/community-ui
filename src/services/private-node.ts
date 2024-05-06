import { Relay } from 'nostr-tools';
import { logger } from '../helpers/debug';

const log = logger.extend('private-node');
let privateNode: Relay | null = null;

if (window.satellite) {
	log('Using URL from window.satellite');
	privateNode = new Relay(await window.satellite.getLocalRelay());
	await privateNode.connect();
} else if (localStorage.getItem('private-node-url')) {
	log('Using URL from localStorage');
	privateNode = new Relay(localStorage.getItem('private-node-url')!);
	await privateNode.connect();
} else {
	log('Unable to find private node URL');
}

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.privateNode = privateNode;
}

export default privateNode;
