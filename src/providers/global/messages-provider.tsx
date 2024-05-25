import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { kinds } from 'nostr-tools';

import TimelineLoader from '../../classes/timeline-loader';
import useCurrentAccount from '../../hooks/use-current-account';
import useTimelineLoader from '../../hooks/use-timeline-loader';
import privateNode from '../../services/private-node';

type DMTimelineContextType = {
	timeline?: TimelineLoader;
};
const DMTimelineContext = createContext<DMTimelineContextType>({});

export function useMessagesTimeline() {
	const context = useContext(DMTimelineContext);

	if (!context?.timeline) throw new Error('No dm timeline');

	return context.timeline;
}

export default function DMTimelineProvider({ children }: PropsWithChildren) {
	const account = useCurrentAccount();

	const timeline = useTimelineLoader(
		`${account?.pubkey}-messages`,
		account?.pubkey
			? [
					{ authors: [account.pubkey], kinds: [kinds.EncryptedDirectMessage] },
					{ '#p': [account.pubkey], kinds: [kinds.EncryptedDirectMessage] },
				]
			: undefined,
		privateNode ?? undefined,
	);

	const context = useMemo(() => ({ timeline }), [timeline]);

	return <DMTimelineContext.Provider value={context}>{children}</DMTimelineContext.Provider>;
}
