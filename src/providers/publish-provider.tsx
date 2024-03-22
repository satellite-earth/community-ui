import {
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useMemo,
} from 'react';
import { useToast } from '@chakra-ui/react';
import { EventTemplate, NostrEvent } from 'nostr-tools';

import { useSigningContext } from './signing-provider';
import RelaySet from '../classes/relay-set';
import clientRelaysService from '../services/client-relays';
import { localRelay } from '../services/local-relay';
import { isReplaceable } from '../helpers/nostr/event';
import replaceableEventsService from '../services/replaceable-events';
import relayPoolService from '../services/relay-pool';

type PublishContextType = {
	publishEvent(
		event: EventTemplate | NostrEvent,
		quite?: boolean,
	): Promise<void>;
};
export const PublishContext = createContext<PublishContextType>({
	publishEvent: async () => {
		throw new Error('Publish provider not setup');
	},
});

export function usePublishEvent() {
	return useContext(PublishContext).publishEvent;
}

export default function PublishProvider({ children }: PropsWithChildren) {
	const toast = useToast();
	const { requestSignature } = useSigningContext();

	const publishEvent = useCallback<PublishContextType['publishEvent']>(
		async (event: EventTemplate | NostrEvent, quite = true) => {
			try {
				const relays = RelaySet.from([clientRelaysService.community.value]);

				let signed: NostrEvent;
				if (!Object.hasOwn(event, 'sig')) {
					signed = await requestSignature(event as EventTemplate);
				} else signed = event as NostrEvent;

				for (const relay of relays) {
					relayPoolService.requestRelay(relay).send(['EVENT', signed]);
				}

				// send it to the local relay
				localRelay.publish(signed);

				// pass it to other services
				if (isReplaceable(signed.kind))
					replaceableEventsService.handleEvent(signed);
			} catch (e) {
				if (e instanceof Error)
					toast({ description: e.message, status: 'error' });
				if (!quite) throw e;
			}
		},
		[toast, requestSignature],
	);

	const context = useMemo<PublishContextType>(
		() => ({
			publishEvent,
		}),
		[publishEvent],
	);

	return (
		<PublishContext.Provider value={context}>
			{children}
		</PublishContext.Provider>
	);
}
