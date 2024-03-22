import { safeRelayUrl } from '../helpers/relay';
import relayPoolService from '../services/relay-pool';

export default class RelaySet extends Set<string> {
	get urls() {
		return Array.from(this);
	}
	getRelays() {
		return this.urls.map((url) => relayPoolService.requestRelay(url, false));
	}

	clone() {
		return new RelaySet(this);
	}
	merge(src: Iterable<string>): this {
		for (const url of src) this.add(url);
		return this;
	}

	static from(...sources: (Iterable<string> | undefined)[]) {
		const set = new RelaySet();
		for (const src of sources) {
			if (!src) continue;
			for (const url of src) {
				const safe = safeRelayUrl(url);
				if (safe) set.add(safe);
			}
		}
		return set;
	}
}
