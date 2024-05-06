import { useMemo } from 'react';

import privateNode from '../services/private-node';
import RelaySet, { RelaySetFrom } from '../classes/relay-set';

export function useWithLocalRelay(additional: RelaySetFrom) {
	return useMemo(() => {
		const set = RelaySet.from(additional);
		if (privateNode) set.add(privateNode);
		return set;
	}, [additional]);
}
