import { ControlMessage, ControlResponse } from '@satellite-earth/core/types/control-api/index.d.ts';
import { PrivateNodeConfig } from '@satellite-earth/core/types/private-node-config.js';
import { DatabaseStats } from '@satellite-earth/core/types/control-api/database.js';
import { ReceiverStatus } from '@satellite-earth/core/types/control-api/receiver.js';
import { DMStats } from '@satellite-earth/core/types/control-api/direct-messages.js';

import Subject, { PersistentSubject } from './subject';
import PersonalNode from './personal-node';

const MAX_LOG_LINES = 200;

export default class PersonalNodeControlApi {
	node: PersonalNode;

	logs = new PersistentSubject<string[]>([]);
	config = new Subject<PrivateNodeConfig>();
	databaseStats = new Subject<DatabaseStats>();
	receiverStatus = new Subject<ReceiverStatus>();
	directMessageStats = new Subject<DMStats>();
	vapidKey = new Subject<string>();

	constructor(node: PersonalNode) {
		this.node = node;

		this.node.authenticated.subscribe((authenticated) => {
			if (authenticated) {
				this.node.sendControlMessage(['CONTROL', 'LOG', 'SUBSCRIBE']);
				this.node.sendControlMessage(['CONTROL', 'CONFIG', 'SUBSCRIBE']);
				this.node.sendControlMessage(['CONTROL', 'RECEIVER', 'SUBSCRIBE']);
				this.node.sendControlMessage(['CONTROL', 'DATABASE', 'SUBSCRIBE']);
			}
		});

		this.node.onControlResponse.subscribe(this.handleControlResponse.bind(this));
	}

	handleControlResponse(response: ControlResponse) {
		if (response[1] === 'CONFIG' && response[2] === 'CHANGED') {
			this.config.next(response[3]);
		} else if (response[1] === 'DATABASE' && response[2] === 'STATS') {
			this.databaseStats.next(response[3]);
		} else if (response[1] === 'RECEIVER' && response[2] === 'STATUS') {
			this.receiverStatus.next(response[3]);
		} else if (response[1] === 'LOG') {
			switch (response[2]) {
				case 'LINE':
					const newArr = [...this.logs.value, response[3]];
					while (newArr.length >= MAX_LOG_LINES) {
						newArr.shift();
					}
					this.logs.next(newArr);
					break;
				case 'CLEAR':
					this.logs.next([]);
					break;
			}
		} else if (response[1] === 'DM' && response[2] === 'STATS') {
			this.directMessageStats.next(response[3]);
		} else if (response[1] === 'NOTIFICATIONS' && response[2] === 'VAPID-KEY') {
			this.vapidKey.next(response[3]);
		}
	}

	send(message: ControlMessage) {
		if (this.node.connected) this.node.send(JSON.stringify(message));
	}

	async setConfigField(field: keyof PrivateNodeConfig, value: any) {
		if (this.config.value === undefined) throw new Error('Config not synced');

		await this.send(['CONTROL', 'CONFIG', 'SET', field, value]);

		return new Promise<PrivateNodeConfig>((res) => {
			const sub = this.config.subscribe((config) => {
				res(config);
				sub.unsubscribe();
			});
		});
	}

	/*
	async addExplicitRelay(relay: string | URL) {
		const url = new URL(relay).toString();

		if (this.config.value?.relays.some((r) => r.url === url)) return;

		await this.setConfigField('relays', [...(this.config.value?.relays ?? []), { url }]);
	}
	async removeExplicitRelay(relay: string | URL) {
		await this.setConfigField(
			'relays',
			this.config.value?.relays.filter((r) => r.url !== relay.toString()),
		);
	}
	async addPubkey(pubkey: string) {
		if (this.config.value?.pubkeys.some((p) => p === pubkey)) return;
		await this.setConfigField('pubkeys', [...(this.config.value?.pubkeys ?? []), pubkey]);
	}
	async removePubkey(pubkey: string) {
		await this.setConfigField(
			'pubkeys',
			this.config.value?.pubkeys.filter((p) => p !== pubkey),
		);
	}
	*/
}
