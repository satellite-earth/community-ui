import { NostrEvent } from 'nostr-tools';
import { PropsWithChildren, createContext, useContext } from 'react';

const CommunityContext = createContext<NostrEvent | null>(null);

export function useCommunityContext() {
	return useContext(CommunityContext);
}

export default function CommunityContextProvider({
	community,
	children,
}: PropsWithChildren<{ community: NostrEvent }>) {
	return <CommunityContext.Provider value={community}>{children}</CommunityContext.Provider>;
}
