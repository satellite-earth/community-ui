import { PersistentSubject } from '../classes/subject';

const communities = new PersistentSubject<string[]>([]);

function addCommunity(pubkey: string) {
	communities.next([...communities.value, pubkey]);
}

const communitiesService = {
	communities,
	addCommunity,
};

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.communitiesService = communitiesService;
}

export default communitiesService;
