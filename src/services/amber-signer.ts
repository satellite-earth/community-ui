import { EventTemplate, NostrEvent, VerifiedEvent, getEventHash, nip19 } from 'nostr-tools';

import createDefer, { Deferred } from '../classes/deferred';
import { getPubkeyFromDecodeResult, isHexKey } from '../helpers/nip19';
import { alwaysVerify } from './verify-event';

export function createGetPublicKeyIntent() {
	return `intent:#Intent;scheme=nostrsigner;S.compressionType=none;S.returnType=signature;S.type=get_public_key;end`;
}
export function createSignEventIntent(draft: EventTemplate) {
	return `intent:${encodeURIComponent(
		JSON.stringify(draft),
	)}#Intent;scheme=nostrsigner;S.compressionType=none;S.returnType=signature;S.type=sign_event;end`;
}
export function createNip04EncryptIntent(pubkey: string, plainText: string) {
	return `intent:${encodeURIComponent(
		plainText,
	)}#Intent;scheme=nostrsigner;S.pubKey=${pubkey};S.compressionType=none;S.returnType=signature;S.type=nip04_encrypt;end`;
}
export function createNip04DecryptIntent(pubkey: string, data: string) {
	return `intent:${encodeURIComponent(
		data,
	)}#Intent;scheme=nostrsigner;S.pubKey=${pubkey};S.compressionType=none;S.returnType=signature;S.type=nip04_decrypt;end`;
}

let pendingRequest: Deferred<string> | null = null;

function rejectPending() {
	if (pendingRequest) {
		pendingRequest.reject('Canceled');
		pendingRequest = null;
	}
}

function onVisibilityChange() {
	if (document.visibilityState === 'visible') {
		if (!pendingRequest || !navigator.clipboard) return;

		// read the result from the clipboard
		setTimeout(() => {
			navigator.clipboard
				.readText()
				.then((result) => pendingRequest?.resolve(result))
				.catch((e) => pendingRequest?.reject(e));
		}, 200);
	}
}
document.addEventListener('visibilitychange', onVisibilityChange);

async function intentRequest(intent: string) {
	rejectPending();
	const request = createDefer<string>();
	window.open(intent, '_blank');
	// NOTE: wait 500ms before setting the pending request since the visibilitychange event fires as soon as window.open is called
	setTimeout(() => {
		pendingRequest = request;
	}, 500);
	const result = await request;
	if (result.length === 0) throw new Error('Empty clipboard');
	return result;
}

async function getPublicKey() {
	const result = await intentRequest(createGetPublicKeyIntent());
	if (isHexKey(result)) return result;
	else if (result.startsWith('npub') || result.startsWith('nprofile')) {
		const decode = nip19.decode(result);
		const pubkey = getPubkeyFromDecodeResult(decode);
		if (!pubkey) throw new Error('Expected npub from clipboard');
		return pubkey;
	}
	throw new Error('Expected clipboard to have pubkey');
}

async function signEvent(draft: EventTemplate & { pubkey: string }): Promise<VerifiedEvent> {
	const draftWithId = { ...draft, id: getEventHash(draft) };
	const sig = await intentRequest(createSignEventIntent(draftWithId));
	if (!sig.match(/^[0-9a-f]+$/i)) throw new Error('Expected hex signature');

	const event: NostrEvent = { ...draftWithId, sig };
	if (!alwaysVerify(event)) throw new Error('Invalid signature');
	return event;
}

async function nip04Encrypt(pubkey: string, plaintext: string): Promise<string> {
	const data = await intentRequest(createNip04EncryptIntent(pubkey, plaintext));
	return data;
}
async function nip04Decrypt(pubkey: string, data: string): Promise<string> {
	const plaintext = await intentRequest(createNip04DecryptIntent(pubkey, data));
	return plaintext;
}

const amberSignerService = {
	supported: navigator.userAgent.includes('Android') && navigator.clipboard && navigator.clipboard.readText,
	getPublicKey,
	signEvent,
	nip04Encrypt,
	nip04Decrypt,
};

if (import.meta.env.DEV) {
	// @ts-ignore
	window.amberSignerService = amberSignerService;
}

export default amberSignerService;
