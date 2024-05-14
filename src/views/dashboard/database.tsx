import { useCallback } from 'react';
import { NostrEvent } from 'nostr-tools';
import { Flex } from '@chakra-ui/react';

import useSubject from '../../hooks/use-subject';
import privateNode, { controlApi } from '../../services/private-node';
import Panel from '../../components/dashboard/panel';
import { formatDataSize } from '../../helpers/number';
import TextButton from '../../components/dashboard/text-button';
import ImportEventsButton from '../../components/dashboard/import-events-button';

export default function DatabasePanel() {
	const status = useSubject(controlApi?.databaseStats);
	const importEvent = useCallback(async (event: NostrEvent) => privateNode?.publish(event), []);

	if (!status) return;

	return (
		<Panel label="DATABASE">
			<Flex justifyContent="space-between">
				<div>DATABASE SIZE</div>
				<div>{formatDataSize(status.size ?? 0)}</div>
			</Flex>
			<Flex justifyContent="space-between">
				<div>EVENTS COUNT</div>
				<div>{status.count}</div>
			</Flex>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					marginTop: 24,
					justifyContent: 'right',
					gap: '12px',
				}}
			>
				<TextButton onClick={() => privateNode?.clearDatabase()}>[CLEAR]</TextButton>
				<ImportEventsButton onEvent={importEvent} />
				<TextButton onClick={() => privateNode?.exportDatabase()}>[EXPORT]</TextButton>
			</div>
		</Panel>
	);
}
