// import { CacheRelay, openDB } from 'nostr-idb';
// import { logger } from '../helpers/debug';
// import { Relay } from 'nostr-tools';

// const log = logger.extend(`LocalRelay`);
// export const localDatabase = await openDB();

// // Setup relay
// function createInternalRelay() {
// 	return new CacheRelay(localDatabase, { maxEvents: 10000 });
// }

// async function connectRelay() {
// 	try {
// 		// TODO: don't hardcore local node address
// 		return await Relay.connect('ws://127.0.0.1:2012');
// 	} catch (e) {
// 		log('Failed to connect to local relay, falling back to internal');
// 		return createInternalRelay();
// 	}
// }

// export const localRelay = await connectRelay();

// // keep the relay connection alive
// setInterval(() => {
// 	if (!localRelay.connected)
// 		localRelay.connect().then(() => log('Reconnected'));
// }, 1000 * 5);

// if (import.meta.env.DEV) {
// 	//@ts-ignore
// 	window.localDatabase = localDatabase;
// 	//@ts-ignore
// 	window.localRelay = localRelay;
// }
