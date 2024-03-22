import clientRelaysService from '../services/client-relays';
import useSubject from './use-subject';

export function useReadRelays(_additional?: Iterable<string>) {
	const set = useSubject(clientRelaysService.readRelays);
	const community = useSubject(clientRelaysService.community);
	// if (additional) return set.clone().merge(additional);
	return set.clone().add(community);
}
export function useWriteRelays(additional?: Iterable<string>) {
	const set = useSubject(clientRelaysService.writeRelays);
	if (additional) return set.clone().merge(additional);
	return set;
}
