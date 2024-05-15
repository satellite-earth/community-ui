import { verifyEvent } from 'nostr-tools';
import { setNostrWasm, verifyEvent as wasmVerifyEvent } from 'nostr-tools/wasm';
import { logger } from '../helpers/debug';

const localStorageKey = 'verify-event-method';

const log = logger.extend('VerifyEvent');
let selectedMethod = 'wasm';
let verifyEventMethod: typeof verifyEvent;
let alwaysVerify: typeof verifyEvent;

function loadWithTimeout() {
	return new Promise<typeof verifyEvent>((res, rej) => {
		const timeout = setTimeout(() => {
			log('Timeout');
			rej(new Error('Timeout'));
		}, 5_000);

		return import('nostr-wasm').then(({ initNostrWasm }) => {
			log('Initializing WebAssembly');

			return initNostrWasm().then((nw) => {
				clearTimeout(timeout);
				setNostrWasm(nw);
				res(wasmVerifyEvent);
				return wasmVerifyEvent;
			});
		});
	});
}

try {
	selectedMethod = localStorage.getItem(localStorageKey) ?? 'wasm';

	switch (selectedMethod) {
		case 'wasm':
			if (!('WebAssembly' in window)) throw new Error('WebAssembly not supported');
			log('Loading WebAssembly module');
			verifyEventMethod = alwaysVerify = await loadWithTimeout();
			log('Loaded');
			break;
		case 'internal':
		default:
			log('Using internal nostr-tools');
			verifyEventMethod = alwaysVerify = verifyEvent;
			break;
	}
} catch (error) {
	console.error('Failed to initialize event verification method, disabling');
	console.log(error);

	localStorage.setItem(localStorageKey, 'none');
	verifyEventMethod = alwaysVerify = verifyEvent;
}

export { alwaysVerify, selectedMethod };
export default verifyEventMethod;
