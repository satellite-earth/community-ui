import {
	ControlMessage,
	ControlResponse,
	DatabaseStats,
	ReceiverStatus,
} from '@satellite-earth/core/types/control-api.js';
import { PrivateNodeConfig } from '@satellite-earth/core/types/private-node-config.js';

import Subject, { PersistentSubject } from './subject';
import PrivateNode from './private-node';

export default class PrivateNodeControlApi {
	node: PrivateNode;

	logs = new PersistentSubject<string[]>([]);
	config = new Subject<PrivateNodeConfig>();
	databaseStats = new Subject<DatabaseStats>();
	receiverStatus = new Subject<ReceiverStatus>();

	constructor(node: PrivateNode) {
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
					this.logs.next([...this.logs.value, response[3]]);
					break;
				case 'CLEAR':
					this.logs.next([]);
					break;
			}
		}
	}

	send(message: ControlMessage) {
		this.node.send(JSON.stringify(message));
	}
}
