import { nip04, getPublicKey, finalizeEvent, EventTemplate, NostrEvent } from 'nostr-tools';

import { Account } from './account';
import db from './db';
import { hexToBytes } from '@noble/hashes/utils';

const decryptedKeys = new Map<string, string>();

class SigningService {
	private async getSalt() {
		let salt = await db.get('settings', 'salt');
		if (salt) {
			return salt as Uint8Array;
		} else {
			const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
			await db.put('settings', newSalt, 'salt');
			return newSalt;
		}
	}

	private async getKeyMaterial() {
		const password = window.prompt(
			'Enter local encryption password. This password is used to keep your secret key save.',
		);
		if (!password) throw new Error('Password required');
		const enc = new TextEncoder();
		return window.crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
	}
	private async getEncryptionKey() {
		const salt = await this.getSalt();
		const keyMaterial = await this.getKeyMaterial();
		return await window.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			keyMaterial,
			{
				name: 'AES-GCM',
				length: 256,
			},
			true,
			['encrypt', 'decrypt'],
		);
	}

	async encryptSecKey(secKey: string) {
		const key = await this.getEncryptionKey();
		const encode = new TextEncoder();
		const iv = window.crypto.getRandomValues(new Uint8Array(96));

		const encrypted = await window.crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv,
			},
			key,
			encode.encode(secKey),
		);

		// add key to cache
		decryptedKeys.set(getPublicKey(hexToBytes(secKey)), secKey);

		return {
			secKey: encrypted,
			iv,
		};
	}

	async decryptSecKey(account: Account) {
		if (account.type !== 'local') throw new Error('Account dose not have a secret key');

		const cache = decryptedKeys.get(account.pubkey);
		if (cache) return cache;

		const key = await this.getEncryptionKey();
		const decode = new TextDecoder();

		try {
			const decrypted = await window.crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv: account.iv,
				},
				key,
				account.secKey,
			);
			const secKey = decode.decode(decrypted);
			decryptedKeys.set(account.pubkey, secKey);
			return secKey;
		} catch (e) {
			throw new Error('Failed to decrypt secret key');
		}
	}

	async requestSignature(draft: EventTemplate, account: Account) {
		const checkSig = (signed: NostrEvent) => {
			if (signed.pubkey !== account.pubkey) throw new Error('Signed with the wrong pubkey');
		};

		switch (account.type) {
			case 'local': {
				const secKey = await this.decryptSecKey(account);
				const tmpDraft = {
					...draft,
					pubkey: getPublicKey(hexToBytes(secKey)),
				};
				const event = finalizeEvent(tmpDraft, hexToBytes(secKey)) as NostrEvent;
				return event;
			}
			case 'extension':
				if (window.nostr) {
					const signed = await window.nostr.signEvent(draft);
					checkSig(signed);
					return signed;
				} else throw new Error('Missing nostr extension');
			default:
				throw new Error('Unknown account type');
		}
	}

	async requestDecrypt(data: string, pubkey: string, account: Account) {
		switch (account.type) {
			case 'local':
				const secKey = await this.decryptSecKey(account);
				return await nip04.decrypt(secKey, pubkey, data);
			case 'extension':
				if (window.nostr) {
					if (window.nostr.nip04) {
						return await window.nostr.nip04.decrypt(pubkey, data);
					} else throw new Error('Extension dose not support decryption');
				} else throw new Error('Missing nostr extension');
			default:
				throw new Error('Unknown account type');
		}
	}

	async requestEncrypt(text: string, pubkey: string, account: Account) {
		switch (account.type) {
			case 'local':
				const secKey = await this.decryptSecKey(account);
				return await nip04.encrypt(secKey, pubkey, text);
			case 'extension':
				if (window.nostr) {
					if (window.nostr.nip04) {
						return await window.nostr.nip04.encrypt(pubkey, text);
					} else throw new Error('Extension dose not support encryption');
				} else throw new Error('Missing nostr extension');
			default:
				throw new Error('Unknown account type');
		}
	}
}

const signingService = new SigningService();

export default signingService;
