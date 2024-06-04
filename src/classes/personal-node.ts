import { EventTemplate, Relay, VerifiedEvent } from 'nostr-tools';
import { ControlMessage, ControlResponse } from '@satellite-earth/core/types/control-api/index.d.ts';

import createDefer, { Deferred } from './deferred';
import { logger } from '../helpers/debug';
import ControlledObservable from './controlled-observable';
import Subject, { PersistentSubject } from './subject';

export default class PersonalNode extends Relay {
	log = logger.extend('PrivateNode');
	authenticated = new PersistentSubject(false);
	onControlResponse = new ControlledObservable<ControlResponse>();

	sentAuthId = '';
	authPromise: Deferred<string> | null = null;

	onChallenge = new Subject<string>();

	authenticate(auth: string | ((evt: EventTemplate) => Promise<VerifiedEvent>)) {
		if (!this.connected) throw new Error('Not connected');

		if (!this.authenticated.value && !this.authPromise) {
			this.authPromise = createDefer<string>();

			// CONTROL auth
			if (typeof auth === 'string') {
				this.sendControlMessage(['CONTROL', 'AUTH', 'CODE', auth]);
				return this.authPromise;
			}

			// NIP-42 auth
			this.auth(auth)
				.then((response) => {
					this.authenticated.next(true);
					this.authPromise?.resolve(response);
					this.authPromise = null;
				})
				.catch((err) => {
					this.authPromise?.reject(err);
					this.authPromise = null;
				});
		}

		return this.authPromise;
	}

	_onauth = (challenge: string) => {
		this.onChallenge.next(challenge);
	};

	_onmessage(message: MessageEvent<string>) {
		try {
			// Parse control message(s) received from node
			const data = JSON.parse(message.data);

			switch (data[0]) {
				case 'CONTROL':
					// const payload = Array.isArray(data[1]) ? data[1] : [data[1]];
					this.handleControlResponse(data as ControlResponse);
					return;
			}
		} catch (err) {
			console.log(err);
		}

		// use default relay message handling
		super._onmessage(message);
	}

	onclose = () => {
		this.authenticated.next(false);
		// @ts-expect-error
		this.connectionPromise = undefined;
	};

	close(): void {
		super.close();

		this.authenticated.next(false);
		// @ts-expect-error
		this.connectionPromise = undefined;
	}

	// Send control message to node
	sendControlMessage(message: ControlMessage) {
		return this.send(JSON.stringify(message));
	}

	// handle control response
	handleControlResponse(response: ControlResponse) {
		switch (response[1]) {
			case 'AUTH':
				if (response[2] === 'SUCCESS') {
					this.authenticated.next(true);
					this.authPromise?.resolve('Success');
				} else if (response[2] === 'INVALID') {
					this.authPromise?.reject(new Error(response[3]));
				}
				this.authPromise = null;
				break;
			default:
				this.onControlResponse.next(response);
				break;
		}
	}

	/** @deprecated use controlApi instead */
	clearDatabase() {
		this.sendControlMessage(['CONTROL', 'DATABASE', 'CLEAR']);
	}
	/** @deprecated use controlApi instead */
	exportDatabase() {
		this.sendControlMessage(['CONTROL', 'DATABASE', 'EXPORT']);
	}
}
