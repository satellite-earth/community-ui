import RelayPool from '../classes/relay-pool';

const relayPoolService = new RelayPool();

if (import.meta.env.DEV) {
	// @ts-ignore
	window.relayPoolService = relayPoolService;
}

export default relayPoolService;
