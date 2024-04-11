import { useMemo } from 'react';

import { useReadRelays } from './use-client-relays';
import replaceableEventsService, { RequestOptions } from '../services/replaceable-events';
import useSubject from './use-subject';

export default function useReplaceableEvent(
	cord:
		| {
				kind: number;
				pubkey: string;
				identifier?: string;
				relays?: string[];
		  }
		| undefined,
	additionalRelays?: Iterable<string>,
	opts: RequestOptions = {},
) {
	const readRelays = useReadRelays(additionalRelays);
	const sub = useMemo(() => {
		if (!cord) return;
		return replaceableEventsService.requestEvent(
			cord.relays ? [...readRelays, ...cord.relays] : readRelays,
			cord.kind,
			cord.pubkey,
			cord.identifier,
			opts,
		);
	}, [cord, readRelays.urls.join('|'), opts?.alwaysRequest, opts?.ignoreCache]);

	return useSubject(sub);
}
