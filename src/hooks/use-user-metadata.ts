import { useMemo } from 'react';

import { RequestOptions } from '../services/replaceable-events';
import userMetadataService from '../services/user-metadata';
import useSubject from './use-subject';
import { useReadRelays } from './use-client-relays';

export default function useUserMetadata(
	pubkey?: string,
	additionalRelays: Iterable<string> = [],
	opts: RequestOptions = {},
) {
	const relays = useReadRelays(additionalRelays);

	const subject = useMemo(
		() =>
			pubkey
				? userMetadataService.requestMetadata(pubkey, relays, opts)
				: undefined,
		[pubkey, relays],
	);
	const metadata = useSubject(subject);

	return metadata;
}
