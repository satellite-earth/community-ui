import communitiesService from '../services/communities';
import useSubject from './use-subject';

export default function useCurrentCommunity() {
	const community = useSubject(communitiesService.community);
	const relay = useSubject(communitiesService.relay);
	if (!community || !relay) throw new Error('No community selected');
	return { community, relay };
}
