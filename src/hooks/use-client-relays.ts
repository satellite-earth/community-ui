import RelaySet from '../classes/relay-set';

const localNode = RelaySet.from(['ws://1270.0.0.1:2012']);
export function useReadRelays(_additional?: Iterable<string>) {
	return localNode;
}
